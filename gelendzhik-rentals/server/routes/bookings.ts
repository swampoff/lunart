import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import { HOLD_MINUTES, isRangeAvailable } from '../availability.js';
import { db, rowToProperty, type PropertyRow } from '../db.js';
import { buildQuote, nightsBetween, today } from '../pricing.js';
import { loadBooking } from '../serialize.js';
import { dateSchema, validationError } from './validation.js';

export const bookingsRouter = Router();

/** Номер брони, который не стыдно продиктовать по телефону: ГЛД-A1B2C3. */
const bookingCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const staySchema = z
  .object({
    propertySlug: z.string().min(1),
    checkIn: dateSchema,
    checkOut: dateSchema,
    guests: z.coerce.number().int().min(1).max(20),
  })
  .refine((value) => value.checkOut > value.checkIn, {
    message: 'Дата выезда должна быть позже даты заезда',
    path: ['checkOut'],
  })
  .refine((value) => value.checkIn >= today(), {
    message: 'Дата заезда не может быть в прошлом',
    path: ['checkIn'],
  });

const guestSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя и фамилию').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{10,20}$/, 'Укажите телефон в формате +7 900 000-00-00'),
  email: z.string().trim().email('Проверьте адрес электронной почты').max(160),
  comment: z.string().trim().max(1000).optional(),
});

const createBookingSchema = z.object({
  stay: staySchema,
  guest: guestSchema,
});

interface StayContext {
  property: ReturnType<typeof rowToProperty>;
  error?: { status: number; body: { error: string; message: string } };
}

function resolveStay(slug: string, checkIn: string, checkOut: string, guests: number): StayContext | null {
  const row = db.prepare(`SELECT * FROM properties WHERE slug = ?`).get(slug) as PropertyRow | undefined;
  if (!row) return null;

  const property = rowToProperty(row);
  const nights = nightsBetween(checkIn, checkOut);

  if (guests > property.maxGuests) {
    return {
      property,
      error: {
        status: 400,
        body: {
          error: 'too_many_guests',
          message: `В этой квартире можно разместить не больше ${property.maxGuests} гостей`,
        },
      },
    };
  }

  if (nights < property.minNights) {
    return {
      property,
      error: {
        status: 400,
        body: {
          error: 'min_nights',
          message: `Минимальный срок проживания — ${property.minNights} ноч. Выберите даты подлиннее.`,
        },
      },
    };
  }

  return { property };
}

/** Предварительный расчёт: сколько стоит проживание и свободны ли даты. */
bookingsRouter.post('/quote', (req, res) => {
  const parsed = staySchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const { propertySlug, checkIn, checkOut, guests } = parsed.data;

  const context = resolveStay(propertySlug, checkIn, checkOut, guests);
  if (!context) return res.status(404).json({ error: 'not_found', message: 'Объект не найден' });
  if (context.error) return res.status(context.error.status).json(context.error.body);

  const { property } = context;
  const available = isRangeAvailable(property.id, checkIn, checkOut);

  res.json({
    available,
    quote: buildQuote({
      propertyId: property.id,
      basePrice: property.basePrice,
      cleaningFee: property.cleaningFee,
      checkIn,
      checkOut,
      guests,
    }),
  });
});

/**
 * Создаёт бронь и держит даты HOLD_MINUTES минут до оплаты.
 * Проверка занятости и вставка идут в одной immediate-транзакции, иначе два
 * гостя, нажавшие «забронировать» одновременно, могли бы занять одни и те же даты.
 */
bookingsRouter.post('/bookings', (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const { stay, guest } = parsed.data;

  const context = resolveStay(stay.propertySlug, stay.checkIn, stay.checkOut, stay.guests);
  if (!context) return res.status(404).json({ error: 'not_found', message: 'Объект не найден' });
  if (context.error) return res.status(context.error.status).json(context.error.body);

  const { property } = context;
  const quote = buildQuote({
    propertyId: property.id,
    basePrice: property.basePrice,
    cleaningFee: property.cleaningFee,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    guests: stay.guests,
  });

  const id = `ГЛД-${bookingCode()}`;
  const now = new Date();
  const holdExpiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString();

  const create = db.transaction(() => {
    if (!isRangeAvailable(property.id, stay.checkIn, stay.checkOut)) {
      return false;
    }
    db.prepare(
      `INSERT INTO bookings (
         id, property_id, check_in, check_out, guests, status,
         guest_name, guest_phone, guest_email, guest_comment,
         total, prepayment, quote_json, created_at, hold_expires_at
       ) VALUES (?, ?, ?, ?, ?, 'awaiting_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      property.id,
      stay.checkIn,
      stay.checkOut,
      stay.guests,
      guest.name,
      guest.phone,
      guest.email,
      guest.comment ?? null,
      quote.total,
      quote.prepayment,
      JSON.stringify(quote),
      now.toISOString(),
      holdExpiresAt,
    );
    return true;
  });

  const created = create.immediate();
  if (!created) {
    return res.status(409).json({
      error: 'dates_taken',
      message: 'Эти даты только что забронировали. Выберите другие — календарь уже обновлён.',
    });
  }

  res.status(201).json(loadBooking(id));
});

bookingsRouter.get('/bookings/:id', (req, res) => {
  const booking = loadBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'not_found', message: 'Бронь не найдена' });
  res.json(booking);
});

bookingsRouter.post('/bookings/:id/cancel', (req, res) => {
  const booking = loadBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'not_found', message: 'Бронь не найдена' });

  if (booking.status === 'paid') {
    return res.status(409).json({
      error: 'already_paid',
      message: 'Оплаченную бронь отменяет менеджер — напишите нам, вернём предоплату по условиям.',
    });
  }

  db.prepare(`UPDATE bookings SET status = 'cancelled', hold_expires_at = NULL WHERE id = ?`).run(
    booking.id,
  );
  res.json(loadBooking(booking.id));
});
