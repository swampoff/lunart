import { db } from './db.js';
import { addDays, datesInRange, today } from './pricing.js';

/** Сколько держим даты за гостем, пока он не оплатил бронь. */
export const HOLD_MINUTES = 30;

/**
 * Брони со статусом awaiting_payment занимают даты только пока не истёк холд.
 * Просроченные переводим в expired, чтобы даты вернулись в продажу.
 */
export function expireStaleHolds(): number {
  const result = db
    .prepare(
      `UPDATE bookings
          SET status = 'expired'
        WHERE status = 'awaiting_payment'
          AND hold_expires_at IS NOT NULL
          AND hold_expires_at < ?`,
    )
    .run(new Date().toISOString());
  return result.changes;
}

/** Занятые ночи апартаментов: и подтверждённые брони, и ручные блокировки владельца. */
export function busyDates(apartmentId: number, from = today(), to = addDays(today(), 365)): string[] {
  expireStaleHolds();

  const bookings = db
    .prepare(
      `SELECT check_in, check_out FROM bookings
        WHERE apartment_id = ?
          AND status IN ('awaiting_payment', 'paid')
          AND check_out > ?
          AND check_in < ?`,
    )
    .all(apartmentId, from, to) as { check_in: string; check_out: string }[];

  const blocked = db
    .prepare(`SELECT date FROM blocked_dates WHERE apartment_id = ? AND date >= ? AND date < ?`)
    .all(apartmentId, from, to) as { date: string }[];

  const dates = new Set<string>();
  for (const booking of bookings) {
    for (const date of datesInRange(booking.check_in, booking.check_out)) {
      if (date >= from && date < to) dates.add(date);
    }
  }
  for (const row of blocked) {
    dates.add(row.date);
  }

  return [...dates].sort();
}

/**
 * Свободны ли апартаменты на весь интервал.
 * Пересечение считаем по правилу «выезд одного гостя = заезд другого»:
 * интервалы конфликтуют, только если начало одного строго раньше конца другого.
 */
export function isRangeAvailable(apartmentId: number, checkIn: string, checkOut: string): boolean {
  expireStaleHolds();

  const conflict = db
    .prepare(
      `SELECT 1 FROM bookings
        WHERE apartment_id = ?
          AND status IN ('awaiting_payment', 'paid')
          AND check_in < ?
          AND check_out > ?
        LIMIT 1`,
    )
    .get(apartmentId, checkOut, checkIn);
  if (conflict) return false;

  const blocked = db
    .prepare(`SELECT 1 FROM blocked_dates WHERE apartment_id = ? AND date >= ? AND date < ? LIMIT 1`)
    .get(apartmentId, checkIn, checkOut);

  return !blocked;
}

/** Идентификаторы апартаментов, свободных на весь интервал — для фильтра в списке. */
export function availableApartmentIds(checkIn: string, checkOut: string): Set<number> {
  expireStaleHolds();

  const all = db.prepare(`SELECT id FROM apartments`).all() as { id: number }[];
  const busy = new Set<number>();

  const conflicting = db
    .prepare(
      `SELECT DISTINCT apartment_id FROM bookings
        WHERE status IN ('awaiting_payment', 'paid')
          AND check_in < ?
          AND check_out > ?`,
    )
    .all(checkOut, checkIn) as { apartment_id: number }[];
  for (const row of conflicting) busy.add(row.apartment_id);

  const blocked = db
    .prepare(`SELECT DISTINCT apartment_id FROM blocked_dates WHERE date >= ? AND date < ?`)
    .all(checkIn, checkOut) as { apartment_id: number }[];
  for (const row of blocked) busy.add(row.apartment_id);

  return new Set(all.map((p) => p.id).filter((id) => !busy.has(id)));
}
