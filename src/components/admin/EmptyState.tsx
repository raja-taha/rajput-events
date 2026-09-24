import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="admin-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-[var(--admin-muted)]">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="admin-btn admin-btn-primary mt-2">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
