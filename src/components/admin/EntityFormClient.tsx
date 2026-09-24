"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
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
  const common = {
    id: field.name,
    name: field.name,
    className: "admin-input w-full",
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(e.target.value),
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
          <option key={o} value={o}>{o}</option>
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
  const [error, setError] = useState<string | null>(null);
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resourceKey, businessId, isNew, fields]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = parsePayload(fields, form);
      if (isNew) {
        const created = await createOne<Record<string, unknown>>(resourceKey, payload);
        const id = String(created[def.businessIdField]);
        router.push(`/admin/${meta.adminPath}/${encodeURIComponent(id)}`);
      } else {
        await updateOne(resourceKey, businessId!, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      await archiveOne(resourceKey, businessId);
      router.push(`/admin/${meta.adminPath}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setSaving(false);
      setConfirmArchive(false);
    }
  };

  if (loading) {
    return <p className="text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <>
      <PageHeader
        title={isNew ? `New ${meta.singular}` : `Edit ${meta.singular}`}
        description={
          isNew
            ? `Create a new ${meta.singular.toLowerCase()} record.`
            : String(businessId)
        }
      />
      <div className="admin-card max-w-3xl p-6">
        {error ? <p className="mb-4 text-sm text-[var(--admin-danger)]">{error}</p> : null}
        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium text-[var(--admin-text)]"
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
          <div className="flex flex-wrap gap-2 pt-4">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create" : "Save changes"}
            </button>
            <Link href={`/admin/${meta.adminPath}`} className="admin-btn admin-btn-ghost">
              Cancel
            </Link>
            {!isNew ? (
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-[var(--admin-danger)]"
                onClick={() => setConfirmArchive(true)}
              >
                Archive
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <ConfirmDialog
        open={confirmArchive}
        title="Archive record?"
        message="This record will be archived (soft delete). You can restore it later from the database if needed."
        confirmLabel="Archive"
        destructive
        onConfirm={() => void onArchive()}
        onCancel={() => setConfirmArchive(false)}
      />
    </>
  );
}
