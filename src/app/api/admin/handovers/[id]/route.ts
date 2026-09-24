import { NextRequest } from "next/server";
import { getResourceDef } from "@/lib/admin/resources";
import { crudArchive, crudGet, crudPatch } from "@/lib/admin/crud";
import { notFound } from "@/lib/admin/api";

const def = getResourceDef("handovers");

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  if (!def) return notFound();
  const { id } = await context.params;
  return crudGet(request, def, decodeURIComponent(id));
}

export async function PATCH(request: NextRequest, context: Ctx) {
  if (!def) return notFound();
  const { id } = await context.params;
  return crudPatch(request, def, decodeURIComponent(id));
}

export async function DELETE(request: NextRequest, context: Ctx) {
  if (!def) return notFound();
  const { id } = await context.params;
  return crudArchive(request, def, decodeURIComponent(id));
}
