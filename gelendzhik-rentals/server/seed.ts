import { db } from './db.js';
import { addDays, today } from './pricing.js';

/**
 * Демонстрационный каталог. Реальные объекты владелец заводит через этот же
 * формат — набор полей совпадает с таблицей properties.
 */
const PROPERTIES = [
  {
    slug: 'morskoy-briz-centr',
    title: 'Морской бриз у набережной',
    district: 'Центр',
    address: 'ул. Островского, 12',
    short_description: 'Светлая однушка в двух шагах от центральной набережной и Лермонтовского бульвара.',
    description:
      'Квартира на тихой стороне дома в самом центре Геленджика. До набережной — четыре минуты пешком, ' +
      'рядом аквапарк «Бегемот», рынок и кофейни. В спальне ортопедический матрас и плотные шторы блэкаут, ' +
      'в гостиной раскладывается диван, поэтому вчетвером спать комфортно. Кухня укомплектована посудой, ' +
      'есть всё для завтрака: чайник, турка, тостер. Заселение бесконтактное — код от электронного замка ' +
      'приходит в день заезда.',
    rooms: 1,
    max_guests: 4,
    beds: 2,
    area: 42,
    floor: '3 из 9, есть лифт',
    distance_to_sea: 4,
    base_price: 3800,
    cleaning_fee: 1200,
    min_nights: 2,
    rating: 4.8,
    reviews_count: 127,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Кухня',
      'Стиральная машина',
      'Телевизор',
      'Балкон',
      'Лифт',
      'Бесконтактное заселение',
    ],
    lat: 44.5622,
    lng: 38.0768,
  },
  {
    slug: 'panorama-tolstyy-mys',
    title: 'Панорама на Толстом мысе',
    district: 'Толстый мыс',
    address: 'ул. Мичурина, 34',
    short_description: 'Двухкомнатные апартаменты с видом на бухту и закат из панорамного окна.',
    description:
      'Верхний этаж нового дома на Толстом мысе: из гостиной видно всю Геленджикскую бухту, ' +
      'а вечером — подсветку набережной на другом берегу. Две изолированные спальни, поэтому ' +
      'удобно ехать двумя парами или семьёй с детьми. На кухне посудомоечная машина и духовка, ' +
      'на лоджии — стол на четверых и шезлонги. Во дворе закрытая территория, охрана и место ' +
      'для машины. До канатной дороги «Олимп» десять минут на автомобиле.',
    rooms: 2,
    max_guests: 5,
    beds: 3,
    area: 68,
    floor: '11 из 12, два лифта',
    distance_to_sea: 12,
    base_price: 6900,
    cleaning_fee: 1800,
    min_nights: 3,
    rating: 4.9,
    reviews_count: 84,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Вид на море',
      'Кухня',
      'Посудомоечная машина',
      'Стиральная машина',
      'Парковка',
      'Балкон',
      'Лифт',
      'Телевизор',
    ],
    lat: 44.5489,
    lng: 38.0521,
  },
  {
    slug: 'studiya-u-naberezhnoy',
    title: 'Студия у Набережной',
    district: 'Центр',
    address: 'ул. Революционная, 7',
    short_description: 'Компактная студия для двоих в минуте от моря — вариант для короткой поездки.',
    description:
      'Небольшая студия 26 м² с продуманной планировкой: двуспальная кровать, рабочий стол у окна ' +
      'и кухонная зона с индукционной плитой. Дом стоит первой линией, до пляжа «Круча» одна минута ' +
      'пешком. Подходит для пары на выходные или для командировки: интернет стабильный, 200 Мбит/с, ' +
      'рядом несколько кофеен с розетками. Парковки во дворе нет, зато общественный транспорт ' +
      'останавливается у подъезда.',
    rooms: 1,
    max_guests: 2,
    beds: 1,
    area: 26,
    floor: '2 из 5, без лифта',
    distance_to_sea: 1,
    base_price: 2900,
    cleaning_fee: 900,
    min_nights: 2,
    rating: 4.6,
    reviews_count: 213,
    amenities: ['Wi-Fi', 'Кондиционер', 'Кухня', 'Телевизор', 'Первая линия', 'Бесконтактное заселение'],
    lat: 44.5651,
    lng: 38.0805,
  },
  {
    slug: 'golubaya-buhta-apartamenty',
    title: 'Апартаменты в Голубой бухте',
    district: 'Голубая бухта',
    address: 'ул. Одесская, 3к2',
    short_description: 'Тихий район, сосны и галечный пляж без толпы в двухстах метрах от дома.',
    description:
      'Голубая бухта — это та часть Геленджика, где вместо шума набережной слышно только море ' +
      'и цикад. Апартаменты в малоэтажном комплексе с бассейном и зоной барбекю. Две комнаты, ' +
      'кондиционеры в каждой, детская кроватка и стульчик для кормления выдаются по запросу. ' +
      'До пляжа двести метров вниз по тенистой аллее. Рядом Голубая бухта и дельфинарий, ' +
      'до центра города десять минут на маршрутке.',
    rooms: 2,
    max_guests: 4,
    beds: 2,
    area: 54,
    floor: '2 из 4, без лифта',
    distance_to_sea: 3,
    base_price: 5200,
    cleaning_fee: 1500,
    min_nights: 3,
    rating: 4.7,
    reviews_count: 96,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Кухня',
      'Стиральная машина',
      'Парковка',
      'Бассейн',
      'Мангал',
      'Детская кроватка',
      'Телевизор',
    ],
    lat: 44.5762,
    lng: 37.9721,
  },
  {
    slug: 'dom-s-dvorikom-kabardinka',
    title: 'Дом с двориком в Кабардинке',
    district: 'Кабардинка',
    address: 'ул. Революционная, 41',
    short_description: 'Отдельный дом на шесть человек с виноградной беседкой и мангалом.',
    description:
      'Целый дом в двух кварталах от кабардинской набережной — без соседей за стеной и с личным двором. ' +
      'Три спальни, две ванные комнаты, большая кухня-гостиная с выходом в беседку, увитую виноградом. ' +
      'Во дворе мангал, стол на восьмерых, качели и место для двух машин. Хозяин живёт по соседству ' +
      'и помогает с бытовыми вопросами, но не тревожит без просьбы. До Старого парка пятнадцать минут пешком.',
    rooms: 3,
    max_guests: 6,
    beds: 4,
    area: 96,
    floor: 'Отдельный дом, 2 этажа',
    distance_to_sea: 8,
    base_price: 8200,
    cleaning_fee: 2500,
    min_nights: 4,
    rating: 4.9,
    reviews_count: 61,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Кухня',
      'Посудомоечная машина',
      'Стиральная машина',
      'Парковка',
      'Мангал',
      'Двор',
      'Детская кроватка',
      'Телевизор',
    ],
    lat: 44.6531,
    lng: 37.9394,
  },
  {
    slug: 'divnomorskoe-u-morya',
    title: 'Дивноморское, сто метров до моря',
    district: 'Дивноморское',
    address: 'ул. Кирова, 19',
    short_description: 'Однокомнатная квартира с террасой в посёлке с самым чистым морем в округе.',
    description:
      'Дивноморское выбирают за прозрачную воду и сосновый воздух — в самом Геленджике такого нет. ' +
      'Квартира на первом этаже с отдельным входом и террасой под навесом, где помещается стол ' +
      'и три кресла. Внутри двуспальная кровать и раскладное кресло для ребёнка. До пляжа сто метров, ' +
      'до автостанции пять минут. Летом хозяева оставляют в прихожей пляжные зонты и надувной матрас.',
    rooms: 1,
    max_guests: 3,
    beds: 2,
    area: 38,
    floor: '1 из 3, отдельный вход',
    distance_to_sea: 2,
    base_price: 4400,
    cleaning_fee: 1200,
    min_nights: 3,
    rating: 4.7,
    reviews_count: 148,
    amenities: ['Wi-Fi', 'Кондиционер', 'Кухня', 'Стиральная машина', 'Терраса', 'Парковка', 'Первая линия'],
    lat: 44.4971,
    lng: 38.1332,
  },
  {
    slug: 'loft-tonkiy-mys',
    title: 'Лофт на Тонком мысе',
    district: 'Тонкий мыс',
    address: 'ул. Луначарского, 128',
    short_description: 'Просторный лофт с кирпичной стеной, проектором и рабочим местом.',
    description:
      'Студия-лофт 60 м² в доме у Толстого мыса: высокие потолки, кирпичная кладка, мягкий свет ' +
      'и проектор с экраном во всю стену. Есть полноценное рабочее место с монитором — удобно, если ' +
      'совмещаете отдых с удалёнкой. Кухонный остров, кофемашина, винный шкаф. До пляжа ' +
      '«Сосновка» семь минут пешком через парк, до аэропорта пятнадцать минут на машине.',
    rooms: 1,
    max_guests: 4,
    beds: 2,
    area: 60,
    floor: '4 из 5, есть лифт',
    distance_to_sea: 7,
    base_price: 5700,
    cleaning_fee: 1600,
    min_nights: 2,
    rating: 4.8,
    reviews_count: 73,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Кухня',
      'Посудомоечная машина',
      'Стиральная машина',
      'Рабочее место',
      'Парковка',
      'Лифт',
      'Телевизор',
    ],
    lat: 44.5798,
    lng: 38.0182,
  },
  {
    slug: 'semeynye-apartamenty-marina-roshcha',
    title: 'Семейные апартаменты в Марьиной Роще',
    district: 'Марьина Роща',
    address: 'ул. Крымская, 22',
    short_description: 'Три спальни, детская площадка во дворе и бассейн — под большую семью.',
    description:
      'Квартира в жилом комплексе с закрытым двором, детской площадкой и подогреваемым бассейном. ' +
      'Три спальни: две с двуспальными кроватями, третья с двумя односпальными — можно разместить ' +
      'шестерых без диванов. В квартире детская посуда, горшок, ворота безопасности на кухню. ' +
      'До моря пятнадцать минут пешком по бульвару или пять минут на машине; парковочное место ' +
      'закреплено за квартирой.',
    rooms: 3,
    max_guests: 6,
    beds: 4,
    area: 82,
    floor: '5 из 9, два лифта',
    distance_to_sea: 15,
    base_price: 6300,
    cleaning_fee: 2000,
    min_nights: 3,
    rating: 4.8,
    reviews_count: 112,
    amenities: [
      'Wi-Fi',
      'Кондиционер',
      'Кухня',
      'Посудомоечная машина',
      'Стиральная машина',
      'Парковка',
      'Бассейн',
      'Детская кроватка',
      'Лифт',
      'Телевизор',
    ],
    lat: 44.5895,
    lng: 38.0413,
  },
] as const;

/** Демо-брони, чтобы календарь занятости не был пустым при первом запуске. */
const DEMO_BUSY: { slug: string; startsInDays: number; nights: number }[] = [
  { slug: 'morskoy-briz-centr', startsInDays: 6, nights: 5 },
  { slug: 'morskoy-briz-centr', startsInDays: 24, nights: 4 },
  { slug: 'panorama-tolstyy-mys', startsInDays: 3, nights: 7 },
  { slug: 'studiya-u-naberezhnoy', startsInDays: 12, nights: 3 },
  { slug: 'golubaya-buhta-apartamenty', startsInDays: 9, nights: 6 },
  { slug: 'dom-s-dvorikom-kabardinka', startsInDays: 18, nights: 8 },
  { slug: 'loft-tonkiy-mys', startsInDays: 5, nights: 4 },
];

export function seed(): void {
  const insertProperty = db.prepare(`
    INSERT INTO properties (
      slug, title, district, address, short_description, description, rooms, max_guests,
      beds, area, floor, distance_to_sea, base_price, cleaning_fee, min_nights,
      rating, reviews_count, amenities, images, lat, lng
    ) VALUES (
      @slug, @title, @district, @address, @short_description, @description, @rooms, @max_guests,
      @beds, @area, @floor, @distance_to_sea, @base_price, @cleaning_fee, @min_nights,
      @rating, @reviews_count, @amenities, @images, @lat, @lng
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      district = excluded.district,
      address = excluded.address,
      short_description = excluded.short_description,
      description = excluded.description,
      rooms = excluded.rooms,
      max_guests = excluded.max_guests,
      beds = excluded.beds,
      area = excluded.area,
      floor = excluded.floor,
      distance_to_sea = excluded.distance_to_sea,
      base_price = excluded.base_price,
      cleaning_fee = excluded.cleaning_fee,
      min_nights = excluded.min_nights,
      rating = excluded.rating,
      reviews_count = excluded.reviews_count,
      amenities = excluded.amenities,
      images = excluded.images
  `);

  const insertBlocked = db.prepare(
    `INSERT OR IGNORE INTO blocked_dates (property_id, date, reason) VALUES (?, ?, ?)`,
  );
  const propertyIdBySlug = db.prepare(`SELECT id FROM properties WHERE slug = ?`);

  db.transaction(() => {
    for (const property of PROPERTIES) {
      insertProperty.run({
        ...property,
        amenities: JSON.stringify(property.amenities),
        images: JSON.stringify([
          `/images/${property.slug}-1.svg`,
          `/images/${property.slug}-2.svg`,
          `/images/${property.slug}-3.svg`,
          `/images/${property.slug}-4.svg`,
        ]),
      });
    }

    const hasBlocked = db.prepare(`SELECT COUNT(*) AS count FROM blocked_dates`).get() as {
      count: number;
    };
    if (hasBlocked.count === 0) {
      for (const busy of DEMO_BUSY) {
        const row = propertyIdBySlug.get(busy.slug) as { id: number } | undefined;
        if (!row) continue;
        for (let i = 0; i < busy.nights; i += 1) {
          insertBlocked.run(row.id, addDays(today(), busy.startsInDays + i), 'Бронь по телефону');
        }
      }
    }
  })();
}

// Позволяет запускать сидирование отдельной командой: npm run seed
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed();
  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM properties`).get() as { count: number };
  console.log(`Каталог заполнен: ${count} объектов.`);
}
