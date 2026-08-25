import { Loader2, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Gallery } from '@/components/Gallery';
import { useHouse } from '@/lib/useHouse';

export function HousePage() {
  const house = useHouse();

  if (!house) {
    return (
      <div className="flex justify-center py-32 text-ink-soft">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{house.name}</h1>
      <p className="mt-2 flex items-center gap-2 text-ink-soft">
        <MapPin className="size-4" />
        {house.address}
      </p>

      <div className="mt-8">
        <Gallery images={house.images} title={house.name} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">О доме</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">{house.description}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">Общая территория</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {house.commonAmenities.map((amenity) => (
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

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">Что рядом</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {house.nearby.map((place) => (
            <div
              key={place.title}
              className="flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-sea-950/5"
            >
              <span className="text-sm font-medium">{place.title}</span>
              <span className="shrink-0 text-sm text-ink-soft">{place.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
        <h2 className="text-xl font-extrabold">Правила дома</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {house.rules.map((rule) => (
            <div key={rule.title}>
              <dt className="text-sm font-bold">{rule.title}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{rule.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 flex flex-col items-start gap-4 rounded-[1.25rem] bg-sea-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-extrabold">Остались вопросы?</p>
          <p className="mt-1 text-sea-100">
            Позвоните — ответим, какие апартаменты подойдут вашей компании.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={house.phoneHref}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-sea-900"
          >
            <Phone className="size-4" />
            {house.phone}
          </a>
          <Link
            to="/apartments"
            className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Выбрать апартаменты
          </Link>
        </div>
      </section>
    </div>
  );
}
