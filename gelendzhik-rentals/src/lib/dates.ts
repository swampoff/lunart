/** Работа с датами вида YYYY-MM-DD без таймзон: календарный день, а не момент времени. */

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

export function addMonths(value: string, months: number): string {
  const date = parseDate(value);
  date.setUTCMonth(date.getUTCMonth() + months, 1);
  return formatDate(date);
}

export function today(): string {
  return formatDate(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((parseDate(checkOut).getTime() - parseDate(checkIn).getTime()) / 86_400_000);
}

export function datesInRange(checkIn: string, checkOut: string): string[] {
  const result: string[] = [];
  for (let date = checkIn; date < checkOut; date = addDays(date, 1)) result.push(date);
  return result;
}

/** «12 сентября» — для подписей в интерфейсе. */
export function formatHuman(value: string, withYear = false): string {
  const date = parseDate(value);
  const day = date.getUTCDate();
  const month = MONTHS_GENITIVE[date.getUTCMonth()];
  return withYear ? `${day} ${month} ${date.getUTCFullYear()}` : `${day} ${month}`;
}

export function formatRange(checkIn: string, checkOut: string): string {
  return `${formatHuman(checkIn)} — ${formatHuman(checkOut)}`;
}

export function monthLabel(value: string): string {
  const date = parseDate(value);
  return `${MONTHS_NOMINATIVE[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

/**
 * Сетка месяца по неделям, начиная с понедельника.
 * Пустые ячейки в начале и конце — null, чтобы дни встали под нужные дни недели.
 */
export function monthGrid(monthStart: string): (string | null)[] {
  const first = parseDate(monthStart);
  const offset = (first.getUTCDay() + 6) % 7; // воскресенье в JS = 0, у нас неделя с понедельника
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();

  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${monthStart.slice(0, 7)}-${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Правильное окончание: 1 ночь, 2 ночи, 5 ночей. */
export function plural(count: number, forms: [string, string, string]): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export function nightsLabel(count: number): string {
  return `${count} ${plural(count, ['ночь', 'ночи', 'ночей'])}`;
}

export function guestsLabel(count: number): string {
  return `${count} ${plural(count, ['гость', 'гостя', 'гостей'])}`;
}
