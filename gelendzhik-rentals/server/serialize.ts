import { db, type BookingRow, type PaymentRow } from './db.js';
import { nightsBetween } from './pricing.js';
import type { Booking, BookingStatus, PaymentInfo, Quote } from '../shared/types.js';

/** Собирает бронь вместе с объектом и последним платежом — то, что видит гость. */
export function loadBooking(id: string): Booking | null {
  const row = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as BookingRow | undefined;
  if (!row) return null;

  const property = db
    .prepare(`SELECT title, slug FROM properties WHERE id = ?`)
    .get(row.property_id) as { title: string; slug: string };

  const paymentRow = db
    .prepare(`SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`)
    .get(id) as PaymentRow | undefined;

  const payment: PaymentInfo | null = paymentRow
    ? {
        id: paymentRow.id,
        provider: paymentRow.provider,
        status: paymentRow.status as PaymentInfo['status'],
        amount: paymentRow.amount,
        confirmationUrl: paymentRow.confirmation_url,
        paidAt: paymentRow.paid_at,
      }
    : null;

  const quote = JSON.parse(row.quote_json) as Quote;

  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: property.title,
    propertySlug: property.slug,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: nightsBetween(row.check_in, row.check_out),
    guests: row.guests,
    status: row.status as BookingStatus,
    guest: {
      name: row.guest_name,
      phone: row.guest_phone,
      email: row.guest_email,
      comment: row.guest_comment ?? undefined,
    },
    total: row.total,
    prepayment: row.prepayment,
    restOnArrival: row.total - row.prepayment,
    quote,
    createdAt: row.created_at,
    holdExpiresAt: row.hold_expires_at,
    payment,
  };
}
