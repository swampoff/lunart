import { CreditCard, Loader2, Lock, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Booking } from '@shared/types';
import { ApiError, api, formatMoney } from '@/lib/api';
import { formatRange } from '@/lib/dates';

/**
 * Страница тестовой оплаты — заменяет платёжную форму банка, пока не подключён
 * боевой эквайринг. При PAYMENT_PROVIDER=yookassa гость сюда не попадает:
 * его уводит на страницу ЮKassa.
 */
export function PayPage() {
  const { paymentId = '' } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api
      .payment(paymentId)
      .then((payment) => {
        setBooking(payment.booking);
        setAmount(payment.amount);
        if (payment.status === 'succeeded') {
          navigate(`/booking/${encodeURIComponent(payment.booking.id)}`, { replace: true });
        }
      })
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : 'Платёж не найден');
      });
  }, [paymentId, navigate]);

  async function finish(outcome: 'succeeded' | 'canceled') {
    setProcessing(true);
    try {
      const updated = await api.simulatePayment(paymentId, outcome);
      navigate(`/booking/${encodeURIComponent(updated.id)}`);
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : 'Не удалось завершить оплату');
      setProcessing(false);
    }
  }

  if (error) {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center text-lg font-semibold">{error}</p>;
  }

  if (!booking) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" />
        <span>
          Демонстрационная оплата. Реальные деньги не списываются, данные карты никуда не
          отправляются. Подключите ЮKassa, чтобы принимать настоящие платежи.
        </span>
      </div>

      <div className="mt-6 rounded-[1.25rem] bg-white p-6 shadow-lg shadow-sea-950/10">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold">
            <CreditCard className="size-5 text-sea-700" />
            Оплата картой
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-soft">
            <Lock className="size-3.5" />
            Защищённое соединение
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-sea-50 p-4">
          <p className="text-sm text-ink-soft">Предоплата брони {booking.id}</p>
          <p className="mt-1 text-2xl font-extrabold">{formatMoney(amount)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {booking.apartmentTitle} · {formatRange(booking.checkIn, booking.checkOut)}
          </p>
        </div>

        <div className="mt-5 space-y-3 opacity-70">
          <MockField label="Номер карты" value="4111 1111 1111 1111" />
          <div className="grid grid-cols-2 gap-3">
            <MockField label="Срок действия" value="12 / 28" />
            <MockField label="CVC" value="•••" />
          </div>
          <MockField label="Имя владельца" value={booking.guest.name.toUpperCase()} />
        </div>

        <button
          type="button"
          onClick={() => finish('succeeded')}
          disabled={processing}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sea-900 px-6 py-4 font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
        >
          {processing && <Loader2 className="size-5 animate-spin" />}
          Оплатить {formatMoney(amount)}
        </button>

        <button
          type="button"
          onClick={() => finish('canceled')}
          disabled={processing}
          className="mt-3 w-full rounded-xl border border-sand-dark px-6 py-3 text-sm font-semibold text-ink-soft transition hover:text-sea-900 disabled:opacity-60"
        >
          Отклонить платёж
        </button>
      </div>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="mt-1 rounded-xl border border-sand-dark bg-sand px-4 py-3 font-medium tracking-wide">
        {value}
      </div>
    </div>
  );
}
