import type {
  Apartment,
  ApartmentWithAvailability,
  Booking,
  House,
  PaymentInfo,
  Quote,
  SearchParams,
} from '@shared/types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.', 'network', 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (payload as { message?: string } | null)?.message ?? 'Не удалось выполнить запрос';
    const code = (payload as { error?: string } | null)?.error ?? 'unknown';
    throw new ApiError(message, code, response.status);
  }

  return payload as T;
}

export interface HouseInfo extends House {
  apartmentsCount: number;
  maxGuests: number;
  priceFrom: number;
}

export interface ApartmentListItem {
  apartment: Apartment;
  available: boolean;
  unavailableReason: string | null;
  quote: Quote | null;
}

export interface ApartmentsResponse {
  items: ApartmentListItem[];
  total: number;
  availableCount: number;
  searchedWithDates: boolean;
}

export interface FiltersResponse {
  amenities: string[];
  priceMin: number;
  priceMax: number;
  maxGuests: number;
  maxRooms: number;
}

export function searchToQuery(params: SearchParams): string {
  const query = new URLSearchParams();
  if (params.checkIn) query.set('checkIn', params.checkIn);
  if (params.checkOut) query.set('checkOut', params.checkOut);
  if (params.guests) query.set('guests', String(params.guests));
  if (params.rooms) query.set('rooms', String(params.rooms));
  if (params.priceMax !== undefined) query.set('priceMax', String(params.priceMax));
  if (params.amenities?.length) query.set('amenities', params.amenities.join(','));
  if (params.sort) query.set('sort', params.sort);
  return query.toString();
}

export const api = {
  house: () => request<HouseInfo>('/house'),

  apartments: (params: SearchParams) =>
    request<ApartmentsResponse>(`/apartments?${searchToQuery(params)}`),

  apartment: (slug: string) => request<ApartmentWithAvailability>(`/apartments/${slug}`),

  filters: () => request<FiltersResponse>('/filters'),

  quote: (body: { apartmentSlug: string; checkIn: string; checkOut: string; guests: number }) =>
    request<{ available: boolean; quote: Quote }>('/quote', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createBooking: (body: {
    stay: { apartmentSlug: string; checkIn: string; checkOut: string; guests: number };
    guest: { name: string; phone: string; email: string; comment?: string };
  }) => request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(body) }),

  booking: (id: string) => request<Booking>(`/bookings/${encodeURIComponent(id)}`),

  cancelBooking: (id: string) =>
    request<Booking>(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),

  createPayment: (bookingId: string) =>
    request<Pick<PaymentInfo, 'id' | 'status' | 'amount' | 'confirmationUrl'>>('/payments', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  payment: (id: string) =>
    request<PaymentInfo & { provider: string; booking: Booking }>(`/payments/${id}`),

  simulatePayment: (id: string, outcome: 'succeeded' | 'canceled') =>
    request<Booking>(`/payments/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ outcome }),
    }),
};

export function formatMoney(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}
