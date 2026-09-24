"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatMoney } from "@/lib/admin/money";
import {
  calcQuoteTotals,
  lineAmount,
  normalizeAdvanceRate,
} from "@/lib/admin/quote-totals";
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
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingLineId, setDeletingLineId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    category: "Other",
    serviceDeliverable: "",
    quantity: "1",
    unit: "item",
    unitPriceExclTax: "0",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quotes/${encodeURIComponent(quoteId)}/items`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load items");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(
    () => calcQuoteTotals(items, discount, taxAmount, bookingAdvancePercent),
    [items, discount, taxAmount, bookingAdvancePercent],
  );

  const draftLineAmount = lineAmount(
    Number(draft.quantity || 0),
    Number(draft.unitPriceExclTax || 0),
  );

  const advancePctLabel = `${Math.round(normalizeAdvanceRate(bookingAdvancePercent) * 100)}%`;

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.serviceDeliverable.trim()) {
      toast.error("Deliverable is required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/quotes/${encodeURIComponent(quoteId)}/items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          serviceDeliverable: draft.serviceDeliverable.trim(),
          quantity: Number(draft.quantity || 0),
          unit: draft.unit || "item",
          unitPriceExclTax: Number(draft.unitPriceExclTax || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to add line");
      toast.success("Line item added");
      setDraft({
        category: "Other",
        serviceDeliverable: "",
        quantity: "1",
        unit: "item",
        unitPriceExclTax: "0",
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add line");
    } finally {
      setAdding(false);
    }
  }

  async function removeLine(lineId: string) {
    if (!window.confirm(`Archive line ${lineId}?`)) return;
    setDeletingLineId(lineId);
    try {
      const res = await fetch(
        `/api/admin/quotes/${encodeURIComponent(quoteId)}/items/${encodeURIComponent(lineId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to archive line");
      toast.success("Line item archived");
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive line");
    } finally {
      setDeletingLineId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--admin-border)]">
      <div className="border-b border-[var(--admin-border)] px-3 py-2.5">
        <h3 className="text-xs font-semibold">Quote line items</h3>
        <p className="text-[10px] text-[var(--admin-muted)]">
          Line amount = qty × unit price (excl. tax). Totals use discount, tax and advance from
          the fields above (save quote to persist those).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table text-xs">
          <thead>
            <tr>
              <th>Line</th>
              <th>Category</th>
              <th>Deliverable</th>
              <th className="text-right">Qty</th>
              <th>Unit</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Line amount</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[var(--admin-muted)]">
                  <Loader2 size={14} className="mr-1.5 inline animate-spin" />
                  Loading lines…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-[var(--admin-muted)]">
                  No line items yet. Add the first deliverable below.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const amount = lineAmount(item.quantity, item.unitPriceExclTax);
                const isDeleting = deletingLineId === item.lineId;
                return (
                  <tr key={item.lineId} className={isDeleting ? "opacity-60" : undefined}>
                    <td className="font-mono text-[10px]">{item.lineId}</td>
                    <td>{item.category || "—"}</td>
                    <td>{item.serviceDeliverable || "—"}</td>
                    <td className="text-right tabular-nums">{item.quantity ?? 0}</td>
                    <td>{item.unit || "—"}</td>
                    <td className="text-right tabular-nums">
                      {formatMoney(Number(item.unitPriceExclTax || 0))}
                    </td>
                    <td className="text-right font-medium tabular-nums">
                      {formatMoney(amount)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost !p-1.5"
                        onClick={() => void removeLine(item.lineId)}
                        disabled={isDeleting || adding}
                        aria-label={isDeleting ? "Archiving…" : "Archive line"}
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={addLine}
        className="grid gap-2 border-t border-[var(--admin-border)] p-3 sm:grid-cols-2 lg:grid-cols-7"
      >
        <label className="space-y-0.5 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Category
          </span>
          <select
            className="admin-input"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            disabled={adding}
          >
            {QUOTE_ITEM_CATEGORY.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-0.5 text-[10px] sm:col-span-2 lg:col-span-2">
          <span className="font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Deliverable
          </span>
          <input
            className="admin-input"
            required
            value={draft.serviceDeliverable}
            onChange={(e) =>
              setDraft((d) => ({ ...d, serviceDeliverable: e.target.value }))
            }
            placeholder="e.g. Stage backdrop"
            disabled={adding}
          />
        </label>
        <label className="space-y-0.5 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Qty
          </span>
          <input
            className="admin-input"
            type="number"
            min="0"
            step="any"
            value={draft.quantity}
            onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
            disabled={adding}
          />
        </label>
        <label className="space-y-0.5 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Unit
          </span>
          <input
            className="admin-input"
            value={draft.unit}
            onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
            disabled={adding}
          />
        </label>
        <label className="space-y-0.5 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Unit price
          </span>
          <input
            className="admin-input"
            type="number"
            min="0"
            step="any"
            value={draft.unitPriceExclTax}
            onChange={(e) =>
              setDraft((d) => ({ ...d, unitPriceExclTax: e.target.value }))
            }
            disabled={adding}
          />
        </label>
        <div className="flex flex-col justify-end gap-1">
          <span className="text-[10px] text-[var(--admin-muted)]">
            Line: {formatMoney(draftLineAmount)}
          </span>
          <button
            type="submit"
            disabled={adding || !!deletingLineId}
            className="admin-btn admin-btn-primary w-full"
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {adding ? "Adding…" : "Add line"}
          </button>
        </div>
      </form>

      <div className="grid gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Item subtotal
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatMoney(totals.itemSubtotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            − Discount
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatMoney(Math.max(0, Number(discount || 0)))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Fee excl. tax
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatMoney(totals.feeExclTax)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            + Tax → Quote total
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatMoney(totals.quoteTotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Advance ({advancePctLabel})
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatMoney(totals.bookingAdvanceAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}
