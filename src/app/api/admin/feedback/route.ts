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
import { Booking } from "@/models/Booking";

const def = getResourceDef("feedback");

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
    const matchedEvents = await Booking.find({
      archivedAt: null,
      $or: [{ eventTitle: regex }, { eventId: regex }],
    })
      .select("eventId")
      .lean();
    const eventIds = matchedEvents.map((e) => String(e.eventId));

    filter.$or = [
      ...def.searchFields.map((f) => ({ [f]: regex })),
      ...(eventIds.length ? [{ eventId: { $in: eventIds } }] : []),
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

  const eventIds = [
    ...new Set(
      data
        .map((row) => String((row as { eventId?: string }).eventId || ""))
        .filter(Boolean),
    ),
  ];
  const events = eventIds.length
    ? await Booking.find({ eventId: { $in: eventIds } })
        .select("eventId eventTitle")
        .lean()
    : [];
  const eventNameById = new Map(
    events.map((e) => [String(e.eventId), String(e.eventTitle || "")]),
  );

  const enriched = data.map((row) => {
    const r = row as Record<string, unknown>;
    const eventId = String(r.eventId || "");
    return {
      ...r,
      eventName: eventNameById.get(eventId) || "",
    };
  });

  return ok(listResult(enriched, total, page, pageSize));
}

export async function POST(request: NextRequest) {
  if (!def) return notFound();
  return crudCreate(request, def);
}
