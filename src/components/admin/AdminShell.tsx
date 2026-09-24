"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminPreferencesProvider } from "./AdminPreferencesProvider";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminToaster } from "./AdminToaster";
import { ADMIN_NAV } from "@/lib/admin/nav";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // On small screens start closed; keep desktop open by default after mount
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setSidebarOpen(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const { title, subtitle } = useMemo(() => {
    for (const group of ADMIN_NAV) {
      for (const item of group.items) {
        if (
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
        ) {
          return {
            title: item.label,
            subtitle: `${group.label} · Rajput Events`,
          };
        }
      }
    }
    if (pathname.startsWith("/admin/profile")) {
      return { title: "Profile", subtitle: "Account · Rajput Events" };
    }
    return { title: "Admin", subtitle: "Rajput Events" };
  }, [pathname]);

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  return (
    <AdminThemeProvider>
      <AdminPreferencesProvider>
        <div className="admin-root flex h-dvh flex-col overflow-hidden">
          <AdminTopbar
            title={title}
            subtitle={subtitle}
            email={email}
            sidebarOpen={sidebarOpen}
            onMenuClick={toggleSidebar}
          />
          <div className="relative flex min-h-0 flex-1 overflow-x-hidden">
            <AdminSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onNavigate={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
            />
            <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 lg:p-4">
              {children}
            </main>
          </div>
        </div>
        <AdminToaster />
      </AdminPreferencesProvider>
    </AdminThemeProvider>
  );
}
