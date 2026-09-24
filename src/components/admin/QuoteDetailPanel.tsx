"use client";

import { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/lib/admin/money";
import {
  calcQuoteTotals,
  normalizeAdvanceRate,
  type QuoteTotals,
} from "@/lib/admin/quote-totals";

type LineItem = {
  lineId: string;
  category?: string;
  serviceDeliverable?: string;
  quantity?: number;
  unit?: string;
  unitPriceExclTax?: number;
  lineAmount?: number;
};

export function QuoteDetailPanel({
  quoteId,
  discount = 0,
  taxAmount = 0,
  bookingAdvancePercent = 0.6,
}: {
  quoteId: string;
  discount?: number;
  taxAmount?: number;
  bookingAdvancePercent?: number;
}) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [totals, setTotals] = useState<QuoteTotals | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/quotes/${encodeURIComponent(quoteId)}/items`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load items");
      const list = (data.items || []) as LineItem[];
      setItems(list);
      setTotals(
        data.totals ||
          calcQuoteTotals(list, discount, taxAmount, bookingAdvancePercent),
      );
    } catch {
      setItems([]);
      setTotals(calcQuoteTotals([], discount, taxAmount, bookingAdvancePercent));
    } finally {
      setLoading(false);
    }
  }, [quoteId, discount, taxAmount, bookingAdvancePercent]);

  useEffect(() => {
    void load();
  }, [load]);

  const advancePct = `${Math.round(
    normalizeAdvanceRate(bookingAdvancePercent) * 100,
  )}%`;
  const resolved = totals || calcQuoteTotals(items, discount, taxAmount, bookingAdvancePercent);

  return (
    <div className="space-y-4 border-t border-[var(--admin-border)] pt-5">
      <div>
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Line items
        </h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--admin-border)]">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Category
                </th>
                <th className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Deliverable
                </th>
                <th className="px-2.5 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Qty
                </th>
                <th className="px-2.5 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Unit price
                </th>
                <th className="px-2.5 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2.5 py-6 text-center text-[var(--admin-muted)]"
                  >
                    Loading line items…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2.5 py-6 text-center text-[var(--admin-muted)]"
                  >
                    No line items yet
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.lineId}
                    className="border-b border-[var(--admin-border)]"
                  >
                    <td className="px-2.5 py-1.5">{item.category || "—"}</td>
                    <td className="px-2.5 py-1.5">
                      {item.serviceDeliverable || "—"}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">
                      {item.quantity ?? "—"}
                      {item.unit ? ` ${item.unit}` : ""}
                    </td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">
                      {formatMoney(Number(item.unitPriceExclTax || 0))}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-medium tabular-nums">
                      {formatMoney(
                        Number(
                          item.lineAmount ??
                            Number(item.quantity || 0) *
                              Number(item.unitPriceExclTax || 0),
                        ),
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)]/50 p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Item subtotal
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(resolved.itemSubtotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            − Discount
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(Math.max(0, Number(discount || 0)))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Fee excl. tax
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(resolved.feeExclTax)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Quote total
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(resolved.quoteTotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Advance ({advancePct})
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatMoney(resolved.bookingAdvanceAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}
