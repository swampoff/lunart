import { CheckCircle2, Clock, Loader2, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Booking, BookingStatus } from '@shared/types';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { ApiError, api, formatMoney } from '@/lib/api';
import { formatRange, guestsLabel, nightsLabel } from '@/lib/dates';

const STATUS_VIEW: Record<
  BookingStatus,
  { title: string; text: string; tone: string; icon: typeof CheckCircle2 }
> = {
  paid: {
    title: 'Бронь подтверждена',
    text: 'Предоплата получена. Письмо с адресом, кодом от замка и телефоном встречающего отправлено на вашу почту.',
    tone: 'bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
  },
  awaiting_payment: {
    title: 'Ждём оплату',
    text: 'Даты закреплены за вами на 30 минут. После оплаты предоплаты бронь подтвердится автоматически.',
    tone: 'bg-amber-50 text-amber-900',
    icon: Clock,
  },
  cancelled: {
    title: 'Бронь отменена',
    text: 'Даты вернулись в продажу. Если отменили случайно — забронируйте заново, пока апартаменты свободны.',
    tone: 'bg-red-50 text-red-900',
    icon: XCircle,
  },
  expired: {
    title: 'Срок брони истёк',
    text: 'Оплата не поступила за 30 минут, даты вернулись в продажу. Оформите бронь заново.',
    tone: 'bg-red-50 text-red-900',
    icon: XCircle,
  },
};

export function BookingPage() {
  const { id } = useParams();
  return id ? <BookingDetails id={id} /> : <BookingLookup />;
}

function BookingLookup() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-extrabold">Проверить бронь</h1>
      <p className="mt-2 text-ink-soft">
        Введите номер брони из письма — он выглядит так: ГЛД-A1B2C3.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (code.trim()) navigate(`/booking/${encodeURIComponent(code.trim().toUpperCase())}`);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="ГЛД-A1B2C3"
          className="w-full rounded-xl border border-sand-dark px-4 py-3 outline-none transition focus:border-sea-500"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-sea-900 px-5 font-semibold text-white transition hover:bg-sea-700"
        >
          <Search className="size-5" />
        </button>
      </form>
    </div>
  );
}

function BookingDetails({ id }: { id: string }) {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .booking(id)
      .then(setBooking)
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : 'Бронь не найдена');
      });
  }, [id]);

  async function payAgain() {
    setBusy(true);
    try {
      const payment = await api.createPayment(id);
      if (payment.confirmationUrl?.startsWith('http')) {
        window.location.href = payment.confirmationUrl;
      } else if (payment.confirmationUrl) {
        navigate(payment.confirmationUrl);
      }
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : 'Не удалось создать платёж');
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      setBooking(await api.cancelBooking(id));
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : 'Не удалось отменить бронь');
    } finally {
      setBusy(false);
    }
  }

  if (error && !booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">{error}</h1>
        <p className="mt-2 text-ink-soft">Проверьте номер брони — возможно, в нём опечатка.</p>
        <Link to="/booking" className="mt-6 inline-block font-semibold text-sea-700 underline">
          Ввести другой номер
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const view = STATUS_VIEW[booking.status];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className={`flex items-start gap-4 rounded-[1.25rem] p-6 ${view.tone}`}>
        <view.icon className="mt-0.5 size-7 shrink-0" />
        <div>
          <h1 className="text-xl font-extrabold">{view.title}</h1>
          <p className="mt-1 text-sm">{view.text}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold">Бронь {booking.id}</h2>
          <Link
            to={`/apartment/${booking.apartmentSlug}`}
            className="text-sm font-semibold text-sea-700 underline underline-offset-4"
          >
            {booking.apartmentTitle}
          </Link>
        </div>

        <dl className="mt-5 grid gap-x-12 gap-y-3 border-t border-sand-dark pt-5 text-sm sm:grid-cols-2">
          <Row term="Даты" value={formatRange(booking.checkIn, booking.checkOut)} />
          <Row term="Срок" value={nightsLabel(booking.nights)} />
          <Row term="Гостей" value={guestsLabel(booking.guests)} />
          <Row term="Гость" value={booking.guest.name} />
          <Row term="Телефон" value={booking.guest.phone} />
          <Row term="Почта" value={booking.guest.email} />
        </dl>

        {booking.guest.comment && (
          <p className="mt-4 rounded-xl bg-sand p-4 text-sm text-ink-soft">
            Пожелания: {booking.guest.comment}
          </p>
        )}

        <div className="mt-6 border-t border-sand-dark pt-6">
          <PriceBreakdown quote={booking.quote} />
        </div>

        {booking.status === 'paid' && (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            Оплачено {formatMoney(booking.prepayment)}. При заселении останется внести{' '}
            {formatMoney(booking.restOnArrival)}.
          </p>
        )}

        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {booking.status === 'awaiting_payment' && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={payAgain}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sea-900 px-6 py-3.5 font-semibold text-white transition hover:bg-sea-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-5 animate-spin" />}
              Оплатить {formatMoney(booking.prepayment)}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="rounded-xl border border-sand-dark px-6 py-3.5 text-sm font-semibold text-ink-soft transition hover:text-sea-900 disabled:opacity-60"
            >
              Отменить бронь
            </button>
          </div>
        )}

        {(booking.status === 'expired' || booking.status === 'cancelled') && (
          <Link
            to={`/apartment/${booking.apartmentSlug}`}
            className="mt-6 flex items-center justify-center rounded-xl bg-sea-900 px-6 py-3.5 font-semibold text-white transition hover:bg-sea-700"
          >
            Забронировать заново
          </Link>
        )}
      </div>
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{term}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
