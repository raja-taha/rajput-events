"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { RelationSearchSelect } from "./RelationSearchSelect";
import {
  archiveOne,
  createOne,
  getOne,
  updateOne,
} from "@/lib/admin/client-api";
import type { ResourceKey } from "@/lib/admin/resource-config";
import { RESOURCE_META } from "@/lib/admin/resource-config";
import { RESOURCE_FIELDS, RESOURCE_LABELS } from "@/lib/admin/resource-fields";
import type { FieldDef } from "@/lib/admin/resource-fields";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "relation" && field.relation) {
    return (
      <RelationSearchSelect
        resource={field.relation}
        value={value}
        onChange={onChange}
        required={field.required}
        placeholder={`Select ${field.label.toLowerCase()}…`}
      />
    );
  }

  const common = {
    id: field.name,
    name: field.name,
    className: "admin-input w-full",
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(e.target.value),
    required: field.required,
  };
  if (field.type === "textarea") {
    return <textarea {...common} rows={3} />;
  }
  if (field.type === "select" && field.options) {
    return (
      <select {...common}>
        <option value="">—</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return <input {...common} type={field.type || "text"} />;
}

function toFormValue(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return String(v);
}

function parsePayload(fields: FieldDef[], form: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = form[f.name];
    if (raw === "" && !f.required) continue;
    if (f.type === "number") {
      out[f.name] = raw === "" ? undefined : Number(raw);
    } else if (f.type === "date") {
      out[f.name] = raw ? new Date(raw).toISOString() : undefined;
    } else {
      out[f.name] = raw;
    }
  }
  return out;
}

/** Fallback full-page form; list pages prefer EntityFormModal. */
export function EntityFormClient({
  resourceKey,
  businessId,
}: {
  resourceKey: ResourceKey;
  businessId?: string;
}) {
  const isNew = !businessId;
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const fields = RESOURCE_FIELDS[resourceKey];
  const router = useRouter();

  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await getOne<Record<string, unknown>>(resourceKey, businessId!);
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const f of fields) {
          next[f.name] = toFormValue(doc[f.name]);
        }
        setForm(next);
      } catch {
        // toast handled in client-api
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, businessId, resourceKey, fields]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = parsePayload(fields, form);
      if (isNew) {
        const created = await createOne<Record<string, unknown>>(resourceKey, payload);
        const id = String(created[def.businessIdField]);
        router.replace(`/admin/${meta.adminPath}?edit=${encodeURIComponent(id)}`);
      } else {
        await updateOne(resourceKey, businessId!, payload);
        router.replace(`/admin/${meta.adminPath}`);
      }
    } catch {
      // toast handled in client-api
    } finally {
      setSaving(false);
    }
  }

  async function onArchive() {
    if (!businessId) return;
    setSaving(true);
    try {
      await archiveOne(resourceKey, businessId);
      router.replace(`/admin/${meta.adminPath}`);
    } catch {
      // toast handled in client-api
    } finally {
      setSaving(false);
      setConfirmArchive(false);
    }
  }

  return (
    <>
      <PageHeader
        title={isNew ? `New ${meta.singular}` : `Edit ${meta.singular}`}
        description={businessId || undefined}
        actionHref={`/admin/${meta.adminPath}`}
        actionLabel="Back to list"
      />
      {loading ? (
        <p className="text-xs text-[var(--admin-muted)]">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className="admin-card max-w-3xl p-4">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" || field.type === "relation"
                    ? "sm:col-span-2"
                    : undefined
                }
              >
                <label
                  htmlFor={field.name}
                  className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
                >
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                <FieldInput
                  field={field}
                  value={form[field.name] ?? ""}
                  onChange={(v) => setForm((prev) => ({ ...prev, [field.name]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              {!isNew ? (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost text-[var(--admin-danger)]"
                  onClick={() => setConfirmArchive(true)}
                  disabled={saving}
                >
                  Archive
                </button>
              ) : null}
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </form>
      )}
      <ConfirmDialog
        open={confirmArchive}
        title="Archive record?"
        message="This record will be archived (soft delete)."
        confirmLabel="Archive"
        destructive
        onConfirm={() => void onArchive()}
        onCancel={() => setConfirmArchive(false)}
      />
    </>
  );
}
