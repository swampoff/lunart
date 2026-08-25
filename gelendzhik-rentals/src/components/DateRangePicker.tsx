import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  WEEKDAYS,
  addMonths,
  datesInRange,
  monthGrid,
  monthLabel,
  nightsBetween,
  startOfMonth,
  today,
} from '@/lib/dates';

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  busyDates: string[];
  minNights?: number;
  monthsToShow?: number;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  busyDates,
  minNights = 1,
  monthsToShow = 2,
  onChange,
}: Props) {
  const [firstMonth, setFirstMonth] = useState(() => startOfMonth(checkIn ?? today()));
  const [hovered, setHovered] = useState<string | null>(null);

  const busy = useMemo(() => new Set(busyDates), [busyDates]);
  const minDate = today();

  /** Нельзя выбрать интервал, внутри которого есть занятая ночь. */
  const rangeIsFree = (from: string, to: string) =>
    datesInRange(from, to).every((date) => !busy.has(date));

  function handleClick(date: string) {
    // Первый клик или клик после готового интервала — начинаем выбор заново.
    if (!checkIn || (checkIn && checkOut)) {
      onChange(date, null);
      return;
    }
    if (date <= checkIn) {
      onChange(date, null);
      return;
    }
    if (!rangeIsFree(checkIn, date)) {
      // Между выбранными датами есть занятые ночи — считаем клик новой датой заезда.
      onChange(date, null);
      return;
    }
    onChange(checkIn, date);
  }

  // Пока выбрана только дата заезда, подсвечиваем интервал под курсором.
  const previewEnd = checkIn && !checkOut && hovered && hovered > checkIn ? hovered : null;
  const rangeEnd = checkOut ?? previewEnd;

  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(firstMonth, i));
  const canGoBack = firstMonth > startOfMonth(minDate);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFirstMonth(addMonths(firstMonth, -1))}
          disabled={!canGoBack}
          aria-label="Предыдущий месяц"
          className="rounded-full p-2 text-ink-soft transition hover:bg-sea-50 hover:text-sea-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-8 text-sm font-semibold">
          {months.map((month, index) => (
            <span key={month} className={index > 0 ? 'hidden md:inline' : undefined}>
              {monthLabel(month)}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFirstMonth(addMonths(firstMonth, 1))}
          aria-label="Следующий месяц"
          className="rounded-full p-2 text-ink-soft transition hover:bg-sea-50 hover:text-sea-900"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Две колонки только когда месяцев действительно два, иначе месяц сожмётся вдвое. */}
      <div
        className={['grid gap-8', monthsToShow > 1 ? 'md:grid-cols-2' : ''].join(' ')}
        onMouseLeave={() => setHovered(null)}
      >
        {months.map((month, index) => (
          <div key={month} className={index > 0 ? 'hidden md:block' : undefined}>
            <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-ink-soft">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {monthGrid(month).map((date, cellIndex) => {
                if (!date) return <span key={`empty-${cellIndex}`} />;

                const isPast = date < minDate;
                const isBusy = busy.has(date);
                const isStart = date === checkIn;
                const isEnd = date === checkOut;
                const inRange = Boolean(
                  checkIn && rangeEnd && date > checkIn && date < rangeEnd,
                );
                // Дату выезда можно ставить на занятый день: ночь на него не бронируется.
                const disabled = isPast || (isBusy && !isStart);

                return (
                  <button
                    key={date}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleClick(date)}
                    onMouseEnter={() => setHovered(date)}
                    aria-label={date}
                    aria-pressed={isStart || isEnd}
                    className={[
                      'relative mx-auto flex size-9 items-center justify-center rounded-full text-sm transition',
                      disabled
                        ? 'cursor-not-allowed text-ink-soft/35 line-through'
                        : 'hover:bg-sea-100',
                      inRange ? 'bg-sea-100 text-sea-950' : '',
                      isStart || isEnd ? 'bg-sea-900 font-semibold text-white hover:bg-sea-700' : '',
                    ].join(' ')}
                  >
                    {Number(date.slice(8, 10))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
        <span>
          {checkIn && checkOut
            ? `Выбрано ${nightsBetween(checkIn, checkOut)} ноч.`
            : checkIn
              ? 'Теперь выберите дату выезда'
              : `Минимальный срок — ${minNights} ноч.`}
        </span>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="font-medium text-sea-700 underline underline-offset-4 hover:text-sea-900"
          >
            Сбросить даты
          </button>
        )}
      </div>
    </div>
  );
}
