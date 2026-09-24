"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

type SettingsMap = Record<string, string>;

const FIELDS: Array<{ key: string; label: string; group: string }> = [
  { key: "businessName", label: "Business name", group: "profile" },
  { key: "businessEmail", label: "Business email", group: "contact" },
  { key: "businessWhatsApp", label: "Business WhatsApp", group: "contact" },
  { key: "businessAddress", label: "Business address", group: "contact" },
  { key: "serviceArea", label: "Service area", group: "operations" },
  { key: "bankAccountTitle", label: "Bank account title", group: "payments" },
  { key: "bankIban", label: "Bank / IBAN", group: "payments" },
  { key: "launchNote", label: "Launch note", group: "operations" },
  { key: "advanceSuggestion", label: "Advance suggestion (reference)", group: "operations" },
  { key: "balanceSuggestion", label: "Balance suggestion (reference)", group: "operations" },
  { key: "serviceFocus", label: "Initial service focus", group: "operations" },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d?.error?.message || "Failed to load settings");
        setValues(d.data || d || {});
      })
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Failed to load settings"),
      );
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Save failed");
      toast.success("Settings saved");
      setValues(data.data || data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4">
      <div className="admin-card p-6">
        <h2 className="text-xl font-bold">Business settings</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Non-secret configuration for Rajput Events operations. Currency PKR · Timezone
          Asia/Karachi.
        </p>
        <div className="mt-6 grid gap-4">
          {FIELDS.map((field) => (
            <label key={field.key} className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                {field.label}
              </span>
              <input
                className="admin-input"
                value={values[field.key] || ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary mt-6">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
