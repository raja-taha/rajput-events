"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ResourceKey } from "@/lib/admin/resource-config";
import { RESOURCE_META } from "@/lib/admin/resource-config";

export function RedirectToListModal({
  resourceKey,
  mode,
  id,
}: {
  resourceKey: ResourceKey;
  mode: "new" | "edit";
  id?: string;
}) {
  const router = useRouter();
  const path = RESOURCE_META[resourceKey].adminPath;

  useEffect(() => {
    const q = new URLSearchParams();
    if (mode === "new") q.set("new", "1");
    if (mode === "edit" && id) q.set("edit", id);
    router.replace(`/admin/${path}?${q.toString()}`);
  }, [router, path, mode, id]);

  return (
    <p className="text-xs text-[var(--admin-muted)]">Opening…</p>
  );
}
