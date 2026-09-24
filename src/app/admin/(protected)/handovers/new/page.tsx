import { EntityFormClient } from "@/components/admin/EntityFormClient";

export const metadata = { title: "New" };

export default function Page() {
  return <EntityFormClient resourceKey="handovers" />;
}
