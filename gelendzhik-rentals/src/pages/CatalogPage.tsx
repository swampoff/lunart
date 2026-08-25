import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchParams } from '@shared/types';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchForm } from '@/components/SearchForm';
import { api, searchToQuery, type CatalogItem, type FiltersResponse } from '@/lib/api';
import { formatRange, plural } from '@/lib/dates';

const SORT_LABELS: { value: NonNullable<SearchParams['sort']>; label: string }[] = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'rating', label: 'По рейтингу' },
];

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params: SearchParams = useMemo(
    () => ({
      checkIn: searchParams.get('checkIn') ?? undefined,
      checkOut: searchParams.get('checkOut') ?? undefined,
      guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
      district: searchParams.get('district') ?? undefined,
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
      .properties(params)
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  function update(patch: Partial<SearchParams>) {
    const next = { ...params, ...patch };
    setSearchParams(searchToQuery(next), { replace: true });
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
      <h1 className="text-2xl font-extrabold sm:text-3xl">Квартиры в Геленджике</h1>
      <p className="mt-2 text-ink-soft">
        {hasDates
          ? `Свободны ${formatRange(params.checkIn!, params.checkOut!)}`
          : 'Выберите даты, чтобы увидеть только свободные квартиры и точную стоимость'}
      </p>

      <div className="mt-6">
        <SearchForm
          variant="inline"
          initial={{ checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={filtersOpen ? 'block' : 'hidden lg:block'}>
          <div className="space-y-6 rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-sea-950/5">
            <div>
              <p className="text-sm font-bold">Район</p>
              <div className="mt-3 space-y-2">
                <FilterRadio
                  checked={!params.district}
                  label="Любой"
                  onChange={() => update({ district: undefined })}
                />
                {filters?.districts.map((district) => (
                  <FilterRadio
                    key={district}
                    checked={params.district === district}
                    label={district}
                    onChange={() => update({ district })}
                  />
                ))}
              </div>
            </div>

            {filters && (
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
            )}

            <div>
              <p className="text-sm font-bold">Удобства</p>
              <div className="mt-3 space-y-2">
                {filters?.amenities.map((amenity) => (
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
            <div className="rounded-[1.25rem] bg-white p-10 text-center shadow-sm ring-1 ring-sea-950/5">
              <p className="text-lg font-bold">На эти условия ничего не нашлось</p>
              <p className="mt-2 text-ink-soft">
                Попробуйте сдвинуть даты на пару дней, снять часть фильтров или посмотреть соседние
                посёлки — Кабардинку и Дивноморское.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item) => (
                <PropertyCard key={item.property.id} item={item} searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterRadio({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        name="district"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-sea-900"
      />
      {label}
    </label>
  );
}
