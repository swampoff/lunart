/**
 * Типы, общие для сервера и клиента.
 *
 * Модель предметной области: один частный дом (House), внутри которого несколько
 * апартаментов (Apartment). Адрес, двор, бассейн и парковка принадлежат дому,
 * а вместимость, площадь и цена — конкретным апартаментам.
 *
 * Даты везде — строки вида YYYY-MM-DD: заселение и выселение привязаны
 * к календарному дню, а не к моменту времени.
 */

export interface House {
  name: string;
  tagline: string;
  address: string;
  area: string;
  description: string;
  /** Что есть на общей территории и доступно всем гостям дома. */
  commonAmenities: string[];
  /** Сколько минут пешком до моря. */
  distanceToSea: number;
  /** Ориентиры поблизости: «Центральная набережная — 15 минут на машине». */
  nearby: { title: string; value: string }[];
  rules: { title: string; value: string }[];
  images: string[];
  phone: string;
  phoneHref: string;
  lat: number;
  lng: number;
}

export interface Apartment {
  id: number;
  slug: string;
  title: string;
  /** Тип размещения: студия, апартаменты с одной спальней и так далее. */
  kind: string;
  shortDescription: string;
  description: string;
  rooms: number;
  maxGuests: number;
  beds: number;
  area: number;
  floor: string;
  /** true — есть отдельный вход со двора, без общего коридора. */
  separateEntrance: boolean;
  basePrice: number;
  cleaningFee: number;
  minNights: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  images: string[];
}

export interface ApartmentWithAvailability extends Apartment {
  /** Занятые ночи на ближайший год — для подсветки в календаре. */
  busyDates: string[];
}

export interface SearchParams {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  priceMax?: number;
  amenities?: string[];
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

export interface QuoteNight {
  date: string;
  price: number;
  season: SeasonName;
}

export type SeasonName = 'низкий' | 'межсезонье' | 'высокий' | 'пиковый';

export interface Quote {
  apartmentId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  nightlyAverage: number;
  accommodationTotal: number;
  cleaningFee: number;
  discountPercent: number;
  discountAmount: number;
  discountReason: string | null;
  total: number;
  prepaymentPercent: number;
  prepayment: number;
  restOnArrival: number;
  breakdown: QuoteNight[];
}

export type BookingStatus = 'awaiting_payment' | 'paid' | 'cancelled' | 'expired';

export interface Guest {
  name: string;
  phone: string;
  email: string;
  comment?: string;
}

export interface Booking {
  id: string;
  apartmentId: number;
  apartmentTitle: string;
  apartmentSlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  guest: Guest;
  total: number;
  prepayment: number;
  restOnArrival: number;
  quote: Quote;
  createdAt: string;
  holdExpiresAt: string | null;
  payment: PaymentInfo | null;
}

export interface PaymentInfo {
  id: string;
  provider: string;
  status: 'pending' | 'succeeded' | 'canceled';
  amount: number;
  confirmationUrl: string | null;
  paidAt: string | null;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
