import { AlertCircle, Loader2, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApartmentWithAvailability, Quote } from '@shared/types';
import { DateRangePicker } from '@/components/DateRangePicker';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { ApiError, api, formatMoney, searchToQuery } from '@/lib/api';
import { nightsBetween } from '@/lib/dates';

interface Props {
  apartment: ApartmentWithAvailability;
  initial: { checkIn: string | null; checkOut: string | null; guests: number };
}

export function BookingWidget({ apartment, initial }: Props) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(Math.min(initial.guests, apartment.maxGuests));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const tooShort = nights > 0 && nights < apartment.minNights;

  useEffect(() => {
    if (!checkIn || !checkOut || tooShort) {
      setQuote(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .quote({ apartmentSlug: apartment.slug, checkIn, checkOut, guests })
      .then((result) => {
        if (cancelled) return;
        setQuote(result.quote);
        setAvailable(result.available);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setQuote(null);
        setError(cause instanceof ApiError ? cause.message : 'Не удалось рассчитать стоимость');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apartment.slug, checkIn, checkOut, guests, tooShort]);

  function goToCheckout() {
    if (!checkIn || !checkOut) return;
    navigate(`/checkout/${apartment.slug}?${searchToQuery({ checkIn, checkOut, guests })}`);
  }

  const canBook = Boolean(quote && available && !loading && !tooShort);

  return (
    <div className="rounded-[1.25rem] bg-white p-6 shadow-lg shadow-sea-950/10 ring-1 ring-sea-950/5">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-extrabold">
          {formatMoney(apartment.basePrice)}
          <span className="text-base font-medium text-ink-soft"> / ночь</span>
        </p>
        <span className="flex items-center gap-1 text-sm font-semibold">
          <Star className="size-4 fill-sun text-sun" />
          {apartment.rating.toFixed(1)}
          <span className="font-normal text-ink-soft">({apartment.reviewsCount})</span>
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">Цена базовая: в июле–августе выше, зимой ниже</p>

      <div className="mt-5 border-t border-sand-dark pt-5">
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          busyDates={apartment.busyDates}
          minNights={apartment.minNights}
          monthsToShow={1}
          onChange={(from, to) => {
            setCheckIn(from);
            setCheckOut(to);
          }}
        />
      </div>

      <label className="mt-5 block border-t border-sand-dark pt-5">
        <span className="text-xs font-medium text-ink-soft">Гостей</span>
        <select
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
          className="mt-1 w-full cursor-pointer rounded-xl border border-sand-dark bg-white px-4 py-3 font-semibold outline-none focus:border-sea-500"
        >
          {Array.from({ length: apartment.maxGuests }, (_, i) => i + 1).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>

      {tooShort && (
        <Notice tone="warning">
          Минимальный срок проживания — {apartment.minNights} ноч. Продлите даты, чтобы забронировать.
        </Notice>
      )}

      {!available && !tooShort && quote && (
        <Notice tone="warning">
          На эти даты апартаменты уже заняты. Выберите другие — занятые дни зачёркнуты в календаре.
        </Notice>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {quote && available && !tooShort && (
        <div className="mt-5 border-t border-sand-dark pt-5">
          <PriceBreakdown quote={quote} />
        </div>
      )}

      <button
        type="button"
        onClick={goToCheckout}
        disabled={!canBook}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sea-900 px-6 py-4 font-semibold text-white transition hover:bg-sea-700 disabled:cursor-not-allowed disabled:bg-ink-soft/30"
      >
        {loading && <Loader2 className="size-5 animate-spin" />}
        {checkIn && checkOut ? 'Забронировать' : 'Выберите даты'}
      </button>

      <p className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sea-700" />
        Списываем только предоплату 30%. Бесплатная отмена за 7 дней до заезда.
      </p>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'warning' | 'error'; children: React.ReactNode }) {
  return (
    <p
      className={[
        'mt-4 flex items-start gap-2 rounded-xl p-3 text-sm',
        tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900',
      ].join(' ')}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
