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
import { Customer } from "@/models/Customer";

const def = getResourceDef("quotes");

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
    const matchedCustomers = await Customer.find({
      archivedAt: null,
      $or: [
        { fullName: regex },
        { customerId: regex },
        { email: regex },
        { mobileWhatsApp: regex },
      ],
    })
      .select("customerId")
      .lean();
    const customerIds = matchedCustomers.map((c) => String(c.customerId));

    filter.$or = [
      ...def.searchFields.map((f) => ({ [f]: regex })),
      ...(customerIds.length ? [{ customerId: { $in: customerIds } }] : []),
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

  const ids = [
    ...new Set(
      data
        .map((row) => String((row as { customerId?: string }).customerId || ""))
        .filter(Boolean),
    ),
  ];
  const customers = ids.length
    ? await Customer.find({ customerId: { $in: ids } })
        .select("customerId fullName")
        .lean()
    : [];
  const nameById = new Map(
    customers.map((c) => [String(c.customerId), String(c.fullName || "")]),
  );

  const enriched = data.map((row) => {
    const r = row as Record<string, unknown>;
    const customerId = String(r.customerId || "");
    return {
      ...r,
      customerName: nameById.get(customerId) || "",
    };
  });

  return ok(listResult(enriched, total, page, pageSize));
}

export async function POST(request: NextRequest) {
  if (!def) return notFound();
  return crudCreate(request, def);
}
