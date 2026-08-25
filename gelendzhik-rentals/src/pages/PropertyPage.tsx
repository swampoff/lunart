import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarRange,
  Loader2,
  MapPin,
  Ruler,
  Users,
  Waves,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { PropertyWithAvailability } from '@shared/types';
import { BookingWidget } from '@/components/BookingWidget';
import { Gallery } from '@/components/Gallery';
import { ApiError, api } from '@/lib/api';
import { plural } from '@/lib/dates';

export function PropertyPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState<PropertyWithAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProperty(null);
    setError(null);
    api
      .property(slug)
      .then(setProperty)
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : 'Не удалось загрузить объект');
      });
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">{error}</h1>
        <Link to="/catalog" className="mt-6 inline-block font-semibold text-sea-700 underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const facts = [
    { icon: Users, label: `до ${property.maxGuests} гостей` },
    {
      icon: BedDouble,
      label: `${property.beds} ${plural(property.beds, ['спальное место', 'спальных места', 'спальных мест'])}`,
    },
    { icon: Ruler, label: `${property.area} м²` },
    { icon: Building2, label: property.floor },
    { icon: Waves, label: `${property.distanceToSea} мин до моря` },
    { icon: CalendarRange, label: `минимум ${property.minNights} ноч.` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={`/catalog?${searchParams.toString()}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-sea-900"
      >
        <ArrowLeft className="size-4" />
        Все квартиры
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{property.title}</h1>
      <p className="mt-2 flex items-center gap-2 text-ink-soft">
        <MapPin className="size-4" />
        {property.district}, {property.address}
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Gallery images={property.images} title={property.title} />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-medium shadow-sm ring-1 ring-sea-950/5"
              >
                <fact.icon className="size-5 shrink-0 text-sea-700" />
                {fact.label}
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">Об этой квартире</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
              {property.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">Удобства</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-sea-950/5"
                >
                  <span className="size-1.5 rounded-full bg-sea-500" />
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
            <h2 className="text-xl font-extrabold">Правила и условия</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Rule term="Заселение" description="с 14:00, возможно раньше по согласованию" />
              <Rule term="Выезд" description="до 12:00" />
              <Rule
                term="Оплата"
                description="предоплата 30% онлайн, остаток при заселении"
              />
              <Rule
                term="Отмена"
                description="бесплатно за 7 дней до заезда, позже предоплата не возвращается"
              />
              <Rule term="Документы" description="паспорт при заселении, договор найма" />
              <Rule term="Дети и питомцы" description="дети любого возраста, питомцы по согласованию" />
            </dl>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            property={property}
            initial={{
              checkIn: searchParams.get('checkIn'),
              checkOut: searchParams.get('checkOut'),
              guests: Number(searchParams.get('guests') ?? 2),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Rule({ term, description }: { term: string; description: string }) {
  return (
    <div>
      <dt className="text-sm font-bold">{term}</dt>
      <dd className="mt-1 text-sm text-ink-soft">{description}</dd>
    </div>
  );
}
