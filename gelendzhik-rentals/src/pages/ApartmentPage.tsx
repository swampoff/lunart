import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarRange,
  DoorOpen,
  Loader2,
  MapPin,
  Ruler,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { ApartmentWithAvailability } from '@shared/types';
import { ApartmentCard } from '@/components/ApartmentCard';
import { BookingWidget } from '@/components/BookingWidget';
import { Gallery } from '@/components/Gallery';
import { ApiError, api, type ApartmentListItem } from '@/lib/api';
import { plural } from '@/lib/dates';
import { useHouse } from '@/lib/useHouse';

export function ApartmentPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const house = useHouse();
  const [apartment, setApartment] = useState<ApartmentWithAvailability | null>(null);
  const [others, setOthers] = useState<ApartmentListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  useEffect(() => {
    setApartment(null);
    setError(null);
    api
      .apartment(slug)
      .then(setApartment)
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : 'Не удалось загрузить апартаменты');
      });
  }, [slug]);

  // Соседние квартиры того же дома: если эти заняты, гость сразу видит альтернативу.
  useEffect(() => {
    api
      .apartments({ checkIn: checkIn ?? undefined, checkOut: checkOut ?? undefined })
      .then((data) => setOthers(data.items.filter((item) => item.apartment.slug !== slug)));
  }, [slug, checkIn, checkOut]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">{error}</h1>
        <Link to="/apartments" className="mt-6 inline-block font-semibold text-sea-700 underline">
          Посмотреть другие апартаменты
        </Link>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const facts = [
    { icon: Users, label: `до ${apartment.maxGuests} гостей` },
    {
      icon: BedDouble,
      label: `${apartment.beds} ${plural(apartment.beds, ['спальное место', 'спальных места', 'спальных мест'])}`,
    },
    { icon: Ruler, label: `${apartment.area} м²` },
    { icon: Building2, label: apartment.floor },
    {
      icon: DoorOpen,
      label: apartment.separateEntrance ? 'Отдельный вход' : 'Вход через общий холл',
    },
    { icon: CalendarRange, label: `минимум ${apartment.minNights} ноч.` },
  ];

  const alternatives = others.filter((item) => item.available).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={`/apartments?${searchParams.toString()}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-sea-900"
      >
        <ArrowLeft className="size-4" />
        Все апартаменты дома
      </Link>

      <p className="mt-4 text-sm font-semibold text-sea-700">{apartment.kind}</p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{apartment.title}</h1>
      {house && (
        <p className="mt-2 flex items-center gap-2 text-ink-soft">
          <MapPin className="size-4" />
          {house.name}, {house.address}
        </p>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Gallery images={apartment.images} title={apartment.title} />

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
            <h2 className="text-xl font-extrabold">Об этих апартаментах</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{apartment.description}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">В апартаментах</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {apartment.amenities.map((amenity) => (
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

          {house && (
            <section className="mt-10 rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
              <h2 className="text-xl font-extrabold">Общая территория дома</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Доступна всем гостям — отдельно оплачивать ничего не нужно.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {house.commonAmenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 rounded-xl bg-sand px-4 py-3 text-sm">
                    <span className="size-1.5 rounded-full bg-sun" />
                    {amenity}
                  </li>
                ))}
              </ul>
              <Link
                to="/house"
                className="mt-5 inline-block text-sm font-semibold text-sea-700 underline underline-offset-4"
              >
                Подробнее о доме и правилах
              </Link>
            </section>
          )}

          {house && (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold">Правила</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {house.rules.map((rule) => (
                  <div key={rule.title}>
                    <dt className="text-sm font-bold">{rule.title}</dt>
                    <dd className="mt-1 text-sm text-ink-soft">{rule.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            apartment={apartment}
            initial={{
              checkIn,
              checkOut,
              guests: Number(searchParams.get('guests') ?? 2),
            }}
          />
        </div>
      </div>

      {alternatives.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold">Другие апартаменты дома</h2>
          <p className="mt-2 text-ink-soft">
            {checkIn && checkOut ? 'Свободны на выбранные даты' : 'Возможно, подойдут лучше'}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((item) => (
              <ApartmentCard
                key={item.apartment.id}
                item={item}
                searchQuery={searchParams.toString()}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
