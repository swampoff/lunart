/**
 * Типы, общие для сервера и клиента.
 * Даты везде — строки в формате YYYY-MM-DD (без времени и таймзон):
 * заселение и выселение привязаны к календарному дню, а не к моменту времени.
 */

export type District =
  | 'Центр'
  | 'Толстый мыс'
  | 'Тонкий мыс'
  | 'Голубая бухта'
  | 'Марьина Роща'
  | 'Кабардинка'
  | 'Дивноморское';

export interface Property {
  id: number;
  slug: string;
  title: string;
  district: District;
  address: string;
  shortDescription: string;
  description: string;
  rooms: number;
  maxGuests: number;
  beds: number;
  area: number;
  floor: string;
  distanceToSea: number; // минут пешком
  basePrice: number; // рублей за ночь в базовый сезон
  cleaningFee: number;
  minNights: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  images: string[];
  lat: number;
  lng: number;
}

export interface PropertyWithAvailability extends Property {
  /** Занятые даты на ближайший год — для подсветки в календаре. */
  busyDates: string[];
}

export interface SearchParams {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  district?: string;
  priceMin?: number;
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
  propertyId: number;
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

export type BookingStatus =
  | 'awaiting_payment'
  | 'paid'
  | 'cancelled'
  | 'expired';

export interface Guest {
  name: string;
  phone: string;
  email: string;
  comment?: string;
}

export interface Booking {
  id: string;
  propertyId: number;
  propertyTitle: string;
  propertySlug: string;
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
