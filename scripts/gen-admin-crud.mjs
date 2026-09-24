import fs from "fs";
import path from "path";

const root = "src";
const resources = [
  "customers",
  "enquiries",
  "event-briefs",
  "quotes",
  "services",
  "bookings",
  "tasks",
  "changes",
  "feedback",
  "vendors",
  "vendor-orders",
  "venues",
  "inventory",
  "handovers",
  "invoices",
  "payments",
  "expenses",
  "documents",
  "marketing",
];

for (const r of resources) {
  const apiDir = path.join(root, "app/api/admin", r);
  const idDir = path.join(apiDir, "[id]");
  fs.mkdirSync(idDir, { recursive: true });

  fs.writeFileSync(
    path.join(apiDir, "route.ts"),
    `import { NextRequest } from "next/server";
import { getResourceDef } from "@/lib/admin/resources";
import { crudCreate, crudList } from "@/lib/admin/crud";
import { notFound } from "@/lib/admin/api";

const def = getResourceDef("${r}");

export async function GET(request: NextRequest) {
  if (!def) return notFound();
  return crudList(request, def);
}

export async function POST(request: NextRequest) {
  if (!def) return notFound();
  return crudCreate(request, def);
}
`,
  );

  fs.writeFileSync(
    path.join(idDir, "route.ts"),
    `import { NextRequest } from "next/server";
import { getResourceDef } from "@/lib/admin/resources";
import { crudArchive, crudGet, crudPatch } from "@/lib/admin/crud";
import { notFound } from "@/lib/admin/api";

const def = getResourceDef("${r}");

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
`,
  );

  const adminPath = path.join(root, "app/admin/(protected)", r);
  fs.mkdirSync(path.join(adminPath, "new"), { recursive: true });
  fs.mkdirSync(path.join(adminPath, "[id]"), { recursive: true });

  fs.writeFileSync(
    path.join(adminPath, "page.tsx"),
    `import { Suspense } from "react";
import { EntityListClient } from "@/components/admin/EntityListClient";

export const metadata = { title: "${r}" };

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EntityListClient resourceKey="${r}" />
    </Suspense>
  );
}
`,
  );

  fs.writeFileSync(
    path.join(adminPath, "new", "page.tsx"),
    `import { EntityFormClient } from "@/components/admin/EntityFormClient";

export const metadata = { title: "New" };

export default function Page() {
  return <EntityFormClient resourceKey="${r}" />;
}
`,
  );

  fs.writeFileSync(
    path.join(adminPath, "[id]", "page.tsx"),
    `import { EntityFormClient } from "@/components/admin/EntityFormClient";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EntityFormClient resourceKey="${r}" businessId={decodeURIComponent(id)} />;
}
`,
  );
}

console.log("Generated", resources.length, "resources");
