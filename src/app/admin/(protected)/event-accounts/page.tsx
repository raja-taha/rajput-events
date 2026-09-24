"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/admin/money";
import { formatDate } from "@/lib/admin/dates";

type Row = Record<string, unknown>;

export default function EventAccountsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/event-accounts")
      .then((r) => r.json())
      .then((d) => setRows(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Event accounts</h2>
        <p className="text-sm text-[var(--admin-muted)]">
          Derived profitability view — calculated from quotes, changes, payments, POs and expenses.
        </p>
      </div>
      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Stage</th>
              <th className="text-right">Contract</th>
              <th className="text-right">Client cash</th>
              <th className="text-right">Direct cost</th>
              <th className="text-right">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-[var(--admin-muted)]">
                  No bookings yet. Create a booking to see event accounts.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row.eventId)}>
                  <td>
                    <Link
                      href={`/admin/bookings/${row.eventId}`}
                      className="font-medium text-[var(--admin-primary)]"
                    >
                      {String(row.eventTitle || row.eventId)}
                    </Link>
                  </td>
                  <td>{formatDate(row.eventDate as string)}</td>
                  <td>{String(row.stage || "—")}</td>
                  <td className="text-right tabular-nums">
                    {formatMoney(Number(row.contractTotal || 0))}
                  </td>
                  <td className="text-right tabular-nums">
                    {formatMoney(Number(row.netClientCashReceived || 0))}
                  </td>
                  <td className="text-right tabular-nums">
                    {formatMoney(Number(row.totalDirectCost || 0))}
                  </td>
                  <td className="text-right tabular-nums font-semibold">
                    {formatMoney(Number(row.eventContribution || 0))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
