import { Suspense } from "react";
import { EntityListClient } from "@/components/admin/EntityListClient";

export const metadata = { title: "handovers" };

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EntityListClient resourceKey="handovers" />
    </Suspense>
  );
}
