import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Property, Quote } from '@shared/types';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { ApiError, api } from '@/lib/api';
import { formatRange, guestsLabel, nightsLabel } from '@/lib/dates';

interface FormState {
  name: string;
  phone: string;
  email: string;
  comment: string;
  agreed: boolean;
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', comment: '', agreed: false };

export function CheckoutPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests = Number(searchParams.get('guests') ?? 2);

  const [property, setProperty] = useState<Property | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      navigate(`/apartment/${slug}`, { replace: true });
      return;
    }

    api.property(slug).then(setProperty).catch(() => setError('Объект не найден'));

    api
      .quote({ propertySlug: slug, checkIn, checkOut, guests })
      .then((result) => {
        setQuote(result.quote);
        if (!result.available) {
          setError('Эти даты уже заняты. Выберите другие в календаре объекта.');
        }
      })
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : 'Не удалось рассчитать стоимость');
      });
  }, [slug, checkIn, checkOut, guests, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const booking = await api.createBooking({
        stay: { propertySlug: slug, checkIn, checkOut, guests },
        guest: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          comment: form.comment.trim() || undefined,
        },
      });

      const payment = await api.createPayment(booking.id);

      if (!payment.confirmationUrl) {
        navigate(`/booking/${encodeURIComponent(booking.id)}`);
        return;
      }

      // Боевой провайдер отдаёт внешнюю ссылку, тестовый — внутренний маршрут.
      if (payment.confirmationUrl.startsWith('http')) {
        window.location.href = payment.confirmationUrl;
      } else {
        navigate(payment.confirmationUrl);
      }
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : 'Не удалось создать бронь');
      setSubmitting(false);
    }
  }

  if (error && !quote) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">{error}</h1>
        <Link to="/catalog" className="mt-6 inline-block font-semibold text-sea-700 underline">
          Подобрать другую квартиру
        </Link>
      </div>
    );
  }

  if (!property || !quote) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const formValid =
    form.name.trim().length >= 2 &&
    /^[+()\-\s\d]{10,20}$/.test(form.phone.trim()) &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.agreed;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to={`/apartment/${slug}?${searchParams.toString()}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-sea-900"
      >
        <ArrowLeft className="size-4" />
        Назад к квартире
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold">Оформление брони</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
          <h2 className="text-lg font-extrabold">Данные гостя</h2>
          <p className="mt-1 text-sm text-ink-soft">
            На эту почту придёт подтверждение с адресом и инструкцией по заселению.
          </p>

          <div className="mt-6 space-y-4">
            <Field
              label="Имя и фамилия"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              placeholder="Иван Петров"
              autoComplete="name"
              required
            />
            <Field
              label="Телефон"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              placeholder="+7 918 000-00-00"
              type="tel"
              autoComplete="tel"
              required
            />
            <Field
              label="Электронная почта"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              placeholder="ivan@example.com"
              type="email"
              autoComplete="email"
              required
            />

            <label className="block">
              <span className="text-sm font-semibold">Пожелания (необязательно)</span>
              <textarea
                value={form.comment}
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
                rows={3}
                placeholder="Например: приедем поздно вечером, нужна детская кроватка"
                className="mt-1 w-full rounded-xl border border-sand-dark px-4 py-3 outline-none transition focus:border-sea-500"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(event) => setForm({ ...form, agreed: event.target.checked })}
                className="mt-0.5 size-4 shrink-0 accent-sea-900"
              />
              Согласен с условиями бронирования, правилами отмены и обработкой персональных данных
            </label>
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <button
            type="submit"
            disabled={!formValid || submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sea-900 px-6 py-4 font-semibold text-white transition hover:bg-sea-700 disabled:cursor-not-allowed disabled:bg-ink-soft/30"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
            Перейти к оплате {quote.prepayment.toLocaleString('ru-RU')} ₽
          </button>

          <p className="mt-3 text-center text-xs text-ink-soft">
            Данные карты вводятся на защищённой странице платёжного сервиса — сайт их не получает
            и не хранит.
          </p>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
            <div className="flex gap-4">
              <img
                src={property.images[0]}
                alt=""
                className="size-20 shrink-0 rounded-xl object-cover"
              />
              <div>
                <p className="font-bold leading-snug">{property.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{property.district}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-sand-dark pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Даты</dt>
                <dd className="font-medium">{formatRange(checkIn, checkOut)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Срок</dt>
                <dd className="font-medium">{nightsLabel(quote.nights)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Гостей</dt>
                <dd className="font-medium">{guestsLabel(guests)}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-sand-dark pt-5">
              <PriceBreakdown quote={quote} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-sand-dark px-4 py-3 outline-none transition focus:border-sea-500"
      />
    </label>
  );
}
