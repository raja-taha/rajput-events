import type { Model } from "mongoose";
import { NextRequest } from "next/server";
import { connectMongo } from "./mongodb";
import { getAdminSession } from "./auth";
import {
  created,
  fail,
  listResult,
  notFound,
  ok,
  parseListParams,
  unauthorized,
} from "./api";
import { writeAudit } from "./audit";
import { nextBusinessId, type IdKey } from "./ids";

type ResourceConfig = {
  model: Model<any>;
  idField: string;
  idKey: IdKey;
  searchFields: string[];
  resource: string;
  createDefaults?: (body: Record<string, unknown>) => Record<string, unknown>;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createResourceHandlers(config: ResourceConfig) {
  async function GET(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return unauthorized();
    await connectMongo();

    const url = new URL(request.url);
    const { page, pageSize, search, sort, skip } = parseListParams(url);
    const filter: Record<string, unknown> = { archivedAt: null };

    const status = url.searchParams.get("status");
    const stage = url.searchParams.get("stage");
    const eventId = url.searchParams.get("eventId");
    const customerId = url.searchParams.get("customerId");
    const vendorId = url.searchParams.get("vendorId");

    if (status) filter.status = status;
    if (stage) filter.stage = stage;
    if (eventId) filter.eventId = eventId;
    if (customerId) filter.customerId = customerId;
    if (vendorId) filter.vendorId = vendorId;

    const vendorStatus = url.searchParams.get("vendorStatus");
    if (vendorStatus) filter.vendorStatus = vendorStatus;

    if (search && config.searchFields.length) {
      filter.$or = config.searchFields.map((field) => ({
        [field]: { $regex: escapeRegex(search), $options: "i" },
      }));
    }

    const [data, total] = await Promise.all([
      config.model
        .find(filter)
        .sort(
          Object.keys(sort).length && url.searchParams.get("sort")
            ? sort
            : { [config.idField]: 1 },
        )
        .skip(skip)
        .limit(pageSize)
        .lean(),
      config.model.countDocuments(filter),
    ]);

    return ok(listResult(data, total, page, pageSize));
  }

  async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) return unauthorized();
    await connectMongo();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return fail("INVALID_JSON", "Invalid request body");
    }

    const businessId = await nextBusinessId(config.idKey);
    const defaults = config.createDefaults?.(body) ?? {};
    const doc = await config.model.create({
      ...body,
      ...defaults,
      [config.idField]: businessId,
      createdBy: "env-admin",
      updatedBy: "env-admin",
    });

    await writeAudit({
      action: "create",
      resource: config.resource,
      resourceId: String(doc._id),
      businessId,
      changes: { after: doc.toObject() },
    });

    return created(doc);
  }

  return { GET, POST };
}

export function createResourceByIdHandlers(config: ResourceConfig) {
  async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    const session = await getAdminSession();
    if (!session) return unauthorized();
    await connectMongo();
    const { id } = await context.params;
    const doc = await config.model
      .findOne({ [config.idField]: id })
      .lean();
    if (!doc) return notFound();
    return ok(doc);
  }

  async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    const session = await getAdminSession();
    if (!session) return unauthorized();
    await connectMongo();
    const { id } = await context.params;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return fail("INVALID_JSON", "Invalid request body");
    }

    delete body[config.idField];
    delete body._id;

    const before = await config.model
      .findOne({ [config.idField]: id })
      .lean();
    if (!before) return notFound();

    const doc = await config.model.findOneAndUpdate(
      { [config.idField]: id },
      { ...body, updatedBy: "env-admin" },
      { new: true },
    );

    await writeAudit({
      action: "update",
      resource: config.resource,
      resourceId: String(doc?._id),
      businessId: String((doc as any)?.[config.idField] ?? id),
      changes: { before, after: doc?.toObject() },
    });

    return ok(doc);
  }

  async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    const session = await getAdminSession();
    if (!session) return unauthorized();
    await connectMongo();
    const { id } = await context.params;

    const doc = await config.model.findOneAndUpdate(
      { [config.idField]: id },
      {
        archivedAt: new Date(),
        archivedBy: "env-admin",
        updatedBy: "env-admin",
      },
      { new: true },
    );
    if (!doc) return notFound();

    await writeAudit({
      action: "archive",
      resource: config.resource,
      resourceId: String(doc._id),
      businessId: String((doc as any)[config.idField]),
    });

    return ok(doc);
  }

  return { GET, PATCH, DELETE };
}
