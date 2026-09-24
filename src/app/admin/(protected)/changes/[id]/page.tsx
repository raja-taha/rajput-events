import { EntityFormClient } from "@/components/admin/EntityFormClient";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EntityFormClient resourceKey="changes" businessId={decodeURIComponent(id)} />;
}
