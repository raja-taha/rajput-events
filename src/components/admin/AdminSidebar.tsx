"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Receipt,
  Package,
  CalendarDays,
  CheckSquare,
  GitBranch,
  Star,
  Store,
  ClipboardList,
  MapPin,
  Boxes,
  ArrowLeftRight,
  PieChart,
  FileSpreadsheet,
  Wallet,
  Banknote,
  FolderOpen,
  Megaphone,
  Settings,
  UserCircle,
  BookOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { clsx } from "clsx";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Receipt,
  Package,
  CalendarDays,
  CheckSquare,
  GitBranch,
  Star,
  Store,
  ClipboardList,
  MapPin,
  Boxes,
  ArrowLeftRight,
  PieChart,
  FileSpreadsheet,
  Wallet,
  Banknote,
  FolderOpen,
  Megaphone,
  Settings,
  UserCircle,
  BookOpen,
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/5 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ background: "var(--admin-sidebar)", color: "var(--admin-sidebar-text)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300 font-bold">
              RE
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">Rajput Events</div>
              <div className="text-[11px]" style={{ color: "var(--admin-sidebar-muted)" }}>
                Operations Console
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {ADMIN_NAV.map((group) => (
            <div key={group.label}>
              <div
                className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--admin-sidebar-muted)" }}
              >
                {group.label}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon] || LayoutDashboard;
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-sky-400/15 text-white font-semibold"
                            : "hover:bg-white/5",
                        )}
                        style={
                          active
                            ? { boxShadow: "inset 3px 0 0 var(--admin-sidebar-active)" }
                            : undefined
                        }
                      >
                        <Icon size={16} className={active ? "text-sky-300" : "opacity-70"} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
