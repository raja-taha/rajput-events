"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { RelationSearchSelect } from "./RelationSearchSelect";
import { QuoteLineItemsEditor } from "./QuoteLineItemsEditor";
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
import { normalizeAdvanceRate } from "@/lib/admin/quote-totals";

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
    className: "admin-input w-full !py-1.5 text-xs",
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(e.target.value),
    required: field.required,
  };

  if (field.type === "textarea") {
    return <textarea {...common} rows={2} />;
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

function parsePayload(
  fields: FieldDef[],
  form: Record<string, string>,
  resourceKey: ResourceKey,
) {
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
  if (resourceKey === "quotes" && out.bookingAdvancePercent != null) {
    out.bookingAdvancePercent = normalizeAdvanceRate(
      Number(out.bookingAdvancePercent),
    );
  }
  return out;
}

type Props = {
  open: boolean;
  resourceKey: ResourceKey;
  businessId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EntityFormModal({
  open,
  resourceKey,
  businessId,
  onClose,
  onSaved,
}: Props) {
  const isNew = !businessId;
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const fields = RESOURCE_FIELDS[resourceKey];

  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmArchive(false);
    setSavedId(businessId || null);

    if (!businessId) {
      const defaults: Record<string, string> = {};
      for (const f of fields) {
        if (f.type === "select" && f.options?.length && f.required) {
          defaults[f.name] = f.options[0];
        }
      }
      if (resourceKey === "quotes") {
        defaults.bookingAdvancePercent = defaults.bookingAdvancePercent || "0.6";
        defaults.discount = defaults.discount || "0";
        defaults.taxAmount = defaults.taxAmount || "0";
      }
      setForm(defaults);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const doc = await getOne<Record<string, unknown>>(resourceKey, businessId);
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const f of fields) {
          let value = toFormValue(doc[f.name]);
          if (!value && f.type === "select" && f.options?.length) {
            value = f.options[0];
          }
          next[f.name] = value;
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
  }, [open, resourceKey, businessId, fields]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const activeId = savedId || businessId || null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = parsePayload(fields, form, resourceKey);
      if (isNew && !savedId) {
        const created = await createOne<Record<string, unknown>>(resourceKey, payload);
        const id = String(created[def.businessIdField]);
        setSavedId(id);
      } else if (activeId) {
        await updateOne(resourceKey, activeId, payload);
      }
      onSaved();
      if (resourceKey !== "quotes") onClose();
    } catch {
      // toast handled in client-api
    } finally {
      setSaving(false);
    }
  }

  async function onArchive() {
    if (!activeId) return;
    setSaving(true);
    try {
      await archiveOne(resourceKey, activeId);
      onSaved();
      onClose();
    } catch {
      // toast handled in client-api
    } finally {
      setSaving(false);
      setConfirmArchive(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/45 p-3 sm:p-6">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative z-10 my-4 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl ${
          resourceKey === "quotes" ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold">
              {isNew && !savedId ? `New ${meta.singular}` : `Edit ${meta.singular}`}
            </h2>
            {activeId ? (
              <p className="font-mono text-[10px] text-[var(--admin-muted)]">{activeId}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost !p-1.5"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="py-8 text-center text-xs text-[var(--admin-muted)]">Loading…</p>
          ) : (
            <>
              <form id="entity-form-modal" onSubmit={onSubmit} className="grid gap-2.5 sm:grid-cols-2">
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
              </form>

              {resourceKey === "quotes" && activeId ? (
                <div className="mt-3">
                  <QuoteLineItemsEditor
                    quoteId={activeId}
                    discount={Number(form.discount || 0)}
                    taxAmount={Number(form.taxAmount || 0)}
                    bookingAdvancePercent={normalizeAdvanceRate(
                      form.bookingAdvancePercent === "" ||
                        form.bookingAdvancePercent == null
                        ? 0.6
                        : Number(form.bookingAdvancePercent),
                    )}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] px-4 py-2.5">
          <div>
            {activeId ? (
              <button
                type="button"
                className="admin-btn admin-btn-ghost !px-2 !py-1 text-xs text-[var(--admin-danger)]"
                onClick={() => setConfirmArchive(true)}
                disabled={saving}
              >
                Archive
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-ghost !px-2.5 !py-1 text-xs"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="entity-form-modal"
              className="admin-btn admin-btn-primary !px-2.5 !py-1 text-xs"
              disabled={saving || loading}
            >
              {saving ? "Saving…" : isNew && !savedId ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title="Archive record?"
        message="This record will be archived (soft delete)."
        confirmLabel="Archive"
        destructive
        onConfirm={() => void onArchive()}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}
