import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Property } from '../shared/types.js';

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
  CREATE TABLE IF NOT EXISTS properties (
    id                INTEGER PRIMARY KEY,
    slug              TEXT NOT NULL UNIQUE,
    title             TEXT NOT NULL,
    district          TEXT NOT NULL,
    address           TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description       TEXT NOT NULL,
    rooms             INTEGER NOT NULL,
    max_guests        INTEGER NOT NULL,
    beds              INTEGER NOT NULL,
    area              REAL NOT NULL,
    floor             TEXT NOT NULL,
    distance_to_sea   INTEGER NOT NULL,
    base_price        INTEGER NOT NULL,
    cleaning_fee      INTEGER NOT NULL,
    min_nights        INTEGER NOT NULL DEFAULT 2,
    rating            REAL NOT NULL,
    reviews_count     INTEGER NOT NULL,
    amenities         TEXT NOT NULL,
    images            TEXT NOT NULL,
    lat               REAL NOT NULL,
    lng               REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id               TEXT PRIMARY KEY,
    property_id      INTEGER NOT NULL REFERENCES properties(id),
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

  CREATE INDEX IF NOT EXISTS idx_bookings_property_dates
    ON bookings (property_id, check_in, check_out);

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
    property_id INTEGER NOT NULL REFERENCES properties(id),
    date        TEXT NOT NULL,
    reason      TEXT,
    PRIMARY KEY (property_id, date)
  );
`);

export interface PropertyRow {
  id: number;
  slug: string;
  title: string;
  district: string;
  address: string;
  short_description: string;
  description: string;
  rooms: number;
  max_guests: number;
  beds: number;
  area: number;
  floor: string;
  distance_to_sea: number;
  base_price: number;
  cleaning_fee: number;
  min_nights: number;
  rating: number;
  reviews_count: number;
  amenities: string;
  images: string;
  lat: number;
  lng: number;
}

export function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    district: row.district as Property['district'],
    address: row.address,
    shortDescription: row.short_description,
    description: row.description,
    rooms: row.rooms,
    maxGuests: row.max_guests,
    beds: row.beds,
    area: row.area,
    floor: row.floor,
    distanceToSea: row.distance_to_sea,
    basePrice: row.base_price,
    cleaningFee: row.cleaning_fee,
    minNights: row.min_nights,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    amenities: JSON.parse(row.amenities),
    images: JSON.parse(row.images),
    lat: row.lat,
    lng: row.lng,
  };
}

export interface BookingRow {
  id: string;
  property_id: number;
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
