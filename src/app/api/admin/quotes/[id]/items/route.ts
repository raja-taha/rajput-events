import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { created, fail, ok, unauthorized, notFound } from "@/lib/admin/api";
import { nextBusinessId } from "@/lib/admin/ids";
import { writeAudit } from "@/lib/admin/audit";
import { Quote } from "@/models/Quote";
import { QuoteItem } from "@/models/QuoteItem";

type Ctx = { params: Promise<{ id: string }> };

function calcTotals(
  items: Array<{ quantity?: number; unitPriceExclTax?: number }>,
  discount: number,
  taxAmount: number,
  bookingAdvancePercent: number,
) {
  const itemSubtotal = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPriceExclTax || 0),
    0,
  );
  const feeExclTax = itemSubtotal - Number(discount || 0);
  const quoteTotal = feeExclTax + Number(taxAmount || 0);
  const bookingAdvanceAmount = quoteTotal * Number(bookingAdvancePercent || 0);
  return { itemSubtotal, feeExclTax, quoteTotal, bookingAdvanceAmount };
}

export async function GET(request: NextRequest, context: Ctx) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const { id } = await context.params;
  const quoteId = decodeURIComponent(id);

  const quote = await Quote.findOne({ quoteId, archivedAt: null }).lean();
  if (!quote) return notFound("Quote not found");

  const items = await QuoteItem.find({ quoteId, archivedAt: null })
    .sort({ createdAt: 1 })
    .lean();

  const lines = items.map((item) => ({
    ...item,
    lineAmount:
      Number(item.quantity || 0) * Number(item.unitPriceExclTax || 0),
  }));

  const totals = calcTotals(
    items,
    Number(quote.discount || 0),
    Number(quote.taxAmount || 0),
    Number(quote.bookingAdvancePercent || 0),
  );

  return ok({ quoteId, items: lines, totals });
}

export async function POST(request: NextRequest, context: Ctx) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const { id } = await context.params;
  const quoteId = decodeURIComponent(id);

  const quote = await Quote.findOne({ quoteId, archivedAt: null });
  if (!quote) return notFound("Quote not found");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Invalid request body");
  }

  const lineId = await nextBusinessId("quoteLine");
  const doc = await QuoteItem.create({
    lineId,
    quoteId,
    category: body.category || "Other",
    serviceDeliverable: body.serviceDeliverable || "",
    specificationFinish: body.specificationFinish || "",
    quantity: Number(body.quantity ?? 1),
    unit: body.unit || "item",
    unitPriceExclTax: Number(body.unitPriceExclTax ?? 0),
    notes: body.notes || "",
    createdBy: session.email,
    updatedBy: session.email,
  });

  await writeAudit({
    action: "create",
    resource: "quoteItems",
    businessId: lineId,
    actor: session.email,
    metadata: { quoteId },
  });

  return created(doc.toObject());
}
