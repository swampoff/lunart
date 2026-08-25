import { DoorOpen, Ruler, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney, type ApartmentListItem } from '@/lib/api';
import { nightsLabel, plural } from '@/lib/dates';

interface Props {
  item: ApartmentListItem;
  /** Ссылка сохраняет выбранные даты, чтобы гость не выбирал их заново. */
  searchQuery?: string;
}

export function ApartmentCard({ item, searchQuery }: Props) {
  const { apartment, available, unavailableReason, quote } = item;
  const href = searchQuery
    ? `/apartment/${apartment.slug}?${searchQuery}`
    : `/apartment/${apartment.slug}`;

  return (
    <Link
      to={href}
      className={[
        'group flex flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-sea-950/5 transition',
        available
          ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sea-950/10'
          : 'hover:shadow-md',
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sea-100">
        <img
          src={apartment.images[0]}
          alt={apartment.title}
          loading="lazy"
          className={[
            'size-full object-cover transition duration-500',
            available ? 'group-hover:scale-105' : 'grayscale-[0.6] opacity-70',
          ].join(' ')}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-sea-900">
          {apartment.floor}
        </span>
        {!available && unavailableReason && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white">
            {unavailableReason}
          </span>
        )}
        {available && apartment.amenities.includes('Вид на море') && (
          <span className="absolute right-3 top-3 rounded-full bg-sun/95 px-3 py-1 text-xs font-semibold text-white">
            Вид на море
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold leading-snug">{apartment.title}</h3>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">{apartment.kind}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <Star className="size-4 fill-sun text-sun" />
            {apartment.rating.toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-ink-soft">{apartment.shortDescription}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" /> до {apartment.maxGuests}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="size-4" /> {apartment.area} м²
          </span>
          <span className="flex items-center gap-1.5">
            <DoorOpen className="size-4" />
            {apartment.rooms} {plural(apartment.rooms, ['комната', 'комнаты', 'комнат'])}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-sand-dark pt-4">
          {quote ? (
            <div>
              <p className="text-lg font-extrabold text-sea-900">{formatMoney(quote.total)}</p>
              <p className="text-xs text-ink-soft">
                за {nightsLabel(quote.nights)} · {formatMoney(quote.nightlyAverage)} за ночь
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-extrabold text-sea-900">
                от {formatMoney(Math.round(apartment.basePrice * 0.65))}
              </p>
              <p className="text-xs text-ink-soft">за ночь, зависит от сезона</p>
            </div>
          )}
          <span className="text-sm font-semibold text-sea-700 underline-offset-4 group-hover:underline">
            {available ? 'Подробнее' : 'Другие даты'}
          </span>
        </div>
      </div>
    </Link>
  );
}
