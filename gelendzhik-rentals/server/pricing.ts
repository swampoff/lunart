import type { Quote, QuoteNight, SeasonName } from '../shared/types.js';

/** Доля стоимости, которую гость вносит онлайн при бронировании. */
export const PREPAYMENT_PERCENT = 30;

/**
 * Сезонные коэффициенты к базовой цене объекта.
 * Границы взяты по курортному сезону Геленджика: вода прогревается к июню,
 * пик приходится на июль–август, бархатный сезон держится до конца сентября.
 */
const SEASONS: { name: SeasonName; multiplier: number; months: number[] }[] = [
  { name: 'низкий', multiplier: 0.65, months: [11, 12, 1, 2, 3] },
  { name: 'межсезонье', multiplier: 0.85, months: [4, 5, 10] },
  { name: 'высокий', multiplier: 1.15, months: [6, 9] },
  { name: 'пиковый', multiplier: 1.45, months: [7, 8] },
];

/** Скидки за длительное проживание: чем дольше, тем меньше цена ночи. */
const LENGTH_DISCOUNTS: { minNights: number; percent: number; reason: string }[] = [
  { minNights: 28, percent: 15, reason: 'Скидка за месяц проживания' },
  { minNights: 7, percent: 7, reason: 'Скидка за неделю проживания' },
];

export function seasonFor(date: string): { name: SeasonName; multiplier: number } {
  const month = Number(date.slice(5, 7));
  const season = SEASONS.find((s) => s.months.includes(month));
  // Все 12 месяцев покрыты таблицей выше; ветка нужна только для типизации.
  return season ?? { name: 'межсезонье', multiplier: 1 };
}

/** Ночь округляем до 50 ₽ — так цены выглядят как в прайсе, а не как результат умножения. */
function roundPrice(value: number): number {
  return Math.round(value / 50) * 50;
}

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

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseDate(checkOut).getTime() - parseDate(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

/** Список дат заезда: ночь с 12-го на 13-е — это дата 12-е. Выселение не оплачивается. */
export function datesInRange(checkIn: string, checkOut: string): string[] {
  const result: string[] = [];
  for (let date = checkIn; date < checkOut; date = addDays(date, 1)) {
    result.push(date);
  }
  return result;
}

export function today(): string {
  return formatDate(new Date());
}

export interface QuoteInput {
  apartmentId: number;
  basePrice: number;
  cleaningFee: number;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function buildQuote(input: QuoteInput): Quote {
  const nights = nightsBetween(input.checkIn, input.checkOut);

  const breakdown: QuoteNight[] = datesInRange(input.checkIn, input.checkOut).map((date) => {
    const season = seasonFor(date);
    return {
      date,
      price: roundPrice(input.basePrice * season.multiplier),
      season: season.name,
    };
  });

  const accommodationTotal = breakdown.reduce((sum, night) => sum + night.price, 0);
  const discount = LENGTH_DISCOUNTS.find((d) => nights >= d.minNights);
  const discountPercent = discount?.percent ?? 0;
  const discountAmount = Math.round((accommodationTotal * discountPercent) / 100);
  const total = accommodationTotal - discountAmount + input.cleaningFee;
  const prepayment = Math.round((total * PREPAYMENT_PERCENT) / 100);

  return {
    apartmentId: input.apartmentId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    nights,
    nightlyAverage: Math.round(accommodationTotal / nights),
    accommodationTotal,
    cleaningFee: input.cleaningFee,
    discountPercent,
    discountAmount,
    discountReason: discount?.reason ?? null,
    total,
    prepaymentPercent: PREPAYMENT_PERCENT,
    prepayment,
    restOnArrival: total - prepayment,
    breakdown,
  };
}
