import { MapPin, Star, Users, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/lib/api';
import { nightsLabel } from '@/lib/dates';
import type { CatalogItem } from '@/lib/api';

interface Props {
  item: CatalogItem;
  /** Ссылка сохраняет выбранные даты, чтобы гость не выбирал их заново. */
  searchQuery?: string;
}

export function PropertyCard({ item, searchQuery }: Props) {
  const { property, quote } = item;
  const href = searchQuery ? `/apartment/${property.slug}?${searchQuery}` : `/apartment/${property.slug}`;

  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-sea-950/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sea-950/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sea-100">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-sea-900">
          {property.district}
        </span>
        {property.amenities.includes('Вид на море') && (
          <span className="absolute right-3 top-3 rounded-full bg-sun/95 px-3 py-1 text-xs font-semibold text-white">
            Вид на море
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold leading-snug">{property.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <Star className="size-4 fill-sun text-sun" />
            {property.rating.toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-ink-soft">{property.shortDescription}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" /> до {property.maxGuests}
          </span>
          <span className="flex items-center gap-1.5">
            <Waves className="size-4" /> {property.distanceToSea} мин до моря
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {property.area} м²
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
                от {formatMoney(Math.round(property.basePrice * 0.65))}
              </p>
              <p className="text-xs text-ink-soft">за ночь, зависит от сезона</p>
            </div>
          )}
          <span className="text-sm font-semibold text-sea-700 underline-offset-4 group-hover:underline">
            Подробнее
          </span>
        </div>
      </div>
    </Link>
  );
}
