import { NextRequest } from "next/server";
import type { Model } from "mongoose";
import { connectMongo } from "./mongodb";
import { requireAdminApi } from "./auth";
import {
  created,
  fail,
  listResult,
  notFound,
  ok,
  parseListParams,
  unauthorized,
} from "./api";
import { nextBusinessId, type IdKey } from "./ids";
import { writeAudit } from "./audit";

export type ResourceDef = {
  resource: string;
  model: Model<Record<string, unknown>>;
  businessIdField: string;
  idKey: IdKey;
  searchFields: string[];
  labelField?: string;
  listDefaults?: Record<string, unknown>;
  createDefaults?: Record<string, unknown>;
  readOnly?: boolean;
};

const BLOCKED_KEYS = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "archivedAt",
  "archivedBy",
]);

function sanitizeBody(body: Record<string, unknown>, businessIdField: string) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (BLOCKED_KEYS.has(k) || k === businessIdField) continue;
    if (k.startsWith("$")) continue;
    out[k] = v;
  }
  return out;
}

function buildSearchFilter(
  search: string,
  fields: string[],
  includeArchived: boolean,
) {
  const filter: Record<string, unknown> = includeArchived
    ? {}
    : { archivedAt: null };
  if (!search) return filter;
  const regex = { $regex: search, $options: "i" };
  filter.$or = fields.map((f) => ({ [f]: regex }));
  return filter;
}

function toPlain(doc: unknown) {
  if (!doc || typeof doc !== "object") return doc;
  const d = doc as { toObject?: () => Record<string, unknown> };
  return d.toObject ? d.toObject() : doc;
}

export async function crudList(request: NextRequest, def: ResourceDef) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const url = new URL(request.url);
  const { page, pageSize, search, sort, skip } = parseListParams(url);
  const includeArchived = url.searchParams.get("archived") === "1";
  const filter = buildSearchFilter(search, def.searchFields, includeArchived);
  // Default: sort by permanent business ID ascending
  const effectiveSort =
    url.searchParams.get("sort") != null
      ? sort
      : ({ [def.businessIdField]: 1 } as Record<string, 1 | -1>);
  const [data, total] = await Promise.all([
    def.model
      .find(filter)
      .sort(effectiveSort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    def.model.countDocuments(filter),
  ]);
  return ok(listResult(data, total, page, pageSize));
}

export async function crudCreate(request: NextRequest, def: ResourceDef) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  if (def.readOnly) return fail("FORBIDDEN", "Read-only resource", 403);
  await connectMongo();
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("INVALID_JSON", "Invalid JSON body");
  }
  const businessId = await nextBusinessId(def.idKey);
  const payload = {
    ...def.createDefaults,
    ...sanitizeBody(body, def.businessIdField),
    [def.businessIdField]: businessId,
    createdBy: session.email,
    updatedBy: session.email,
    archivedAt: null,
  };
  const doc = await def.model.create(payload);
  await writeAudit({
    action: "create",
    resource: def.resource,
    resourceId: String(doc._id),
    businessId,
    actor: session.email,
    changes: { after: toPlain(doc) },
  });
  return created(toPlain(doc));
}

export async function crudGet(
  request: NextRequest,
  def: ResourceDef,
  businessId: string,
) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const doc = await def.model
    .findOne({ [def.businessIdField]: businessId })
    .lean();
  if (!doc) return notFound();
  return ok(doc);
}

export async function crudPatch(
  request: NextRequest,
  def: ResourceDef,
  businessId: string,
) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  if (def.readOnly) return fail("FORBIDDEN", "Read-only resource", 403);
  await connectMongo();
  const existing = await def.model.findOne({
    [def.businessIdField]: businessId,
  });
  if (!existing) return notFound();
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("INVALID_JSON", "Invalid JSON body");
  }
  const updates = sanitizeBody(body, def.businessIdField);
  updates.updatedBy = session.email;
  const before = toPlain(existing);

  const updated = await def.model
    .findOneAndUpdate(
      { [def.businessIdField]: businessId },
      { $set: updates },
      { runValidators: true, returnDocument: "after" },
    )
    .lean();

  if (!updated) return notFound();

  await writeAudit({
    action: "update",
    resource: def.resource,
    resourceId: String(existing._id),
    businessId,
    actor: session.email,
    changes: { before, after: updated },
  });
  return ok(updated);
}

export async function crudArchive(
  request: NextRequest,
  def: ResourceDef,
  businessId: string,
) {
  const url = new URL(request.url);
  if (url.searchParams.get("unarchive") === "1") {
    return crudUnarchive(request, def, businessId);
  }

  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  if (def.readOnly) return fail("FORBIDDEN", "Read-only resource", 403);
  await connectMongo();
  const existing = await def.model.findOne({
    [def.businessIdField]: businessId,
  });
  if (!existing) return notFound();
  const before = toPlain(existing);
  existing.set({
    archivedAt: new Date(),
    archivedBy: session.email,
    updatedBy: session.email,
  });
  await existing.save();
  await writeAudit({
    action: "archive",
    resource: def.resource,
    resourceId: String(existing._id),
    businessId,
    actor: session.email,
    changes: { before, after: toPlain(existing) },
  });
  return ok({ archived: true, [def.businessIdField]: businessId });
}

export async function crudUnarchive(
  request: NextRequest,
  def: ResourceDef,
  businessId: string,
) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  if (def.readOnly) return fail("FORBIDDEN", "Read-only resource", 403);
  await connectMongo();
  const existing = await def.model.findOne({
    [def.businessIdField]: businessId,
  });
  if (!existing) return notFound();
  const before = toPlain(existing);
  existing.set({
    archivedAt: null,
    archivedBy: null,
    updatedBy: session.email,
  });
  await existing.save();
  await writeAudit({
    action: "restore",
    resource: def.resource,
    resourceId: String(existing._id),
    businessId,
    actor: session.email,
    changes: { before, after: toPlain(existing) },
  });
  return ok({ archived: false, [def.businessIdField]: businessId });
}
