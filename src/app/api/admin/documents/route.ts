import { NextRequest } from "next/server";
import { getResourceDef } from "@/lib/admin/resources";
import { crudCreate, crudList } from "@/lib/admin/crud";
import { notFound } from "@/lib/admin/api";

const def = getResourceDef("documents");

export async function GET(request: NextRequest) {
  if (!def) return notFound();
  return crudList(request, def);
}

export async function POST(request: NextRequest) {
  if (!def) return notFound();
  return crudCreate(request, def);
}
