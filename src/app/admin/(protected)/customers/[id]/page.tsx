import { EntityDetailClient } from "@/components/admin/EntityDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <EntityDetailClient
      resourceKey="customers"
      businessId={decodeURIComponent(id)}
    />
  );
}
