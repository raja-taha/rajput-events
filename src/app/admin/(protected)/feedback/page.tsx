import { Suspense } from "react";
import { EntityListClient } from "@/components/admin/EntityListClient";

export const metadata = { title: "feedback" };

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EntityListClient resourceKey="feedback" />
    </Suspense>
  );
}
