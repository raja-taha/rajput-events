import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { fail, notFound, ok, unauthorized } from "@/lib/admin/api";
import { writeAudit } from "@/lib/admin/audit";
import { QuoteItem } from "@/models/QuoteItem";

type Ctx = { params: Promise<{ id: string; lineId: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const { id, lineId } = await context.params;
  const quoteId = decodeURIComponent(id);
  const line = decodeURIComponent(lineId);

  const existing = await QuoteItem.findOne({ quoteId, lineId: line, archivedAt: null });
  if (!existing) return notFound("Line item not found");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Invalid request body");
  }

  const allowed = [
    "category",
    "serviceDeliverable",
    "specificationFinish",
    "quantity",
    "unit",
    "unitPriceExclTax",
    "notes",
    "approvalDeadline",
  ] as const;

  for (const key of allowed) {
    if (key in body) {
      if (key === "quantity" || key === "unitPriceExclTax") {
        existing.set(key, Number(body[key] ?? 0));
      } else {
        existing.set(key, body[key]);
      }
    }
  }
  existing.set("updatedBy", session.email);
  await existing.save();

  await writeAudit({
    action: "update",
    resource: "quoteItems",
    businessId: line,
    actor: session.email,
    metadata: { quoteId },
  });

  return ok(existing.toObject());
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const { id, lineId } = await context.params;
  const quoteId = decodeURIComponent(id);
  const line = decodeURIComponent(lineId);

  const existing = await QuoteItem.findOne({ quoteId, lineId: line, archivedAt: null });
  if (!existing) return notFound("Line item not found");

  existing.set({
    archivedAt: new Date(),
    archivedBy: session.email,
    updatedBy: session.email,
  });
  await existing.save();

  await writeAudit({
    action: "archive",
    resource: "quoteItems",
    businessId: line,
    actor: session.email,
    metadata: { quoteId },
  });

  return ok({ archived: true, lineId: line });
}
