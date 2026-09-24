"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sun,
  UserCircle,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAdminTheme } from "./AdminThemeProvider";

type Props = {
  title: string;
  subtitle?: string;
  email?: string;
  sidebarOpen: boolean;
  onMenuClick: () => void;
};

export function AdminTopbar({
  title,
  subtitle,
  email,
  sidebarOpen,
  onMenuClick,
}: Props) {
  const { theme, toggleTheme } = useAdminTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      toast.success("Signed out");
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/admin/customers?search=${encodeURIComponent(q)}`);
  }

  return (
    <header className="admin-topbar sticky top-0 z-[60] w-full shrink-0 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface)_94%,transparent)] backdrop-blur-md">
      <div className="flex w-full items-center px-3 py-2 lg:px-0">
        {/* Brand — width tracks sidebar; short divider (not full-height) */}
        <div
          className={clsx(
            "hidden shrink-0 items-center lg:flex",
            sidebarOpen ? "w-[220px] px-3" : "w-14 justify-center",
          )}
        >
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-2 rounded-lg py-0.5 hover:opacity-90"
            title="Rajput Events"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-xs font-bold text-[var(--admin-primary)]">
              RE
            </div>
            {sidebarOpen ? (
              <div className="min-w-0">
                <div className="truncate text-xs font-bold tracking-wide text-[var(--admin-text)]">
                  Rajput Events
                </div>
                <div className="truncate text-[10px] text-[var(--admin-muted)]">
                  Operations
                </div>
              </div>
            ) : null}
          </Link>
        </div>

        <div
          className="hidden h-5 w-px shrink-0 self-center bg-[var(--admin-border)] lg:block"
          aria-hidden
        />

        {/* Page chrome — collapse control sits with the page name */}
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:px-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="admin-btn admin-btn-ghost shrink-0 !p-1.5"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <span className="lg:hidden">
              <Menu size={16} />
            </span>
            <span className="hidden lg:inline">
              {sidebarOpen ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
            </span>
          </button>

          {/* Mobile brand */}
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-1.5 lg:hidden"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[10px] font-bold text-[var(--admin-primary)]">
              RE
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold tracking-tight lg:text-base">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-[10px] text-[var(--admin-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={onSearch}
            className="relative hidden w-56 md:block lg:w-72"
          >
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers, events, IDs…"
              className="admin-input !pl-8"
            />
          </form>

          <div className="relative">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => setQuickOpen((v) => !v)}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Quick add</span>
            </button>
            {quickOpen ? (
              <div className="admin-card absolute right-0 z-40 mt-1.5 w-48 overflow-hidden">
                {[
                  ["/admin/enquiries?new=1", "New enquiry"],
                  ["/admin/customers?new=1", "New customer"],
                  ["/admin/vendors?new=1", "New vendor"],
                  ["/admin/quotes?new=1", "Create quote"],
                  ["/admin/payments?new=1", "Record payment"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-3 py-1.5 text-xs hover:bg-[var(--admin-surface-2)]"
                    onClick={() => setQuickOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="admin-btn admin-btn-ghost !p-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-ghost !p-2"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <Link
            href="/admin/profile"
            className="hidden items-center gap-2 rounded-xl border border-[var(--admin-border)] px-2.5 py-1.5 hover:bg-[var(--admin-surface-2)] sm:flex"
          >
            <UserCircle size={18} className="text-[var(--admin-primary)]" />
            <span className="max-w-[140px] truncate text-xs font-medium">
              {email || "Admin"}
            </span>
          </Link>

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="admin-btn admin-btn-ghost !p-2"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
