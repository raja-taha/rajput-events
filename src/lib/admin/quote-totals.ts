export type QuoteLineForTotal = {
  quantity?: number | null;
  unitPriceExclTax?: number | null;
};

export type QuoteTotals = {
  itemSubtotal: number;
  feeExclTax: number;
  quoteTotal: number;
  bookingAdvanceAmount: number;
  advanceRate: number;
};

/** Store advance as 0–1. Values > 1 are treated as percent (e.g. 60 → 0.6). */
export function normalizeAdvanceRate(value: number | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0.6;
  if (n === 0) return 0;
  if (n > 1) return Math.min(n / 100, 1);
  return n;
}

export function lineAmount(
  quantity?: number | null,
  unitPriceExclTax?: number | null,
): number {
  return Number(quantity || 0) * Number(unitPriceExclTax || 0);
}

/**
 * Spec:
 * itemSubtotal = Σ (qty × unitPriceExclTax)
 * feeExclTax = itemSubtotal − discount
 * quoteTotal = feeExclTax + taxAmount
 * bookingAdvanceAmount = quoteTotal × bookingAdvancePercent (0–1)
 */
export function calcQuoteTotals(
  items: QuoteLineForTotal[],
  discount = 0,
  taxAmount = 0,
  bookingAdvancePercent: number | null | undefined = 0.6,
): QuoteTotals {
  const itemSubtotal = items.reduce(
    (sum, i) => sum + lineAmount(i.quantity, i.unitPriceExclTax),
    0,
  );
  const disc = Math.max(0, Number(discount || 0));
  const tax = Math.max(0, Number(taxAmount || 0));
  const feeExclTax = itemSubtotal - disc;
  const quoteTotal = feeExclTax + tax;
  const advanceRate = normalizeAdvanceRate(bookingAdvancePercent);
  const bookingAdvanceAmount = quoteTotal * advanceRate;

  return {
    itemSubtotal,
    feeExclTax,
    quoteTotal,
    bookingAdvanceAmount,
    advanceRate,
  };
}
