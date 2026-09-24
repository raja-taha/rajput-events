import { NextRequest } from "next/server";
import { getResourceDef } from "@/lib/admin/resources";
import { crudCreate } from "@/lib/admin/crud";
import {
  listResult,
  notFound,
  ok,
  parseListParams,
  unauthorized,
} from "@/lib/admin/api";
import { requireAdminApi } from "@/lib/admin/auth";
import { connectMongo } from "@/lib/admin/mongodb";
import { calcQuoteTotals } from "@/lib/admin/quote-totals";
import { Customer } from "@/models/Customer";
import { Venue } from "@/models/Venue";
import { Quote } from "@/models/Quote";
import { QuoteItem } from "@/models/QuoteItem";

const def = getResourceDef("bookings");

export async function GET(request: NextRequest) {
  if (!def) return notFound();

  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();

  const url = new URL(request.url);
  const { page, pageSize, search, sort, skip } = parseListParams(url);
  const includeArchived = url.searchParams.get("archived") === "1";
  const filter: Record<string, unknown> = includeArchived
    ? {}
    : { archivedAt: null };

  if (search) {
    const regex = { $regex: search, $options: "i" };
    const [matchedCustomers, matchedVenues] = await Promise.all([
      Customer.find({
        archivedAt: null,
        $or: [
          { fullName: regex },
          { customerId: regex },
          { email: regex },
          { mobileWhatsApp: regex },
        ],
      })
        .select("customerId")
        .lean(),
      Venue.find({
        archivedAt: null,
        $or: [{ venueName: regex }, { venueId: regex }, { areaCity: regex }],
      })
        .select("venueId")
        .lean(),
    ]);
    const customerIds = matchedCustomers.map((c) => String(c.customerId));
    const venueIds = matchedVenues.map((v) => String(v.venueId));

    filter.$or = [
      ...def.searchFields.map((f) => ({ [f]: regex })),
      ...(customerIds.length ? [{ customerId: { $in: customerIds } }] : []),
      ...(venueIds.length ? [{ venueId: { $in: venueIds } }] : []),
    ];
  }

  const effectiveSort =
    url.searchParams.get("sort") != null
      ? sort
      : ({ [def.businessIdField]: 1 } as Record<string, 1 | -1>);

  const [data, total] = await Promise.all([
    def.model.find(filter).sort(effectiveSort).skip(skip).limit(pageSize).lean(),
    def.model.countDocuments(filter),
  ]);

  const customerIds = [
    ...new Set(
      data
        .map((row) => String((row as { customerId?: string }).customerId || ""))
        .filter(Boolean),
    ),
  ];
  const venueIds = [
    ...new Set(
      data
        .map((row) => String((row as { venueId?: string }).venueId || ""))
        .filter(Boolean),
    ),
  ];
  const quoteIds = [
    ...new Set(
      data
        .map((row) =>
          String((row as { acceptedQuoteId?: string }).acceptedQuoteId || ""),
        )
        .filter(Boolean),
    ),
  ];

  const [customers, venues, quotes, quoteItems] = await Promise.all([
    customerIds.length
      ? Customer.find({ customerId: { $in: customerIds } })
          .select("customerId fullName")
          .lean()
      : Promise.resolve([]),
    venueIds.length
      ? Venue.find({ venueId: { $in: venueIds } })
          .select("venueId venueName")
          .lean()
      : Promise.resolve([]),
    quoteIds.length
      ? Quote.find({ quoteId: { $in: quoteIds } })
          .select("quoteId discount taxAmount bookingAdvancePercent")
          .lean()
      : Promise.resolve([]),
    quoteIds.length
      ? QuoteItem.find({
          quoteId: { $in: quoteIds },
          archivedAt: null,
        })
          .select("quoteId quantity unitPriceExclTax")
          .lean()
      : Promise.resolve([]),
  ]);

  const customerNameById = new Map(
    customers.map((c) => [String(c.customerId), String(c.fullName || "")]),
  );
  const venueNameById = new Map(
    venues.map((v) => [String(v.venueId), String(v.venueName || "")]),
  );
  const quoteById = new Map(
    quotes.map((q) => [String(q.quoteId), q] as const),
  );
  const itemsByQuoteId = new Map<string, typeof quoteItems>();
  for (const item of quoteItems) {
    const qid = String(item.quoteId || "");
    const list = itemsByQuoteId.get(qid) || [];
    list.push(item);
    itemsByQuoteId.set(qid, list);
  }

  const enriched = data.map((row) => {
    const r = row as Record<string, unknown>;
    const customerId = String(r.customerId || "");
    const venueId = String(r.venueId || "");
    const quoteId = String(r.acceptedQuoteId || "");
    const quote = quoteById.get(quoteId);
    let quotedAmount: number | null = null;
    if (quote) {
      const totals = calcQuoteTotals(
        itemsByQuoteId.get(quoteId) || [],
        Number(quote.discount || 0),
        Number(quote.taxAmount || 0),
        Number(quote.bookingAdvancePercent ?? 0.6),
      );
      quotedAmount = totals.quoteTotal;
    }
    return {
      ...r,
      customerName: customerNameById.get(customerId) || "",
      venueName: venueNameById.get(venueId) || "",
      quotedAmount,
    };
  });

  return ok(listResult(enriched, total, page, pageSize));
}

export async function POST(request: NextRequest) {
  if (!def) return notFound();
  return crudCreate(request, def);
}
