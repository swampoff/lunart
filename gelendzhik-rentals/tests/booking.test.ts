/**
 * Тесты бизнес-логики бронирования.
 * Запуск: npm test
 *
 * База поднимается во временном файле, поэтому тесты не трогают рабочие данные.
 */
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'rentals-test-')), 'test.db');

const { db } = await import('../server/db.js');
const { seed } = await import('../server/seed.js');
const { buildQuote, addDays, nightsBetween, seasonFor, today } = await import('../server/pricing.js');
const { busyDates, expireStaleHolds, isRangeAvailable, availablePropertyIds } = await import(
  '../server/availability.js'
);

const PROPERTY_ID = 1;

before(() => {
  seed();
  // Демо-блокировки мешают проверять занятость на конкретных датах.
  db.prepare('DELETE FROM blocked_dates').run();
});

after(() => db.close());

function createBooking(
  id: string,
  checkIn: string,
  checkOut: string,
  status: string,
  holdExpiresAt: string | null = null,
) {
  db.prepare(
    `INSERT INTO bookings (
       id, property_id, check_in, check_out, guests, status,
       guest_name, guest_phone, guest_email, total, prepayment,
       quote_json, created_at, hold_expires_at
     ) VALUES (?, ?, ?, ?, 2, ?, 'Тест', '+79000000000', 't@example.com', 1000, 300, '{}', ?, ?)`,
  ).run(id, PROPERTY_ID, checkIn, checkOut, status, new Date().toISOString(), holdExpiresAt);
}

describe('расчёт стоимости', () => {
  it('применяет сезонный коэффициент к каждой ночи', () => {
    assert.equal(seasonFor('2027-07-15').name, 'пиковый');
    assert.equal(seasonFor('2027-01-15').name, 'низкий');

    const summer = buildQuote({
      propertyId: PROPERTY_ID,
      basePrice: 4000,
      cleaningFee: 0,
      checkIn: '2027-07-10',
      checkOut: '2027-07-12',
      guests: 2,
    });
    const winter = buildQuote({
      propertyId: PROPERTY_ID,
      basePrice: 4000,
      cleaningFee: 0,
      checkIn: '2027-01-10',
      checkOut: '2027-01-12',
      guests: 2,
    });

    assert.ok(summer.total > winter.total, 'лето должно быть дороже зимы');
    assert.equal(summer.breakdown.length, 2, 'две ночи — две строки в расшифровке');
  });

  it('не оплачивает ночь выезда', () => {
    const quote = buildQuote({
      propertyId: PROPERTY_ID,
      basePrice: 3000,
      cleaningFee: 0,
      checkIn: '2027-05-01',
      checkOut: '2027-05-04',
      guests: 2,
    });
    assert.equal(quote.nights, 3);
    assert.equal(quote.breakdown.at(-1)?.date, '2027-05-03');
  });

  it('даёт скидку за неделю и за месяц', () => {
    const base = { propertyId: PROPERTY_ID, basePrice: 3000, cleaningFee: 1000, guests: 2 };
    const short = buildQuote({ ...base, checkIn: '2027-05-01', checkOut: '2027-05-04' });
    const week = buildQuote({ ...base, checkIn: '2027-05-01', checkOut: '2027-05-09' });
    const month = buildQuote({ ...base, checkIn: '2027-05-01', checkOut: '2027-06-01' });

    assert.equal(short.discountPercent, 0);
    assert.equal(week.discountPercent, 7);
    assert.equal(month.discountPercent, 15);
  });

  it('делит сумму на предоплату и остаток без потери копеек', () => {
    const quote = buildQuote({
      propertyId: PROPERTY_ID,
      basePrice: 3333,
      cleaningFee: 777,
      checkIn: '2027-05-01',
      checkOut: '2027-05-06',
      guests: 2,
    });
    assert.equal(quote.prepayment + quote.restOnArrival, quote.total);
    assert.equal(quote.total, quote.accommodationTotal - quote.discountAmount + quote.cleaningFee);
  });
});

describe('занятость дат', () => {
  it('считает выезд и заезд в один день непересекающимися', () => {
    createBooking('T-1', '2027-03-10', '2027-03-15', 'paid');

    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-05', '2027-03-10'), true);
    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-15', '2027-03-20'), true);
  });

  it('не отдаёт даты, пересекающиеся с оплаченной бронью', () => {
    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-12', '2027-03-14'), false);
    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-08', '2027-03-12'), false);
    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-14', '2027-03-18'), false);
    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-03-01', '2027-03-31'), false);
  });

  it('возвращает занятые ночи без ночи выезда', () => {
    const dates = busyDates(PROPERTY_ID, '2027-03-01', '2027-04-01');
    assert.ok(dates.includes('2027-03-14'));
    assert.ok(!dates.includes('2027-03-15'), 'ночь выезда свободна для следующего гостя');
  });

  it('освобождает даты, если гость не оплатил бронь вовремя', () => {
    const expired = new Date(Date.now() - 60_000).toISOString();
    createBooking('T-2', '2027-04-10', '2027-04-14', 'awaiting_payment', expired);

    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-04-11', '2027-04-13'), true);
    assert.equal(
      (db.prepare('SELECT status FROM bookings WHERE id = ?').get('T-2') as { status: string })
        .status,
      'expired',
    );
  });

  it('держит даты, пока не истёк срок оплаты', () => {
    const future = new Date(Date.now() + 10 * 60_000).toISOString();
    createBooking('T-3', '2027-04-20', '2027-04-24', 'awaiting_payment', future);

    assert.equal(isRangeAvailable(PROPERTY_ID, '2027-04-21', '2027-04-23'), false);
    assert.equal(expireStaleHolds(), 0);
  });

  it('исключает занятый объект из выдачи каталога', () => {
    const free = availablePropertyIds('2027-03-11', '2027-03-13');
    assert.equal(free.has(PROPERTY_ID), false);
    assert.ok(free.size > 0, 'остальные объекты остаются в выдаче');
  });

  it('учитывает ручные блокировки владельца', () => {
    db.prepare('INSERT INTO blocked_dates (property_id, date, reason) VALUES (?, ?, ?)').run(
      2,
      '2027-06-10',
      'Ремонт',
    );
    assert.equal(isRangeAvailable(2, '2027-06-09', '2027-06-12'), false);
    assert.equal(isRangeAvailable(2, '2027-06-11', '2027-06-14'), true);
  });
});

describe('вспомогательные функции дат', () => {
  it('складывает дни через границу месяца', () => {
    assert.equal(addDays('2027-01-31', 1), '2027-02-01');
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  });

  it('считает количество ночей', () => {
    assert.equal(nightsBetween('2027-05-01', '2027-05-08'), 7);
    assert.equal(nightsBetween(today(), addDays(today(), 3)), 3);
  });
});
