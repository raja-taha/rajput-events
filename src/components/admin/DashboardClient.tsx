"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MoneyText } from "./MoneyText";

type Summary = {
  asOf: string;
  workload: {
    customersTotal: number;
    openEnquiries: number;
    confirmedBookings: number;
    eventsNext30: number;
    completedBookings: number;
    approvedVendors: number;
  };
  cash: {
    cashIn: number;
    cashOut: number;
    netCash: number;
  };
  attention: {
    overdueFollowUps: number;
    overdueInvoices: number;
    overdueTasks: number;
  };
};

function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const inner = (
    <div className="admin-card p-5 transition-shadow hover:shadow-md">
      <p className="text-sm text-[var(--admin-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--admin-text)]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function DashboardClient() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard/summary", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json() as Promise<Summary>;
      })
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load dashboard"));
  }, []);

  if (!data) {
    return <p className="text-[var(--admin-muted)]">Loading dashboard…</p>;
  }

  const chartData = [
    { name: "Customers", count: data.workload.customersTotal },
    { name: "Enquiries", count: data.workload.openEnquiries },
    { name: "Confirmed", count: data.workload.confirmedBookings },
    { name: "Next 30d", count: data.workload.eventsNext30 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-text)]">
          Rajput Events Dashboard
        </h1>
        <p className="text-sm text-[var(--admin-muted)]">
          Operations, events, cash and follow-ups at a glance
        </p>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          As of {new Date(data.asOf).toLocaleString()}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Workload
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="Customers"
            value={data.workload.customersTotal}
            href="/admin/customers"
          />
          <KpiCard
            label="Open enquiries"
            value={data.workload.openEnquiries}
            href="/admin/enquiries"
          />
          <KpiCard
            label="Confirmed events"
            value={data.workload.confirmedBookings}
            href="/admin/bookings"
          />
          <KpiCard
            label="Events next 30 days"
            value={data.workload.eventsNext30}
            href="/admin/bookings"
          />
          <KpiCard
            label="Completed events"
            value={data.workload.completedBookings}
            href="/admin/bookings"
          />
          <KpiCard
            label="Approved vendors"
            value={data.workload.approvedVendors}
            href="/admin/vendors"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Cash (cleared payments)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="admin-card p-5">
            <p className="text-sm text-[var(--admin-muted)]">Cash in</p>
            <p className="mt-2 text-2xl font-semibold">
              <MoneyText amount={data.cash.cashIn} />
            </p>
          </div>
          <div className="admin-card p-5">
            <p className="text-sm text-[var(--admin-muted)]">Cash out</p>
            <p className="mt-2 text-2xl font-semibold">
              <MoneyText amount={data.cash.cashOut} />
            </p>
          </div>
          <div className="admin-card p-5">
            <p className="text-sm text-[var(--admin-muted)]">Recorded net cash</p>
            <p className="mt-2 text-2xl font-semibold">
              <MoneyText amount={data.cash.netCash} />
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-5">
          <h2 className="mb-4 font-semibold text-[var(--admin-text)]">Attention</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/admin/enquiries" className="text-[var(--admin-accent)] hover:underline">
                Overdue follow-ups: {data.attention.overdueFollowUps}
              </Link>
            </li>
            <li className="text-[var(--admin-muted)]">
              Overdue invoices: {data.attention.overdueInvoices} (stub)
            </li>
            <li className="text-[var(--admin-muted)]">
              Overdue tasks: {data.attention.overdueTasks} (stub)
            </li>
          </ul>
        </div>
        <div className="admin-card p-5">
          <h2 className="mb-4 font-semibold text-[var(--admin-text)]">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ["/admin/enquiries?new=1", "New enquiry"],
              ["/admin/customers?new=1", "New customer"],
              ["/admin/vendors?new=1", "New vendor"],
              ["/admin/quotes?new=1", "Create quote"],
              ["/admin/payments?new=1", "Record payment"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="admin-btn admin-btn-primary">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-card p-5">
        <h2 className="mb-4 font-semibold text-[var(--admin-text)]">Pipeline snapshot</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--admin-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
