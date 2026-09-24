"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import {
  TABLE_PAGE_SIZE_OPTIONS,
  useAdminPreferences,
} from "@/components/admin/AdminPreferencesProvider";

export default function AdminProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const { tablePageSize, setTablePageSize } = useAdminPreferences();
  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => r.json())
      .then((d) => setEmail(d.email || ""));
  }, []);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="admin-card p-6">
        <h2 className="text-xl font-bold">Admin profile</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Single environment-configured administrator account
        </p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--admin-border)] pb-3">
            <dt className="text-[var(--admin-muted)]">Email</dt>
            <dd className="font-medium">{email || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--admin-border)] pb-3">
            <dt className="text-[var(--admin-muted)]">Role</dt>
            <dd className="font-medium">admin</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--admin-border)] pb-3">
            <dt className="text-[var(--admin-muted)]">Theme</dt>
            <dd>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={toggleTheme}
              >
                {theme === "light" ? "Switch to dark" : "Switch to light"}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <dt className="text-[var(--admin-muted)]">Rows per page</dt>
              <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                How many table rows to show on each page
              </p>
            </div>
            <dd>
              <select
                className="admin-input !w-auto min-w-[5.5rem]"
                value={tablePageSize}
                onChange={(e) =>
                  setTablePageSize(
                    Number(e.target.value) as (typeof TABLE_PAGE_SIZE_OPTIONS)[number],
                  )
                }
              >
                {TABLE_PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="admin-btn admin-btn-primary mt-6"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
