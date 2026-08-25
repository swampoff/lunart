import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { db, type PaymentRow } from '../db.js';
import { paymentProvider } from '../payments/index.js';
import type { PaymentStatus } from '../payments/provider.js';
import { loadBooking } from '../serialize.js';
import { validationError } from './validation.js';

export const paymentsRouter = Router();

const createPaymentSchema = z.object({ bookingId: z.string().min(1) });

function publicUrl(path: string): string {
  const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 5173}`;
  return `${base.replace(/\/$/, '')}${path}`;
}

/** Переводит статус платежа в статус брони. Вызывается и из webhook, и из мок-страницы. */
function applyPaymentStatus(payment: PaymentRow, status: PaymentStatus): void {
  if (payment.status === 'succeeded') return; // повторное уведомление об уже оплаченном платеже

  db.transaction(() => {
    db.prepare(`UPDATE payments SET status = ?, paid_at = ? WHERE id = ?`).run(
      status,
      status === 'succeeded' ? new Date().toISOString() : null,
      payment.id,
    );

    if (status === 'succeeded') {
      db.prepare(`UPDATE bookings SET status = 'paid', hold_expires_at = NULL WHERE id = ?`).run(
        payment.booking_id,
      );
    } else if (status === 'canceled') {
      // Даты не освобождаем сразу: холд ещё действует, гость может повторить оплату.
      db.prepare(
        `UPDATE bookings SET status = 'awaiting_payment' WHERE id = ? AND status <> 'paid'`,
      ).run(payment.booking_id);
    }
  })();
}

/** Создаёт платёж на сумму предоплаты и отдаёт ссылку на страницу оплаты. */
paymentsRouter.post('/payments', async (req, res, next) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const booking = loadBooking(parsed.data.bookingId);
  if (!booking) return res.status(404).json({ error: 'not_found', message: 'Бронь не найдена' });

  if (booking.status === 'paid') {
    return res.status(409).json({ error: 'already_paid', message: 'Эта бронь уже оплачена' });
  }
  if (booking.status === 'cancelled' || booking.status === 'expired') {
    return res.status(409).json({
      error: 'booking_inactive',
      message: 'Срок брони истёк. Начните бронирование заново — даты вернулись в продажу.',
    });
  }

  // Повторное нажатие «Оплатить» не должно создавать второй платёж.
  const existing = db
    .prepare(`SELECT * FROM payments WHERE booking_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`)
    .get(booking.id) as PaymentRow | undefined;

  if (existing) {
    return res.json({
      id: existing.id,
      status: existing.status,
      amount: existing.amount,
      confirmationUrl: existing.confirmation_url,
    });
  }

  try {
    const provider = paymentProvider();
    const paymentId = nanoid(16);
    const idempotenceKey = nanoid(24);

    const result = await provider.createPayment({
      paymentId,
      bookingId: booking.id,
      amount: booking.prepayment,
      description: `Предоплата брони ${booking.id}: ${booking.apartmentTitle}, ${booking.checkIn} — ${booking.checkOut}`,
      returnUrl: publicUrl(`/booking/${booking.id}`),
      idempotenceKey,
      customerEmail: booking.guest.email,
      customerPhone: booking.guest.phone,
    });

    db.prepare(
      `INSERT INTO payments (
         id, booking_id, provider, provider_ref, status, amount,
         confirmation_url, created_at, idempotence_key
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      paymentId,
      booking.id,
      provider.name,
      result.providerRef,
      result.status,
      booking.prepayment,
      result.confirmationUrl,
      new Date().toISOString(),
      idempotenceKey,
    );

    res.status(201).json({
      id: paymentId,
      status: result.status,
      amount: booking.prepayment,
      confirmationUrl: result.confirmationUrl,
    });
  } catch (error) {
    next(error);
  }
});

/** Данные для страницы оплаты. */
paymentsRouter.get('/payments/:id', (req, res) => {
  const payment = db.prepare(`SELECT * FROM payments WHERE id = ?`).get(req.params.id) as
    | PaymentRow
    | undefined;
  if (!payment) return res.status(404).json({ error: 'not_found', message: 'Платёж не найден' });

  const booking = loadBooking(payment.booking_id);
  res.json({
    id: payment.id,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount,
    confirmationUrl: payment.confirmation_url,
    booking,
  });
});

/**
 * Подтверждение оплаты на тестовом провайдере.
 * Существует только для PAYMENT_PROVIDER=mock: с боевым эквайрингом статус
 * приходит исключительно из webhook провайдера.
 */
paymentsRouter.post('/payments/:id/simulate', (req, res) => {
  if (paymentProvider().name !== 'mock') {
    return res.status(403).json({
      error: 'not_allowed',
      message: 'Тестовое подтверждение недоступно при подключённом эквайринге',
    });
  }

  const outcome = z.object({ outcome: z.enum(['succeeded', 'canceled']) }).safeParse(req.body);
  if (!outcome.success) return validationError(res, outcome.error);

  const payment = db.prepare(`SELECT * FROM payments WHERE id = ?`).get(req.params.id) as
    | PaymentRow
    | undefined;
  if (!payment) return res.status(404).json({ error: 'not_found', message: 'Платёж не найден' });

  applyPaymentStatus(payment, outcome.data.outcome);
  res.json(loadBooking(payment.booking_id));
});

/**
 * Уведомления провайдера о смене статуса платежа.
 * Единственный источник правды об оплате: возврат гостя на сайт ничего не подтверждает.
 */
paymentsRouter.post('/payments/webhook', (req, res) => {
  const event = paymentProvider().parseWebhook(req.body);
  if (!event) return res.status(400).json({ error: 'bad_request', message: 'Неизвестное уведомление' });

  const payment = db.prepare(`SELECT * FROM payments WHERE provider_ref = ?`).get(event.providerRef) as
    | PaymentRow
    | undefined;

  // Отвечаем 200 даже на неизвестный платёж, иначе провайдер будет слать ретраи.
  if (!payment) return res.json({ received: true });

  applyPaymentStatus(payment, event.status);
  res.json({ received: true });
});
