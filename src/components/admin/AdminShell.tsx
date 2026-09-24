"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { ADMIN_NAV } from "@/lib/admin/nav";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <AdminThemeProvider>
      <div className="admin-root flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            title={title}
            subtitle={subtitle}
            email={email}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-3 lg:p-4">{children}</main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
