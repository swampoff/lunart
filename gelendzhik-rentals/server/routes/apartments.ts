import { Router } from 'express';
import { z } from 'zod';
import { availableApartmentIds, busyDates } from '../availability.js';
import { db, rowToApartment, type ApartmentRow } from '../db.js';
import { HOUSE } from '../house.js';
import { buildQuote, nightsBetween, today } from '../pricing.js';
import { dateSchema, validationError } from './validation.js';

export const apartmentsRouter = Router();

const searchSchema = z
  .object({
    checkIn: dateSchema.optional(),
    checkOut: dateSchema.optional(),
    guests: z.coerce.number().int().min(1).max(20).optional(),
    rooms: z.coerce.number().int().min(1).max(10).optional(),
    priceMax: z.coerce.number().int().min(0).optional(),
    amenities: z
      .string()
      .optional()
      .transform((value) => (value ? value.split(',').filter(Boolean) : [])),
    sort: z.enum(['price_asc', 'price_desc', 'rating', 'popular']).default('popular'),
  })
  .refine((value) => !value.checkIn || !value.checkOut || value.checkOut > value.checkIn, {
    message: 'Дата выезда должна быть позже даты заезда',
    path: ['checkOut'],
  });

/** Данные дома: адрес, общая территория, правила, контакты. */
apartmentsRouter.get('/house', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM apartments`).all() as ApartmentRow[];
  const apartments = rows.map(rowToApartment);

  res.json({
    ...HOUSE,
    apartmentsCount: apartments.length,
    maxGuests: Math.max(...apartments.map((a) => a.maxGuests)),
    priceFrom: Math.round(Math.min(...apartments.map((a) => a.basePrice)) * 0.65),
  });
});

apartmentsRouter.get('/apartments', (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const params = parsed.data;

  const rows = db.prepare(`SELECT * FROM apartments ORDER BY sort_order`).all() as ApartmentRow[];
  let apartments = rows.map(rowToApartment);

  if (params.guests) {
    apartments = apartments.filter((a) => a.maxGuests >= params.guests!);
  }
  if (params.rooms) {
    apartments = apartments.filter((a) => a.rooms >= params.rooms!);
  }
  if (params.priceMax !== undefined) {
    apartments = apartments.filter((a) => a.basePrice <= params.priceMax!);
  }
  if (params.amenities.length > 0) {
    apartments = apartments.filter((a) => params.amenities.every((x) => a.amenities.includes(x)));
  }

  // Когда даты заданы полностью, помечаем занятые апартаменты и считаем стоимость.
  const withDates = Boolean(params.checkIn && params.checkOut);
  const free = withDates ? availableApartmentIds(params.checkIn!, params.checkOut!) : null;
  const nights = withDates ? nightsBetween(params.checkIn!, params.checkOut!) : 0;

  const items = apartments.map((apartment) => {
    const tooShort = withDates && nights < apartment.minNights;
    const available = withDates ? free!.has(apartment.id) && !tooShort : true;

    return {
      apartment,
      available,
      // Апартаменты дома показываем всегда: гостю важно видеть, что ещё есть,
      // даже если на выбранные даты они заняты.
      unavailableReason: !available
        ? tooShort
          ? `Минимальный срок — ${apartment.minNights} ноч.`
          : 'Занято на эти даты'
        : null,
      quote:
        withDates && available
          ? buildQuote({
              apartmentId: apartment.id,
              basePrice: apartment.basePrice,
              cleaningFee: apartment.cleaningFee,
              checkIn: params.checkIn!,
              checkOut: params.checkOut!,
              guests: params.guests ?? 1,
            })
          : null,
    };
  });

  const priceOf = (item: (typeof items)[number]) =>
    item.quote?.nightlyAverage ?? item.apartment.basePrice;

  items.sort((a, b) => {
    // Свободные всегда выше занятых, независимо от выбранной сортировки.
    if (a.available !== b.available) return a.available ? -1 : 1;
    switch (params.sort) {
      case 'price_asc':
        return priceOf(a) - priceOf(b);
      case 'price_desc':
        return priceOf(b) - priceOf(a);
      case 'rating':
        return b.apartment.rating - a.apartment.rating;
      default:
        return 0; // порядок из sort_order, заданный владельцем
    }
  });

  res.json({
    items,
    total: items.length,
    availableCount: items.filter((item) => item.available).length,
    searchedWithDates: withDates,
  });
});

apartmentsRouter.get('/apartments/:slug', (req, res) => {
  const row = db.prepare(`SELECT * FROM apartments WHERE slug = ?`).get(req.params.slug) as
    | ApartmentRow
    | undefined;

  if (!row) {
    return res.status(404).json({ error: 'not_found', message: 'Апартаменты не найдены' });
  }

  const apartment = rowToApartment(row);
  res.json({ ...apartment, busyDates: busyDates(apartment.id, today()) });
});

/** Справочник для фильтров: удобства, вместимость, границы цен. */
apartmentsRouter.get('/filters', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM apartments`).all() as ApartmentRow[];
  const apartments = rows.map(rowToApartment);
  const prices = apartments.map((a) => a.basePrice);

  res.json({
    amenities: [...new Set(apartments.flatMap((a) => a.amenities))].sort(),
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    maxGuests: Math.max(...apartments.map((a) => a.maxGuests)),
    maxRooms: Math.max(...apartments.map((a) => a.rooms)),
  });
});
