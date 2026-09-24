import type { ResourceKey } from "./resource-config";
import { RESOURCE_META } from "./resource-config";

/** Resources that open a dedicated details page on row click. */
export const DETAIL_PAGE_RESOURCES = [
  "customers",
  "enquiries",
  "quotes",
  "bookings",
  "event-briefs",
  "feedback",
  "venues",
] as const satisfies readonly ResourceKey[];

export type DetailPageResource = (typeof DETAIL_PAGE_RESOURCES)[number];

export function hasDetailPage(key: ResourceKey): key is DetailPageResource {
  return (DETAIL_PAGE_RESOURCES as readonly string[]).includes(key);
}

export function adminResourceHref(resourceKey: ResourceKey, id?: string | null) {
  const path = RESOURCE_META[resourceKey]?.adminPath;
  if (!path) return "/admin";
  if (!id) return `/admin/${path}`;
  return `/admin/${path}/${encodeURIComponent(id)}`;
}
