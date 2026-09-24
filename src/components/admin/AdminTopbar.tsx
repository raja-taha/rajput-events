"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  UserCircle,
} from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

type Props = {
  title: string;
  subtitle?: string;
  email?: string;
  onMenuClick: () => void;
};

export function AdminTopbar({ title, subtitle, email, onMenuClick }: Props) {
  const { theme, toggleTheme } = useAdminTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
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
    <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface)_92%,transparent)] backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="admin-btn admin-btn-ghost lg:hidden !p-2"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight lg:text-xl">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-[var(--admin-muted)]">{subtitle}</p>
          ) : null}
        </div>

        <form onSubmit={onSearch} className="relative hidden md:block w-64 lg:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, events, IDs…"
            className="admin-input !pl-9"
          />
        </form>

        <div className="relative">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setQuickOpen((v) => !v)}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Quick add</span>
          </button>
          {quickOpen ? (
            <div className="absolute right-0 mt-2 w-52 admin-card overflow-hidden z-40">
              {[
                ["/admin/enquiries/new", "New enquiry"],
                ["/admin/customers/new", "New customer"],
                ["/admin/vendors/new", "New vendor"],
                ["/admin/quotes/new", "Create quote"],
                ["/admin/payments/new", "Record payment"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2.5 text-sm hover:bg-[var(--admin-surface-2)]"
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

        <button type="button" className="admin-btn admin-btn-ghost !p-2" aria-label="Notifications">
          <Bell size={16} />
        </button>

        <Link
          href="/admin/profile"
          className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--admin-border)] px-2.5 py-1.5 hover:bg-[var(--admin-surface-2)]"
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
    </header>
  );
}
