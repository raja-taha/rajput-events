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
import toast from "react-hot-toast";
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
    <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface)_92%,transparent)] backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 py-2 lg:px-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="admin-btn admin-btn-ghost lg:hidden !p-1.5"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold tracking-tight lg:text-base">{title}</h1>
          {subtitle ? (
            <p className="truncate text-[10px] text-[var(--admin-muted)]">{subtitle}</p>
          ) : null}
        </div>

        <form onSubmit={onSearch} className="relative hidden md:block w-56 lg:w-72">
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
            <div className="absolute right-0 z-40 mt-1.5 w-48 overflow-hidden admin-card">
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
