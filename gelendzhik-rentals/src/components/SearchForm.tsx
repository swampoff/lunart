import { CalendarDays, Search, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from '@/components/DateRangePicker';
import { searchToQuery } from '@/lib/api';
import { formatRange } from '@/lib/dates';
import { useHouse } from '@/lib/useHouse';

interface Props {
  initial?: { checkIn?: string; checkOut?: string; guests?: number };
  variant?: 'hero' | 'inline';
}

export function SearchForm({ initial, variant = 'hero' }: Props) {
  const navigate = useNavigate();
  const house = useHouse();
  const [checkIn, setCheckIn] = useState<string | null>(initial?.checkIn ?? null);
  const [checkOut, setCheckOut] = useState<string | null>(initial?.checkOut ?? null);
  const [guests, setGuests] = useState(initial?.guests ?? 2);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Календарь закрывается по клику вне блока — иначе он перекрывает список апартаментов.
  useEffect(() => {
    if (!calendarOpen) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setCalendarOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [calendarOpen]);

  // Больше, чем вмещают самые большие апартаменты, выбрать нельзя.
  const maxGuests = house?.maxGuests ?? 6;

  function submit() {
    navigate(
      `/apartments?${searchToQuery({
        checkIn: checkIn ?? undefined,
        checkOut: checkOut ?? undefined,
        guests,
      })}`,
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={[
          // text-ink обязателен: на главной форма лежит внутри тёмного блока с text-white
          'grid gap-2 rounded-2xl bg-white p-2 text-ink shadow-lg shadow-sea-950/10',
          variant === 'hero' ? 'sm:grid-cols-[1.6fr_1fr_auto]' : 'sm:grid-cols-[1.4fr_1fr_auto]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-sea-50"
        >
          <CalendarDays className="size-5 shrink-0 text-sea-700" />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-ink-soft">Даты поездки</span>
            <span className="block truncate font-semibold">
              {checkIn && checkOut ? formatRange(checkIn, checkOut) : 'Выберите даты'}
            </span>
          </span>
        </button>

        <label className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-sea-50">
          <Users className="size-5 shrink-0 text-sea-700" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-ink-soft">Гостей</span>
            <select
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
              className="w-full cursor-pointer bg-transparent font-semibold outline-none"
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-sea-900 px-6 py-3 font-semibold text-white transition hover:bg-sea-700"
        >
          <Search className="size-5" />
          Найти
        </button>
      </form>

      {calendarOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl bg-white p-5 shadow-xl shadow-sea-950/15">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            busyDates={[]}
            onChange={(from, to) => {
              setCheckIn(from);
              setCheckOut(to);
              if (from && to) setCalendarOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
