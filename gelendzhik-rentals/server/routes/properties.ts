import { Router } from 'express';
import { z } from 'zod';
import { availablePropertyIds, busyDates } from '../availability.js';
import { db, rowToProperty, type PropertyRow } from '../db.js';
import { buildQuote, nightsBetween, today } from '../pricing.js';
import { dateSchema, validationError } from './validation.js';

export const propertiesRouter = Router();

const searchSchema = z
  .object({
    checkIn: dateSchema.optional(),
    checkOut: dateSchema.optional(),
    guests: z.coerce.number().int().min(1).max(20).optional(),
    district: z.string().min(1).optional(),
    priceMin: z.coerce.number().int().min(0).optional(),
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

propertiesRouter.get('/properties', (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  const params = parsed.data;

  const rows = db.prepare(`SELECT * FROM properties`).all() as PropertyRow[];
  let properties = rows.map(rowToProperty);

  if (params.guests) {
    properties = properties.filter((p) => p.maxGuests >= params.guests!);
  }
  if (params.district) {
    properties = properties.filter((p) => p.district === params.district);
  }
  if (params.priceMin !== undefined) {
    properties = properties.filter((p) => p.basePrice >= params.priceMin!);
  }
  if (params.priceMax !== undefined) {
    properties = properties.filter((p) => p.basePrice <= params.priceMax!);
  }
  if (params.amenities.length > 0) {
    properties = properties.filter((p) => params.amenities.every((a) => p.amenities.includes(a)));
  }

  // Даты заданы полностью — показываем только свободные объекты и сразу считаем стоимость.
  const withDates = Boolean(params.checkIn && params.checkOut);
  let free: Set<number> | null = null;
  if (withDates) {
    free = availablePropertyIds(params.checkIn!, params.checkOut!);
    properties = properties.filter((p) => free!.has(p.id));
    const nights = nightsBetween(params.checkIn!, params.checkOut!);
    properties = properties.filter((p) => nights >= p.minNights);
  }

  const items = properties.map((property) => ({
    property,
    quote: withDates
      ? buildQuote({
          propertyId: property.id,
          basePrice: property.basePrice,
          cleaningFee: property.cleaningFee,
          checkIn: params.checkIn!,
          checkOut: params.checkOut!,
          guests: params.guests ?? 1,
        })
      : null,
  }));

  const priceOf = (item: (typeof items)[number]) => item.quote?.nightlyAverage ?? item.property.basePrice;

  items.sort((a, b) => {
    switch (params.sort) {
      case 'price_asc':
        return priceOf(a) - priceOf(b);
      case 'price_desc':
        return priceOf(b) - priceOf(a);
      case 'rating':
        return b.property.rating - a.property.rating;
      default:
        return b.property.reviewsCount - a.property.reviewsCount;
    }
  });

  res.json({ items, total: items.length, searchedWithDates: withDates });
});

propertiesRouter.get('/properties/:slug', (req, res) => {
  const row = db.prepare(`SELECT * FROM properties WHERE slug = ?`).get(req.params.slug) as
    | PropertyRow
    | undefined;

  if (!row) {
    return res.status(404).json({ error: 'not_found', message: 'Объект не найден' });
  }

  const property = rowToProperty(row);
  res.json({ ...property, busyDates: busyDates(property.id, today()) });
});

/** Справочник для фильтров каталога: районы, удобства и границы цен. */
propertiesRouter.get('/filters', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM properties`).all() as PropertyRow[];
  const properties = rows.map(rowToProperty);

  const districts = [...new Set(properties.map((p) => p.district))].sort();
  const amenities = [...new Set(properties.flatMap((p) => p.amenities))].sort();
  const prices = properties.map((p) => p.basePrice);

  res.json({
    districts,
    amenities,
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    maxGuests: Math.max(...properties.map((p) => p.maxGuests)),
  });
});
