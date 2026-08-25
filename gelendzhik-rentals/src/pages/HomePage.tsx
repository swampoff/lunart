import {
  BadgeCheck,
  CalendarCheck,
  CreditCard,
  KeyRound,
  MapPin,
  Ruler,
  Users,
  Waves,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApartmentCard } from '@/components/ApartmentCard';
import { SearchForm } from '@/components/SearchForm';
import { api, type ApartmentListItem } from '@/lib/api';
import { plural } from '@/lib/dates';
import { useHouse } from '@/lib/useHouse';

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Выберите даты и апартаменты',
    text: 'Календарь показывает реальную занятость каждой квартиры: если даты открыты, они свободны.',
  },
  {
    icon: CreditCard,
    title: 'Внесите предоплату 30%',
    text: 'Оплата картой онлайн. Остаток отдаёте при заселении — наличными или переводом.',
  },
  {
    icon: KeyRound,
    title: 'Приезжайте',
    text: 'Адрес, схема проезда и телефон хозяина приходят на почту сразу после оплаты. Встречаем лично.',
  },
];

const PROMISES = [
  'Сдаём сами, без посредников и комиссий',
  'Фотографии настоящие: что видите, то и получаете',
  'Двор, бассейн и мангал — для гостей дома, не для посторонних',
  'Бесплатная отмена за 7 дней до заезда',
];

export function HomePage() {
  const house = useHouse();
  const [items, setItems] = useState<ApartmentListItem[]>([]);

  useEffect(() => {
    api.apartments({ sort: 'popular' }).then((data) => setItems(data.items));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-sea-950 text-white">
        <img
          src="/images/house-1.svg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sea-950/85 via-sea-950/60 to-sea-950/92" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <MapPin className="size-4" />
            {house ? `${house.address}` : 'Геленджик'}
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {house?.name ?? 'Апартаменты у моря'}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-sea-100">
            {house?.tagline ??
              'Апартаменты в частном доме: своя кухня, свой санузел и общий двор с бассейном.'}
          </p>

          <div className="mt-8 max-w-3xl">
            <SearchForm />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sea-100">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-center gap-2">
                <BadgeCheck className="size-4 shrink-0 text-sun-soft" />
                {promise}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {house && (
        <section className="border-b border-sand-dark bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            <Fact
              icon={Ruler}
              value={`${house.apartmentsCount} ${plural(house.apartmentsCount, ['апартамент', 'апартамента', 'апартаментов'])}`}
              label="в одном доме, у каждого свой вход и кухня"
            />
            <Fact
              icon={Waves}
              value={`${house.distanceToSea} минут`}
              label="пешком до галечного пляжа"
            />
            <Fact
              icon={Users}
              value={`до ${house.maxGuests} гостей`}
              label="в самых просторных апартаментах"
            />
            <Fact
              icon={CreditCard}
              value={`от ${house.priceFrom.toLocaleString('ru-RU')} ₽`}
              label="за ночь в низкий сезон"
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Апартаменты дома</h2>
            <p className="mt-2 text-ink-soft">
              Все квартиры разные: от студии на двоих до двухкомнатных на пятерых.
            </p>
          </div>
          <Link
            to="/apartments"
            className="hidden shrink-0 rounded-xl border border-sea-900/15 px-4 py-2.5 text-sm font-semibold text-sea-900 transition hover:bg-sea-50 sm:block"
          >
            Подобрать по датам
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ApartmentCard key={item.apartment.id} item={item} />
          ))}
        </div>
      </section>

      {house && (
        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_460px]">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">О доме</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{house.description}</p>

              <h3 className="mt-8 font-bold">На общей территории</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {house.commonAmenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl bg-sand px-4 py-3 text-sm"
                  >
                    <span className="size-1.5 rounded-full bg-sea-500" />
                    {amenity}
                  </li>
                ))}
              </ul>

              <Link
                to="/house"
                className="mt-6 inline-block rounded-xl border border-sea-900/15 px-5 py-3 text-sm font-semibold text-sea-900 transition hover:bg-sea-50"
              >
                Подробнее о доме и правилах
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start">
              {house.images.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  loading="lazy"
                  className={[
                    'w-full rounded-2xl object-cover',
                    index === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/3]',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Как проходит бронирование</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[1.25rem] bg-white p-6 shadow-sm ring-1 ring-sea-950/5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-sea-900 text-white">
                <step.icon className="size-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-sea-700">Шаг {index + 1}</p>
              <h3 className="mt-1 font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {house && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Что рядом</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  );
}

function Fact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Waves;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sea-50 text-sea-700">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-extrabold">{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
