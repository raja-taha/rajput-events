import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { created, fail, ok, unauthorized, notFound } from "@/lib/admin/api";
import { nextBusinessId } from "@/lib/admin/ids";
import { writeAudit } from "@/lib/admin/audit";
import { calcQuoteTotals, lineAmount } from "@/lib/admin/quote-totals";
import { Quote } from "@/models/Quote";
import { QuoteItem } from "@/models/QuoteItem";

type Ctx = { params: Promise<{ id: string }> };

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
    lineAmount: lineAmount(item.quantity, item.unitPriceExclTax),
  }));

  const totals = calcQuoteTotals(
    items,
    Number(quote.discount || 0),
    Number(quote.taxAmount || 0),
    quote.bookingAdvancePercent == null ? 0.6 : Number(quote.bookingAdvancePercent),
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

  const quantity = Number(body.quantity ?? 1);
  const unitPriceExclTax = Number(body.unitPriceExclTax ?? 0);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return fail("VALIDATION", "Quantity must be a non-negative number");
  }
  if (!Number.isFinite(unitPriceExclTax) || unitPriceExclTax < 0) {
    return fail("VALIDATION", "Unit price must be a non-negative number");
  }

  const lineId = await nextBusinessId("quoteLine");
  const doc = await QuoteItem.create({
    lineId,
    quoteId,
    category: body.category || "Other",
    serviceDeliverable: String(body.serviceDeliverable || "").trim(),
    specificationFinish: body.specificationFinish || "",
    quantity,
    unit: body.unit || "item",
    unitPriceExclTax,
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

  return created({
    ...doc.toObject(),
    lineAmount: lineAmount(quantity, unitPriceExclTax),
  });
}
