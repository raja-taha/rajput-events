"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/admin/money";
import { QUOTE_ITEM_CATEGORY } from "@/models/enums";

type LineItem = {
  lineId: string;
  category?: string;
  serviceDeliverable?: string;
  quantity?: number;
  unit?: string;
  unitPriceExclTax?: number;
  lineAmount?: number;
  notes?: string;
};

type Totals = {
  itemSubtotal: number;
  feeExclTax: number;
  quoteTotal: number;
  bookingAdvanceAmount: number;
};

type Props = {
  quoteId: string;
  discount?: number;
  taxAmount?: number;
  bookingAdvancePercent?: number;
};

export function QuoteLineItemsEditor({
  quoteId,
  discount = 0,
  taxAmount = 0,
  bookingAdvancePercent = 0.6,
}: Props) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    category: "Other",
    serviceDeliverable: "",
    quantity: "1",
    unit: "item",
    unitPriceExclTax: "0",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotes/${encodeURIComponent(quoteId)}/items`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load items");
      setItems(data.items || []);
      setTotals(data.totals || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/quotes/${encodeURIComponent(quoteId)}/items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          serviceDeliverable: draft.serviceDeliverable,
          quantity: Number(draft.quantity || 0),
          unit: draft.unit,
          unitPriceExclTax: Number(draft.unitPriceExclTax || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to add line");
      setDraft({
        category: "Other",
        serviceDeliverable: "",
        quantity: "1",
        unit: "item",
        unitPriceExclTax: "0",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add line");
    } finally {
      setSaving(false);
    }
  }

  async function removeLine(lineId: string) {
    if (!window.confirm(`Archive line ${lineId}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/quotes/${encodeURIComponent(quoteId)}/items/${encodeURIComponent(lineId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to archive line");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive line");
    } finally {
      setSaving(false);
    }
  }

  const liveTotals = (() => {
    if (totals) return totals;
    const itemSubtotal = items.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPriceExclTax || 0),
      0,
    );
    const feeExclTax = itemSubtotal - Number(discount || 0);
    const quoteTotal = feeExclTax + Number(taxAmount || 0);
    return {
      itemSubtotal,
      feeExclTax,
      quoteTotal,
      bookingAdvanceAmount: quoteTotal * Number(bookingAdvancePercent || 0),
    };
  })();

  return (
    <div className="admin-card mt-4 overflow-hidden">
      <div className="border-b border-[var(--admin-border)] px-4 py-3">
        <h3 className="font-semibold">Quote line items</h3>
        <p className="text-xs text-[var(--admin-muted)]">
          Line amounts are calculated as quantity × unit price (excl. tax). Totals update from live lines.
        </p>
      </div>

      {error ? (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Line</th>
              <th>Category</th>
              <th>Deliverable</th>
              <th className="text-right">Qty</th>
              <th>Unit</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Line amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Loading…</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-[var(--admin-muted)]">
                  No line items yet. Add the first deliverable below.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.lineId}>
                  <td className="font-mono text-xs">{item.lineId}</td>
                  <td>{item.category || "—"}</td>
                  <td>{item.serviceDeliverable || "—"}</td>
                  <td className="text-right tabular-nums">{item.quantity ?? 0}</td>
                  <td>{item.unit || "—"}</td>
                  <td className="text-right tabular-nums">
                    {formatMoney(Number(item.unitPriceExclTax || 0))}
                  </td>
                  <td className="text-right tabular-nums font-medium">
                    {formatMoney(
                      Number(
                        item.lineAmount ??
                          Number(item.quantity || 0) * Number(item.unitPriceExclTax || 0),
                      ),
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost !p-2"
                      onClick={() => void removeLine(item.lineId)}
                      disabled={saving}
                      aria-label="Archive line"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={addLine}
        className="grid gap-3 border-t border-[var(--admin-border)] p-4 md:grid-cols-6"
      >
        <label className="space-y-1 text-xs md:col-span-1">
          <span className="font-semibold text-[var(--admin-muted)]">Category</span>
          <select
            className="admin-input"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          >
            {QUOTE_ITEM_CATEGORY.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs md:col-span-2">
          <span className="font-semibold text-[var(--admin-muted)]">Deliverable</span>
          <input
            className="admin-input"
            required
            value={draft.serviceDeliverable}
            onChange={(e) =>
              setDraft((d) => ({ ...d, serviceDeliverable: e.target.value }))
            }
            placeholder="e.g. Stage backdrop"
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold text-[var(--admin-muted)]">Qty</span>
          <input
            className="admin-input"
            type="number"
            min="0"
            step="any"
            value={draft.quantity}
            onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold text-[var(--admin-muted)]">Unit price</span>
          <input
            className="admin-input"
            type="number"
            min="0"
            step="any"
            value={draft.unitPriceExclTax}
            onChange={(e) =>
              setDraft((d) => ({ ...d, unitPriceExclTax: e.target.value }))
            }
          />
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary w-full">
            <Plus size={14} />
            {saving ? "Adding…" : "Add line"}
          </button>
        </div>
      </form>

      <div className="grid gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Item subtotal
          </div>
          <div className="font-semibold tabular-nums">
            {formatMoney(liveTotals.itemSubtotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Fee excl. tax
          </div>
          <div className="font-semibold tabular-nums">
            {formatMoney(liveTotals.feeExclTax)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Quote total
          </div>
          <div className="font-semibold tabular-nums">
            {formatMoney(liveTotals.quoteTotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Booking advance
          </div>
          <div className="font-semibold tabular-nums">
            {formatMoney(liveTotals.bookingAdvanceAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}
