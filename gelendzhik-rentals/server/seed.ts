import { db } from './db.js';
import { addDays, today } from './pricing.js';

/**
 * Апартаменты дома. Владельцу: правьте этот массив — при следующем запуске
 * сервера каталог обновится, а существующие брони не пострадают.
 */
const APARTMENTS = [
  {
    slug: 'studiya-briz',
    title: 'Студия «Бриз»',
    kind: 'Студия',
    short_description: 'Компактная студия на первом этаже с отдельным входом и столиком во дворе.',
    description:
      'Самые доступные апартаменты в доме: одна светлая комната, где двуспальная кровать отделена ' +
      'от кухонного уголка барной стойкой. Вход отдельный, прямо со двора, поэтому возвращаться ' +
      'с пляжа можно в любое время и никого не беспокоить. Под окном столик на двоих в тени ' +
      'винограда — там удобно завтракать. Санузел свой, с душевой кабиной. Подойдёт паре, ' +
      'которая приезжает ради моря и в квартире только ночует.',
    rooms: 1,
    max_guests: 2,
    beds: 1,
    area: 24,
    floor: '1 этаж',
    separate_entrance: 1,
    base_price: 2800,
    cleaning_fee: 800,
    min_nights: 2,
    rating: 4.6,
    reviews_count: 74,
    amenities: [
      'Отдельный вход',
      'Кондиционер',
      'Кухонный уголок',
      'Холодильник',
      'Свой санузел',
      'Телевизор',
      'Wi-Fi',
      'Столик во дворе',
    ],
  },
  {
    slug: 'apartamenty-laguna',
    title: 'Апартаменты «Лагуна»',
    kind: 'Апартаменты с одной спальней',
    short_description: 'Отдельная спальня, кухня-гостиная и своя терраса с выходом к бассейну.',
    description:
      'Первый этаж с собственной террасой под навесом: стол на четверых, два кресла и вид ' +
      'на бассейн в десяти шагах. Внутри отдельная спальня с двуспальной кроватью и кухня-гостиная, ' +
      'где раскладывается кресло для третьего гостя. Кухня полноценная: варочная панель, духовка, ' +
      'посуда на четверых. Родители с малышом обычно берут именно эти апартаменты — до бассейна ' +
      'и площадки можно дойти босиком, не поднимаясь по лестницам.',
    rooms: 2,
    max_guests: 3,
    beds: 2,
    area: 34,
    floor: '1 этаж',
    separate_entrance: 1,
    base_price: 3600,
    cleaning_fee: 1000,
    min_nights: 2,
    rating: 4.8,
    reviews_count: 96,
    amenities: [
      'Отдельный вход',
      'Терраса',
      'Кондиционер',
      'Полноценная кухня',
      'Стиральная машина',
      'Свой санузел',
      'Телевизор',
      'Wi-Fi',
      'Детская кроватка',
    ],
  },
  {
    slug: 'apartamenty-panorama',
    title: 'Апартаменты «Панорама»',
    kind: 'Апартаменты с одной спальней',
    short_description: 'Второй этаж, балкон с видом на море и закат над бухтой.',
    description:
      'Единственные апартаменты в доме, откуда море видно прямо с балкона — над крышами соседних ' +
      'домов открывается полоса воды и мыс. Вечером на балконе удобно сидеть вдвоём: там стоят ' +
      'два кресла и низкий столик. Внутри спальня с большой кроватью, гостиная с диваном ' +
      'на двоих взрослых и кухня со всем необходимым. Кондиционеры в обеих комнатах — в июле ' +
      'это решает.',
    rooms: 2,
    max_guests: 4,
    beds: 2,
    area: 42,
    floor: '2 этаж',
    separate_entrance: 0,
    base_price: 4600,
    cleaning_fee: 1200,
    min_nights: 3,
    rating: 4.9,
    reviews_count: 118,
    amenities: [
      'Вид на море',
      'Балкон',
      'Кондиционер',
      'Полноценная кухня',
      'Стиральная машина',
      'Свой санузел',
      'Телевизор',
      'Wi-Fi',
    ],
  },
  {
    slug: 'apartamenty-kipari',
    title: 'Двухкомнатные «Кипарис»',
    kind: 'Апартаменты с двумя спальнями',
    short_description: 'Две изолированные спальни — можно ехать двумя парами или семьёй с детьми.',
    description:
      'Самые просторные апартаменты второго этажа: две спальни с дверями, поэтому дети ложатся ' +
      'спать, а взрослые ещё сидят в гостиной. В первой спальне двуспальная кровать, во второй — ' +
      'две односпальные, которые по просьбе сдвигаем. Кухня-гостиная с обеденным столом ' +
      'на шестерых, посудомоечная машина. Санузел один, но с раздельной душевой и большой раковиной, ' +
      'так что утренняя очередь движется быстро.',
    rooms: 3,
    max_guests: 5,
    beds: 3,
    area: 56,
    floor: '2 этаж',
    separate_entrance: 0,
    base_price: 5800,
    cleaning_fee: 1600,
    min_nights: 3,
    rating: 4.8,
    reviews_count: 87,
    amenities: [
      'Две спальни',
      'Кондиционер',
      'Полноценная кухня',
      'Посудомоечная машина',
      'Стиральная машина',
      'Свой санузел',
      'Балкон',
      'Телевизор',
      'Wi-Fi',
      'Детская кроватка',
    ],
  },
  {
    slug: 'mansarda-magnoliya',
    title: 'Мансарда «Магнолия»',
    kind: 'Мансардные апартаменты',
    short_description: 'Весь третий этаж под наклонной крышей — тихо, светло и никого над головой.',
    description:
      'Мансарда занимает третий этаж целиком: скошенные потолки, окна в крыше и много света. ' +
      'Спальная зона отделена от гостиной перегородкой, дополнительно раскладывается диван, ' +
      'поэтому вчетвером здесь свободно. Над головой соседей нет, поэтому это самые тихие ' +
      'апартаменты в доме. Летом под крышей теплее, чем на нижних этажах, — работают два ' +
      'кондиционера. Лестница крутая, с малышом на руках подниматься неудобно, зато вид на горы ' +
      'из окна того стоит.',
    rooms: 2,
    max_guests: 4,
    beds: 3,
    area: 48,
    floor: '3 этаж, мансарда',
    separate_entrance: 0,
    base_price: 5200,
    cleaning_fee: 1400,
    min_nights: 3,
    rating: 4.7,
    reviews_count: 63,
    amenities: [
      'Два кондиционера',
      'Полноценная кухня',
      'Стиральная машина',
      'Свой санузел',
      'Рабочее место',
      'Телевизор',
      'Wi-Fi',
      'Вид на горы',
    ],
  },
] as const;

/** Демо-занятость, чтобы календарь при первом запуске не выглядел пустым. */
const DEMO_BUSY: { slug: string; startsInDays: number; nights: number }[] = [
  { slug: 'studiya-briz', startsInDays: 6, nights: 5 },
  { slug: 'apartamenty-panorama', startsInDays: 3, nights: 7 },
  { slug: 'apartamenty-laguna', startsInDays: 12, nights: 4 },
  { slug: 'apartamenty-kipari', startsInDays: 18, nights: 6 },
];

export function seed(): void {
  const insert = db.prepare(`
    INSERT INTO apartments (
      slug, title, kind, short_description, description, rooms, max_guests, beds, area, floor,
      separate_entrance, base_price, cleaning_fee, min_nights, rating, reviews_count,
      amenities, images, sort_order
    ) VALUES (
      @slug, @title, @kind, @short_description, @description, @rooms, @max_guests, @beds, @area, @floor,
      @separate_entrance, @base_price, @cleaning_fee, @min_nights, @rating, @reviews_count,
      @amenities, @images, @sort_order
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      kind = excluded.kind,
      short_description = excluded.short_description,
      description = excluded.description,
      rooms = excluded.rooms,
      max_guests = excluded.max_guests,
      beds = excluded.beds,
      area = excluded.area,
      floor = excluded.floor,
      separate_entrance = excluded.separate_entrance,
      base_price = excluded.base_price,
      cleaning_fee = excluded.cleaning_fee,
      min_nights = excluded.min_nights,
      rating = excluded.rating,
      reviews_count = excluded.reviews_count,
      amenities = excluded.amenities,
      images = excluded.images,
      sort_order = excluded.sort_order
  `);

  const insertBlocked = db.prepare(
    `INSERT OR IGNORE INTO blocked_dates (apartment_id, date, reason) VALUES (?, ?, ?)`,
  );
  const idBySlug = db.prepare(`SELECT id FROM apartments WHERE slug = ?`);

  db.transaction(() => {
    APARTMENTS.forEach((apartment, index) => {
      insert.run({
        ...apartment,
        sort_order: index,
        amenities: JSON.stringify(apartment.amenities),
        images: JSON.stringify([
          `/images/${apartment.slug}-1.svg`,
          `/images/${apartment.slug}-2.svg`,
          `/images/${apartment.slug}-3.svg`,
          `/images/${apartment.slug}-4.svg`,
        ]),
      });
    });

    const blocked = db.prepare(`SELECT COUNT(*) AS count FROM blocked_dates`).get() as {
      count: number;
    };
    if (blocked.count === 0) {
      for (const busy of DEMO_BUSY) {
        const row = idBySlug.get(busy.slug) as { id: number } | undefined;
        if (!row) continue;
        for (let i = 0; i < busy.nights; i += 1) {
          insertBlocked.run(row.id, addDays(today(), busy.startsInDays + i), 'Бронь по телефону');
        }
      }
    }
  })();
}

// Отдельный запуск сидирования: npm run seed
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed();
  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM apartments`).get() as { count: number };
  console.log(`Апартаменты загружены: ${count}.`);
}
