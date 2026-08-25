import { useState } from 'react';
import type { Quote } from '@shared/types';
import { formatMoney } from '@/lib/api';
import { formatHuman, nightsLabel } from '@/lib/dates';

export function PriceBreakdown({ quote }: { quote: Quote }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-3 text-sm">
      <Row
        label={
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="underline decoration-dotted underline-offset-4 hover:text-sea-900"
          >
            {formatMoney(quote.nightlyAverage)} × {nightsLabel(quote.nights)}
          </button>
        }
        value={formatMoney(quote.accommodationTotal)}
      />

      {detailsOpen && (
        <ul className="rounded-xl bg-sea-50 p-3 text-xs text-ink-soft">
          {quote.breakdown.map((night) => (
            <li key={night.date} className="flex justify-between py-0.5">
              <span>
                {formatHuman(night.date)} · {night.season} сезон
              </span>
              <span className="font-medium text-ink">{formatMoney(night.price)}</span>
            </li>
          ))}
        </ul>
      )}

      {quote.discountAmount > 0 && (
        <Row
          label={<span className="text-sea-700">{quote.discountReason}</span>}
          value={<span className="text-sea-700">−{formatMoney(quote.discountAmount)}</span>}
        />
      )}

      <Row label="Уборка и постельное бельё" value={formatMoney(quote.cleaningFee)} />

      <div className="flex items-center justify-between border-t border-sand-dark pt-3 text-base font-bold">
        <span>Итого</span>
        <span>{formatMoney(quote.total)}</span>
      </div>

      <div className="rounded-xl bg-sea-50 p-3">
        <div className="flex justify-between font-semibold text-sea-900">
          <span>Предоплата сейчас ({quote.prepaymentPercent}%)</span>
          <span>{formatMoney(quote.prepayment)}</span>
        </div>
        <div className="mt-1 flex justify-between text-ink-soft">
          <span>Остаток при заселении</span>
          <span>{formatMoney(quote.restOnArrival)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className="shrink-0 font-medium">{value}</span>
    </div>
  );
}
