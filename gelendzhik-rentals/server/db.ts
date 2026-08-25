import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Apartment } from '../shared/types.js';

const DB_PATH = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : resolve(process.cwd(), 'data/rentals.db');

if (!existsSync(dirname(DB_PATH))) {
  mkdirSync(dirname(DB_PATH), { recursive: true });
}

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS apartments (
    id                INTEGER PRIMARY KEY,
    slug              TEXT NOT NULL UNIQUE,
    title             TEXT NOT NULL,
    kind              TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description       TEXT NOT NULL,
    rooms             INTEGER NOT NULL,
    max_guests        INTEGER NOT NULL,
    beds              INTEGER NOT NULL,
    area              REAL NOT NULL,
    floor             TEXT NOT NULL,
    separate_entrance INTEGER NOT NULL DEFAULT 0,
    base_price        INTEGER NOT NULL,
    cleaning_fee      INTEGER NOT NULL,
    min_nights        INTEGER NOT NULL DEFAULT 2,
    rating            REAL NOT NULL,
    reviews_count     INTEGER NOT NULL,
    amenities         TEXT NOT NULL,
    images            TEXT NOT NULL,
    sort_order        INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id               TEXT PRIMARY KEY,
    apartment_id     INTEGER NOT NULL REFERENCES apartments(id),
    check_in         TEXT NOT NULL,
    check_out        TEXT NOT NULL,
    guests           INTEGER NOT NULL,
    status           TEXT NOT NULL,
    guest_name       TEXT NOT NULL,
    guest_phone      TEXT NOT NULL,
    guest_email      TEXT NOT NULL,
    guest_comment    TEXT,
    total            INTEGER NOT NULL,
    prepayment       INTEGER NOT NULL,
    quote_json       TEXT NOT NULL,
    created_at       TEXT NOT NULL,
    hold_expires_at  TEXT,
    CHECK (check_out > check_in)
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_apartment_dates
    ON bookings (apartment_id, check_in, check_out);

  CREATE TABLE IF NOT EXISTS payments (
    id               TEXT PRIMARY KEY,
    booking_id       TEXT NOT NULL REFERENCES bookings(id),
    provider         TEXT NOT NULL,
    provider_ref     TEXT,
    status           TEXT NOT NULL,
    amount           INTEGER NOT NULL,
    confirmation_url TEXT,
    created_at       TEXT NOT NULL,
    paid_at          TEXT,
    idempotence_key  TEXT NOT NULL UNIQUE
  );

  CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);

  CREATE TABLE IF NOT EXISTS blocked_dates (
    apartment_id INTEGER NOT NULL REFERENCES apartments(id),
    date         TEXT NOT NULL,
    reason       TEXT,
    PRIMARY KEY (apartment_id, date)
  );
`);

export interface ApartmentRow {
  id: number;
  slug: string;
  title: string;
  kind: string;
  short_description: string;
  description: string;
  rooms: number;
  max_guests: number;
  beds: number;
  area: number;
  floor: string;
  separate_entrance: number;
  base_price: number;
  cleaning_fee: number;
  min_nights: number;
  rating: number;
  reviews_count: number;
  amenities: string;
  images: string;
  sort_order: number;
}

export function rowToApartment(row: ApartmentRow): Apartment {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    shortDescription: row.short_description,
    description: row.description,
    rooms: row.rooms,
    maxGuests: row.max_guests,
    beds: row.beds,
    area: row.area,
    floor: row.floor,
    separateEntrance: row.separate_entrance === 1,
    basePrice: row.base_price,
    cleaningFee: row.cleaning_fee,
    minNights: row.min_nights,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    amenities: JSON.parse(row.amenities),
    images: JSON.parse(row.images),
  };
}

export interface BookingRow {
  id: string;
  apartment_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  guest_comment: string | null;
  total: number;
  prepayment: number;
  quote_json: string;
  created_at: string;
  hold_expires_at: string | null;
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  provider: string;
  provider_ref: string | null;
  status: string;
  amount: number;
  confirmation_url: string | null;
  created_at: string;
  paid_at: string | null;
  idempotence_key: string;
}
