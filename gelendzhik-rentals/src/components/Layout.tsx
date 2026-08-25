import { MapPin, MessageCircle, Phone, Waves } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useHouse } from '@/lib/useHouse';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const house = useHouse();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-sea-50 text-sea-900' : 'text-ink-soft hover:text-sea-900',
    ].join(' ');

  return (
    <header className="sticky top-0 z-30 border-b border-sand-dark bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sea-900 text-white">
            <Waves className="size-5" />
          </span>
          <span className="leading-tight">
            {house?.name ?? 'Апартаменты у моря'}
            <span className="block text-xs font-medium text-ink-soft">
              {house ? `${house.area}, Геленджик` : 'Геленджик'}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink to="/apartments" className={linkClass}>
            Апартаменты
          </NavLink>
          <NavLink to="/house" className={linkClass}>
            О доме
          </NavLink>
          <NavLink to="/booking" className={linkClass}>
            Моя бронь
          </NavLink>
        </nav>

        {house && (
          <a
            href={house.phoneHref}
            className="flex items-center gap-2 rounded-xl border border-sea-900/15 px-3 py-2 text-sm font-semibold text-sea-900 transition hover:bg-sea-50"
          >
            <Phone className="size-4" />
            <span className="hidden md:inline">{house.phone}</span>
          </a>
        )}
      </div>
    </header>
  );
}

function Footer() {
  const house = useHouse();

  return (
    <footer className="mt-20 border-t border-sand-dark bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-extrabold">{house?.name ?? 'Апартаменты у моря'}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {house
              ? `${house.apartmentsCount} апартаментов в частном доме, ${house.distanceToSea} минут пешком до моря. Бронирование онлайн, подтверждение сразу после предоплаты.`
              : 'Апартаменты в частном доме в Геленджике.'}
          </p>
        </div>

        <div>
          <p className="font-semibold">Разделы</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link to="/apartments" className="hover:text-sea-900">
                Все апартаменты
              </Link>
            </li>
            <li>
              <Link to="/house" className="hover:text-sea-900">
                О доме и территории
              </Link>
            </li>
            <li>
              <Link to="/booking" className="hover:text-sea-900">
                Проверить бронь
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Контакты</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {house && (
              <>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" /> {house.address}
                </li>
                <li>
                  <a href={house.phoneHref} className="flex items-center gap-2 hover:text-sea-900">
                    <Phone className="size-4" /> {house.phone}
                  </a>
                </li>
              </>
            )}
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4" /> WhatsApp и Telegram
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Оплата</p>
          <p className="mt-3 text-sm text-ink-soft">
            Предоплата 30% картой онлайн, остаток — при заселении. Приём платежей через ЮKassa,
            данные карты обрабатывает банк.
          </p>
        </div>
      </div>

      <div className="border-t border-sand-dark py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {house?.name ?? 'Апартаменты у моря'}
      </div>
    </footer>
  );
}
