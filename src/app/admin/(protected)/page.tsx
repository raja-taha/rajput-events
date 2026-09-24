"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  Store,
  Users,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { formatMoney } from "@/lib/admin/money";

type Summary = {
  asOf: string;
  workload: {
    customers: number;
    openEnquiries: number;
    confirmedEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    approvedVendors: number;
  };
  cash: {
    cashIn: number;
    cashOut: number;
    netCash: number;
    clientDepositsHeld: number;
    vendorDepositsHeld: number;
  };
  attention: {
    overdueInvoices: number;
    overdueTasks: number;
    overdueFollowUps: number;
  };
  widgets: {
    recentEnquiries: Array<Record<string, unknown>>;
    upcomingBookings: Array<Record<string, unknown>>;
  };
};

function KpiCard({
  label,
  value,
  href,
  icon: Icon,
  note,
}: {
  label: string;
  value: string | number;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  note?: string;
}) {
  return (
    <Link href={href} className="admin-card block p-4 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
          {note ? (
            <div className="mt-1 text-xs text-[var(--admin-muted)]">{note}</div>
          ) : null}
        </div>
        <div className="rounded-xl bg-[var(--admin-primary-soft)] p-2.5 text-[var(--admin-primary)]">
          <Icon size={18} />
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard/summary")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error?.message || "Failed to load");
        setData(json);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load dashboard"));
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-card h-28 animate-pulse bg-[var(--admin-surface-2)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-bold tracking-tight">Rajput Events Dashboard</h2>
          <p className="text-[11px] text-[var(--admin-muted)]">
            Operations, events, cash and follow-ups at a glance · As of {data.asOf}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/enquiries?new=1" className="admin-btn admin-btn-primary">
            New enquiry
          </Link>
          <Link href="/admin/customers?new=1" className="admin-btn admin-btn-ghost">
            New customer
          </Link>
          <Link href="/admin/payments?new=1" className="admin-btn admin-btn-ghost">
            Record payment
          </Link>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Workload
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Customers" value={data.workload.customers} href="/admin/customers" icon={Users} />
          <KpiCard label="Open enquiries" value={data.workload.openEnquiries} href="/admin/enquiries" icon={MessageSquare} />
          <KpiCard label="Confirmed events" value={data.workload.confirmedEvents} href="/admin/bookings?stage=Confirmed" icon={CheckCircle2} />
          <KpiCard label="Events next 30 days" value={data.workload.upcomingEvents} href="/admin/bookings" icon={CalendarDays} />
          <KpiCard label="Completed events" value={data.workload.completedEvents} href="/admin/bookings?stage=Completed" icon={CalendarDays} />
          <KpiCard label="Approved vendors" value={data.workload.approvedVendors} href="/admin/vendors?vendorStatus=Approved" icon={Store} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Cash & deposits
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Cash in" value={formatMoney(data.cash.cashIn)} href="/admin/payments" icon={CircleDollarSign} note="Cleared movements" />
          <KpiCard label="Cash out" value={formatMoney(data.cash.cashOut)} href="/admin/payments" icon={CircleDollarSign} />
          <KpiCard label="Recorded net cash" value={formatMoney(data.cash.netCash)} href="/admin/payments" icon={CircleDollarSign} note="Ledger balance, not bank reconciliation" />
          <KpiCard label="Client deposits held" value={formatMoney(data.cash.clientDepositsHeld)} href="/admin/payments" icon={CircleDollarSign} />
          <KpiCard label="Vendor deposits held" value={formatMoney(data.cash.vendorDepositsHeld)} href="/admin/payments" icon={CircleDollarSign} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} className="text-amber-500" />
            Attention queue
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:text-[var(--admin-primary)]" href="/admin/enquiries">
                Overdue follow-ups · {data.attention.overdueFollowUps}
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--admin-primary)]" href="/admin/invoices">
                Overdue invoices · {data.attention.overdueInvoices}
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--admin-primary)]" href="/admin/tasks">
                Overdue tasks · {data.attention.overdueTasks}
              </Link>
            </li>
          </ul>
        </div>

        <div className="admin-card p-4">
          <div className="mb-3 font-semibold">Upcoming events</div>
          <ul className="space-y-2 text-sm">
            {data.widgets.upcomingBookings.length === 0 ? (
              <li className="text-[var(--admin-muted)]">No upcoming events</li>
            ) : (
              data.widgets.upcomingBookings.map((b) => (
                <li key={String(b.eventId)}>
                  <Link href={`/admin/bookings/${b.eventId}`} className="hover:text-[var(--admin-primary)]">
                    <span className="font-medium">{String(b.eventTitle || b.eventId)}</span>
                    <span className="text-[var(--admin-muted)]"> · {String(b.stage)}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="admin-card p-4">
          <div className="mb-3 font-semibold">Recent enquiries</div>
          <ul className="space-y-2 text-sm">
            {data.widgets.recentEnquiries.length === 0 ? (
              <li className="text-[var(--admin-muted)]">No enquiries yet</li>
            ) : (
              data.widgets.recentEnquiries.map((e) => (
                <li key={String(e.enquiryId)}>
                  <Link href={`/admin/enquiries/${e.enquiryId}`} className="hover:text-[var(--admin-primary)]">
                    <span className="font-medium">
                      {String(e.occasionTitle || e.enquiryId)}
                    </span>
                    <span className="text-[var(--admin-muted)]"> · {String(e.stage)}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
