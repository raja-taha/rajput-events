import Link from "next/link";

export function PageHeader({
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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="admin-btn admin-btn-primary shrink-0">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
