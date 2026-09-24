"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
  onNavigate?: () => void;
};

type HoverTip = { label: string; top: number; left: number };

export function AdminSidebar({ open, onClose, onNavigate }: Props) {
  const pathname = usePathname();
  const collapsed = !open;
  const [tip, setTip] = useState<HoverTip | null>(null);

  function showTip(label: string, el: HTMLElement) {
    if (!collapsed || typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;
    const rect = el.getBoundingClientRect();
    setTip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  }

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={clsx(
          "admin-sidebar z-50 flex h-full shrink-0 flex-col overflow-hidden border-r border-white/5 bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-text)] transition-[width,transform] duration-200 ease-out",
          "fixed bottom-0 left-0 top-11 lg:static lg:top-auto",
          open
            ? "w-[220px] translate-x-0"
            : "w-[220px] -translate-x-full lg:w-14 lg:translate-x-0",
        )}
      >
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
          <div
            className={clsx(
              "flex shrink-0 items-center border-b border-white/10 lg:hidden",
              open ? "justify-end px-2 py-2" : "hidden",
            )}
          >
            <button
              type="button"
              className="rounded-lg p-1.5 hover:bg-white/10"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="admin-sidebar-nav min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain px-1.5 py-3">
            {ADMIN_NAV.map((group) => (
              <div key={group.label} className="min-w-0">
                <div
                  className={clsx(
                    "mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-sidebar-muted)]",
                    collapsed && "lg:hidden",
                  )}
                >
                  {group.label}
                </div>
                {collapsed ? (
                  <div className="mb-1 hidden justify-center lg:flex" aria-hidden>
                    <span className="h-px w-4 bg-white/15" />
                  </div>
                ) : null}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon] || LayoutDashboard;
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href} className="min-w-0">
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-label={item.label}
                          onMouseEnter={(e) => showTip(item.label, e.currentTarget)}
                          onMouseLeave={() => setTip(null)}
                          onFocus={(e) => showTip(item.label, e.currentTarget)}
                          onBlur={() => setTip(null)}
                          className={clsx(
                            "flex items-center rounded-lg text-xs transition-colors",
                            collapsed
                              ? "px-2 py-1.5 lg:justify-center lg:px-0 lg:py-2"
                              : "gap-2 px-2 py-1.5",
                            active
                              ? "bg-sky-400/15 font-semibold text-white"
                              : "hover:bg-white/5",
                          )}
                          style={
                            active
                              ? {
                                  boxShadow:
                                    "inset 3px 0 0 var(--admin-sidebar-active)",
                                }
                              : undefined
                          }
                        >
                          <Icon
                            size={16}
                            className={clsx(
                              "shrink-0",
                              active ? "text-sky-300" : "opacity-70",
                            )}
                          />
                          <span
                            className={clsx("truncate", collapsed && "lg:hidden")}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {tip && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              className="pointer-events-none fixed z-[80] -translate-y-1/2 whitespace-nowrap rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1 text-[11px] font-medium text-[var(--admin-text)] shadow-lg"
              style={{ top: tip.top, left: tip.left }}
            >
              {tip.label}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
