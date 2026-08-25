import { BadgeCheck, CalendarCheck, CreditCard, KeyRound, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchForm } from '@/components/SearchForm';
import { api, type CatalogItem, type FiltersResponse } from '@/lib/api';

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Выберите даты и квартиру',
    text: 'Календарь показывает реальную занятость: если даты открыты, квартира действительно свободна.',
  },
  {
    icon: CreditCard,
    title: 'Внесите предоплату 30%',
    text: 'Оплата картой онлайн. Остаток отдаёте хозяину при заселении — наличными или переводом.',
  },
  {
    icon: KeyRound,
    title: 'Заселяйтесь',
    text: 'Адрес, код замка и телефон встречающего приходят на почту сразу после оплаты.',
  },
];

const ADVANTAGES = [
  'Все квартиры проверены лично: фото совпадают с реальностью',
  'Цена финальная — комиссия и уборка уже в расчёте',
  'Заселение 24/7, в том числе после ночного поезда',
  'Бесплатная отмена за 7 дней до заезда',
];

export function HomePage() {
  const [popular, setPopular] = useState<CatalogItem[]>([]);
  const [filters, setFilters] = useState<FiltersResponse | null>(null);

  useEffect(() => {
    api.properties({ sort: 'popular' }).then((data) => setPopular(data.items.slice(0, 6)));
    api.filters().then(setFilters);
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-sea-950 text-white">
        <img
          src="/images/panorama-tolstyy-mys-1.svg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sea-950/85 via-sea-950/55 to-sea-950/90" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Waves className="size-4" />
            Геленджик, Кабардинка, Дивноморское
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Квартиры у моря посуточно — с честными ценами и мгновенной бронью
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-sea-100">
            Проверенные квартиры и апартаменты от собственников. Выбирайте даты, смотрите итоговую
            стоимость сразу со всеми сборами и бронируйте онлайн за пару минут.
          </p>

          <div className="mt-8 max-w-3xl">
            <SearchForm />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sea-100">
            {ADVANTAGES.map((advantage) => (
              <li key={advantage} className="flex items-center gap-2">
                <BadgeCheck className="size-4 shrink-0 text-sun-soft" />
                {advantage}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Популярные квартиры</h2>
            <p className="mt-2 text-ink-soft">Их чаще всего бронируют этим летом</p>
          </div>
          <Link
            to="/catalog"
            className="hidden shrink-0 rounded-xl border border-sea-900/15 px-4 py-2.5 text-sm font-semibold text-sea-900 transition hover:bg-sea-50 sm:block"
          >
            Смотреть все
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((item) => (
            <PropertyCard key={item.property.id} item={item} />
          ))}
        </div>

        <Link
          to="/catalog"
          className="mt-8 block rounded-xl border border-sea-900/15 px-4 py-3 text-center text-sm font-semibold text-sea-900 sm:hidden"
        >
          Смотреть все квартиры
        </Link>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Как проходит бронирование</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-[1.25rem] bg-sand p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-sea-900 text-white">
                  <step.icon className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-sea-700">Шаг {index + 1}</p>
                <h3 className="mt-1 font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {filters && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Районы</h2>
          <p className="mt-2 text-ink-soft">
            Центр — для прогулок по набережной, Дивноморское и Голубая бухта — за тишиной и чистым морем.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {filters.districts.map((district) => (
              <Link
                key={district}
                to={`/catalog?district=${encodeURIComponent(district)}`}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sea-900 shadow-sm ring-1 ring-sea-950/5 transition hover:bg-sea-50"
              >
                {district}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
