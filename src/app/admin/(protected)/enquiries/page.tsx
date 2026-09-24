import { Suspense } from "react";
import { EntityListClient } from "@/components/admin/EntityListClient";

export const metadata = { title: "enquiries" };

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EntityListClient resourceKey="enquiries" />
    </Suspense>
  );
}
