"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { EntityFormModal } from "./EntityFormModal";
import { StatusBadge } from "./StatusBadge";
import { RelationLink } from "./RelationLink";
import { MoneyText } from "./MoneyText";
import { QuoteDetailPanel } from "./QuoteDetailPanel";
import { archiveOne, getOne } from "@/lib/admin/client-api";
import { formatDate, formatDateTime } from "@/lib/admin/dates";
import { normalizeAdvanceRate } from "@/lib/admin/quote-totals";
import {
  adminResourceHref,
  type DetailPageResource,
} from "@/lib/admin/detail-pages";
import { RESOURCE_META, type ResourceKey } from "@/lib/admin/resource-config";
import {
  RESOURCE_FIELDS,
  RESOURCE_LABELS,
  type FieldDef,
} from "@/lib/admin/resource-fields";

type Row = Record<string, unknown>;

function isMoneyField(name: string) {
  if (name === "bookingAdvancePercent") return false;
  return /amount|fee|budget|rental|deposit|discount|tax|price|total/i.test(name);
}

function formatAdvancePercent(value: unknown): string {
  const rate = normalizeAdvanceRate(Number(value));
  return `${Math.round(rate * 100)}%`;
}

function isStatusField(name: string) {
  return (
    name === "status" ||
    name === "stage" ||
    name === "vendorStatus" ||
    name === "implementationStatus" ||
    name === "mediaConsent" ||
    name === "clearance"
  );
}

function displayValue(field: FieldDef, value: unknown): ReactNode {
  if (value == null || value === "") {
    return <span className="text-[var(--admin-muted)]">—</span>;
  }

  if (field.type === "relation" && field.relation) {
    return (
      <RelationLink
        resource={field.relation}
        id={String(value)}
        label={null}
      />
    );
  }

  if (field.type === "date") {
    return (
      <span className="tabular-nums">
        {formatDate(value as string | Date)}
      </span>
    );
  }

  if (field.type === "number" && isMoneyField(field.name)) {
    return <MoneyText amount={Number(value)} className="tabular-nums" />;
  }

  if (field.name === "bookingAdvancePercent") {
    return (
      <span className="tabular-nums">{formatAdvancePercent(value)}</span>
    );
  }

  if (field.type === "number") {
    return <span className="tabular-nums">{String(value)}</span>;
  }

  if (isStatusField(field.name)) {
    return <StatusBadge status={String(value)} />;
  }

  if (field.type === "textarea" || String(value).length > 120) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--admin-text)]">
        {String(value)}
      </p>
    );
  }

  return <span>{String(value)}</span>;
}

export function EntityDetailClient({
  resourceKey,
  businessId,
}: {
  resourceKey: DetailPageResource;
  businessId: string;
}) {
  const router = useRouter();
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const fields = RESOURCE_FIELDS[resourceKey];

  const [doc, setDoc] = useState<Row | null>(null);
  const [relationLabels, setRelationLabels] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOne<Row>(resourceKey, businessId);
      setDoc(data);

      const labels: Record<string, string> = {};
      await Promise.all(
        fields
          .filter((f) => f.type === "relation" && f.relation)
          .map(async (f) => {
            const id = String(data[f.name] || "");
            if (!id || !f.relation) return;
            try {
              const related = await getOne<Row>(f.relation, id, {
                silentAll: true,
              });
              const relatedMeta = RESOURCE_META[f.relation];
              labels[f.name] = String(
                related[relatedMeta.labelField] || id,
              );
            } catch {
              labels[f.name] = id;
            }
          }),
      );
      setRelationLabels(labels);
    } catch {
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [resourceKey, businessId, fields]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = useMemo(() => {
    if (!doc) return meta.singular;
    const label = doc[def.labelField];
    if (label != null && String(label).trim()) return String(label);
    return businessId;
  }, [doc, def.labelField, meta.singular, businessId]);

  const statusValue = useMemo(() => {
    if (!doc) return null;
    for (const key of [
      "status",
      "stage",
      "vendorStatus",
      "implementationStatus",
      "mediaConsent",
    ]) {
      if (doc[key] != null && doc[key] !== "") return String(doc[key]);
    }
    return null;
  }, [doc]);

  async function onDelete() {
    setDeleting(true);
    try {
      await archiveOne(resourceKey, businessId);
      router.replace(adminResourceHref(resourceKey));
    } catch {
      // toast in client-api
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function renderField(field: FieldDef) {
    if (!doc) return null;
    const raw = doc[field.name];

    if (field.type === "relation" && field.relation) {
      return (
        <RelationLink
          resource={field.relation}
          id={raw == null || raw === "" ? null : String(raw)}
          label={relationLabels[field.name] || null}
        />
      );
    }

    return displayValue(field, raw);
  }

  const primaryFields = fields.filter(
    (f) => f.type !== "textarea" && !isStatusField(f.name),
  );
  const statusFields = fields.filter((f) => isStatusField(f.name));
  const longFields = fields.filter((f) => f.type === "textarea");

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={adminResourceHref(resourceKey)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-muted)] hover:text-[var(--admin-primary)]"
        >
          <ArrowLeft size={14} />
          Back to {meta.title.toLowerCase()}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-ghost !px-2.5 !py-1.5 text-xs"
            onClick={() => setEditOpen(true)}
            disabled={loading || !doc}
          >
            <Pencil size={13} className="mr-1.5 inline" />
            Edit
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost !px-2.5 !py-1.5 text-xs text-[var(--admin-danger)]"
            onClick={() => setConfirmDelete(true)}
            disabled={loading || !doc}
          >
            <Trash2 size={13} className="mr-1.5 inline" />
            Delete
          </button>
        </div>
      </div>

      <section className="admin-card overflow-hidden">
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]/60 px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            {meta.singular}
          </p>
          {loading ? (
            <div className="mt-3 h-7 w-48 animate-pulse rounded bg-[var(--admin-border)]" />
          ) : (
            <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 font-mono text-[11px] text-[var(--admin-muted)]">
                  {businessId}
                </p>
              </div>
              {statusValue ? <StatusBadge status={statusValue} /> : null}
            </div>
          )}
        </div>

        <div className="px-5 py-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-[var(--admin-border)]" />
                  <div className="h-4 w-40 animate-pulse rounded bg-[var(--admin-border)]" />
                </div>
              ))}
            </div>
          ) : !doc ? (
            <p className="text-sm text-[var(--admin-muted)]">
              This {meta.singular.toLowerCase()} could not be found.
            </p>
          ) : (
            <div className="space-y-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {primaryFields.map((field) => (
                  <div key={field.name} className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--admin-text)]">
                      {renderField(field)}
                    </dd>
                  </div>
                ))}
                {statusFields.map((field) => (
                  <div key={field.name} className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-sm">{renderField(field)}</dd>
                  </div>
                ))}
              </dl>

              {longFields.length > 0 ? (
                <div className="space-y-4 border-t border-[var(--admin-border)] pt-5">
                  {longFields.map((field) => (
                    <div key={field.name}>
                      <h2 className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                        {field.label}
                      </h2>
                      <div className="mt-1.5 text-sm">{renderField(field)}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {resourceKey === "quotes" ? (
                <QuoteDetailPanel
                  quoteId={businessId}
                  discount={Number(doc.discount || 0)}
                  taxAmount={Number(doc.taxAmount || 0)}
                  bookingAdvancePercent={
                    doc.bookingAdvancePercent == null
                      ? 0.6
                      : Number(doc.bookingAdvancePercent)
                  }
                />
              ) : null}

              {(doc.createdAt || doc.updatedAt) && (
                <div className="border-t border-[var(--admin-border)] pt-4 text-[11px] text-[var(--admin-muted)]">
                  {doc.createdAt ? (
                    <span>Created {formatDateTime(doc.createdAt as string)}</span>
                  ) : null}
                  {doc.createdAt && doc.updatedAt ? (
                    <span className="mx-2">·</span>
                  ) : null}
                  {doc.updatedAt ? (
                    <span>Updated {formatDateTime(doc.updatedAt as string)}</span>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <EntityFormModal
        open={editOpen}
        resourceKey={resourceKey as ResourceKey}
        businessId={businessId}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          void load();
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${meta.singular.toLowerCase()}?`}
        message="This record will be archived (soft delete)."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={() => {
          if (!deleting) void onDelete();
        }}
        onCancel={() => {
          if (!deleting) setConfirmDelete(false);
        }}
      />
    </div>
  );
}
