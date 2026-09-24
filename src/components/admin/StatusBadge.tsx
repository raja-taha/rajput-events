import clsx from "clsx";

type BadgeTone = "green" | "amber" | "red" | "gray" | "blue";

const GREEN = new Set([
  "approved",
  "accepted",
  "paid",
  "cleared",
  "completed",
  "done",
  "verified",
  "filed",
  "available",
  "won",
  "confirmed",
  "yes",
]);

const AMBER = new Set([
  "pending",
  "tentative",
  "in progress",
  "waiting",
  "due today",
  "on hold",
  "checking",
  "to do",
  "contacted",
  "qualified",
  "new",
  "draft",
  "sent",
  "scheduled",
]);

const RED = new Set([
  "overdue",
  "lost",
  "rejected",
  "expired",
  "damaged",
  "error",
  "review",
  "cancelled",
  "void",
]);

const GRAY = new Set([
  "template",
  "superseded",
  "not applicable",
  "retired",
  "not asked",
  "no",
]);

const BLUE = new Set(["issued", "quote sent"]);

function toneForStatus(status: string): BadgeTone {
  const s = status.trim().toLowerCase();
  if (GREEN.has(s)) return "green";
  if (RED.has(s)) return "red";
  if (GRAY.has(s)) return "gray";
  if (BLUE.has(s)) return "blue";
  if (AMBER.has(s)) return "amber";
  return "gray";
}

export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) {
    return (
      <span className={clsx("admin-badge admin-badge-gray", className)}>—</span>
    );
  }
  const tone = toneForStatus(status);
  return (
    <span className={clsx("admin-badge", `admin-badge-${tone}`, className)}>
      {status}
    </span>
  );
}
