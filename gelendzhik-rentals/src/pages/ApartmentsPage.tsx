import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchParams } from '@shared/types';
import { ApartmentCard } from '@/components/ApartmentCard';
import { SearchForm } from '@/components/SearchForm';
import { api, searchToQuery, type ApartmentListItem, type FiltersResponse } from '@/lib/api';
import { formatRange, plural } from '@/lib/dates';

const SORT_LABELS: { value: NonNullable<SearchParams['sort']>; label: string }[] = [
  { value: 'popular', label: 'Как в доме' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала просторные' },
  { value: 'rating', label: 'По отзывам' },
];

export function ApartmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ApartmentListItem[]>([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params: SearchParams = useMemo(
    () => ({
      checkIn: searchParams.get('checkIn') ?? undefined,
      checkOut: searchParams.get('checkOut') ?? undefined,
      guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
      rooms: searchParams.get('rooms') ? Number(searchParams.get('rooms')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      amenities: searchParams.get('amenities')?.split(',').filter(Boolean) ?? [],
      sort: (searchParams.get('sort') as SearchParams['sort']) ?? 'popular',
    }),
    [searchParams],
  );

  useEffect(() => {
    api.filters().then(setFilters);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .apartments(params)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setAvailableCount(data.availableCount);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  function update(patch: Partial<SearchParams>) {
    setSearchParams(searchToQuery({ ...params, ...patch }), { replace: true });
  }

  function toggleAmenity(amenity: string) {
    const current = params.amenities ?? [];
    update({
      amenities: current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    });
  }

  const searchQuery = searchToQuery(params);
  const hasDates = Boolean(params.checkIn && params.checkOut);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Апартаменты в доме</h1>
      <p className="mt-2 text-ink-soft">
        {hasDates
          ? `Занятость на ${formatRange(params.checkIn!, params.checkOut!)}: свободно ${availableCount} из ${items.length}`
          : 'Выберите даты, чтобы увидеть свободные апартаменты и точную стоимость'}
      </p>

      <div className="mt-6">
        <SearchForm
          variant="inline"
          initial={{ checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className={filtersOpen ? 'block' : 'hidden lg:block'}>
          <div className="space-y-6 rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-sea-950/5">
            {filters && (
              <>
                <div>
                  <p className="text-sm font-bold">Гостей</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={!params.guests} label="Любое" onClick={() => update({ guests: undefined })} />
                    {Array.from({ length: filters.maxGuests }, (_, i) => i + 1).map((count) => (
                      <Chip
                        key={count}
                        active={params.guests === count}
                        label={String(count)}
                        onClick={() => update({ guests: count })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold">Комнат, не меньше</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip active={!params.rooms} label="Любое" onClick={() => update({ rooms: undefined })} />
                    {Array.from({ length: filters.maxRooms }, (_, i) => i + 1).map((count) => (
                      <Chip
                        key={count}
                        active={params.rooms === count}
                        label={String(count)}
                        onClick={() => update({ rooms: count })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold">Цена за ночь</p>
                  <input
                    type="range"
                    min={filters.priceMin}
                    max={filters.priceMax}
                    step={100}
                    value={params.priceMax ?? filters.priceMax}
                    onChange={(event) => update({ priceMax: Number(event.target.value) })}
                    className="mt-3 w-full accent-sea-900"
                  />
                  <p className="mt-1 text-sm text-ink-soft">
                    до {(params.priceMax ?? filters.priceMax).toLocaleString('ru-RU')} ₽
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold">Удобства</p>
                  <div className="mt-3 space-y-2">
                    {filters.amenities.map((amenity) => (
                      <label key={amenity} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={params.amenities?.includes(amenity) ?? false}
                          onChange={() => toggleAmenity(amenity)}
                          className="size-4 accent-sea-900"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setSearchParams('', { replace: true })}
              className="w-full rounded-xl border border-sand-dark py-2.5 text-sm font-semibold text-ink-soft transition hover:text-sea-900"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              {loading
                ? 'Идёт поиск…'
                : `${items.length} ${plural(items.length, ['вариант', 'варианта', 'вариантов'])}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-sand-dark px-3 py-2 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Фильтры
              </button>
              <select
                value={params.sort}
                onChange={(event) => update({ sort: event.target.value as SearchParams['sort'] })}
                className="cursor-pointer rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm font-semibold outline-none"
              >
                {SORT_LABELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-ink-soft">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <Empty
              title="Под такие условия апартаментов нет"
              text="Снимите часть фильтров — в доме всего несколько квартир, и подходящая может отличаться на одну комнату."
            />
          ) : (
            <>
              {hasDates && availableCount === 0 && (
                <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  На эти даты дом занят целиком. Попробуйте сдвинуть поездку на пару дней —
                  или позвоните нам, иногда даты освобождаются за день до заезда.
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {items.map((item) => (
                  <ApartmentCard key={item.apartment.id} item={item} searchQuery={searchQuery} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
        active ? 'bg-sea-900 text-white' : 'bg-sand text-ink-soft hover:text-sea-900',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white p-10 text-center shadow-sm ring-1 ring-sea-950/5">
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-2 text-ink-soft">{text}</p>
    </div>
  );
}
