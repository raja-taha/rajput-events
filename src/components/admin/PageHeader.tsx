import Link from "next/link";

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-[var(--admin-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 text-[11px] text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="admin-btn admin-btn-primary shrink-0 !px-2.5 !py-1 text-xs"
        >
          {actionLabel}
        </button>
      ) : actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="admin-btn admin-btn-primary shrink-0 !px-2.5 !py-1 text-xs"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
