"use client";

import { useEffect, useState } from "react";
import { EntityFormClient } from "@/components/admin/EntityFormClient";
import { QuoteLineItemsEditor } from "@/components/admin/QuoteLineItemsEditor";
import { getOne } from "@/lib/admin/client-api";

type Props = { params: Promise<{ id: string }> };

export default function QuoteDetailPage({ params }: Props) {
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    discount: number;
    taxAmount: number;
    bookingAdvancePercent: number;
  }>({ discount: 0, taxAmount: 0, bookingAdvancePercent: 0.6 });

  useEffect(() => {
    void params.then(async ({ id }) => {
      const decoded = decodeURIComponent(id);
      setQuoteId(decoded);
      try {
        const quote = await getOne<Record<string, unknown>>("quotes", decoded);
        setMeta({
          discount: Number(quote.discount || 0),
          taxAmount: Number(quote.taxAmount || 0),
          bookingAdvancePercent: Number(quote.bookingAdvancePercent ?? 0.6),
        });
      } catch {
        // form client will surface load errors
      }
    });
  }, [params]);

  if (!quoteId) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading quote…</p>;
  }

  return (
    <div className="space-y-4">
      <EntityFormClient resourceKey="quotes" businessId={quoteId} />
      <QuoteLineItemsEditor
        quoteId={quoteId}
        discount={meta.discount}
        taxAmount={meta.taxAmount}
        bookingAdvancePercent={meta.bookingAdvancePercent}
      />
    </div>
  );
}
