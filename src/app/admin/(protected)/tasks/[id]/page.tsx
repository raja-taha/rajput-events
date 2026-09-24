import { RedirectToListModal } from "@/components/admin/RedirectToListModal";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <RedirectToListModal
      resourceKey="tasks"
      mode="edit"
      id={decodeURIComponent(id)}
    />
  );
}
