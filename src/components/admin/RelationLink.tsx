"use client";

import Link from "next/link";
import type { ResourceKey } from "@/lib/admin/resource-config";
import { adminResourceHref, hasDetailPage } from "@/lib/admin/detail-pages";

export function RelationLink({
  resource,
  id,
  label,
  className,
}: {
  resource: ResourceKey;
  id?: string | null;
  label?: string | null;
  className?: string;
}) {
  const text = (label && label.trim()) || id || "—";
  if (!id) {
    return <span className={className}>{text}</span>;
  }

  if (!hasDetailPage(resource)) {
    return (
      <span className={className} title={id}>
        {text}
      </span>
    );
  }

  return (
    <Link
      href={adminResourceHref(resource, id)}
      onClick={(e) => e.stopPropagation()}
      className={
        className ??
        "font-medium text-[var(--admin-primary)] hover:underline"
      }
      title={`Open ${id}`}
    >
      {text}
    </Link>
  );
}
