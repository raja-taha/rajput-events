"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type TableColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T extends { [k: string]: unknown }> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  editHref: (row: T) => string;
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search: string;
  onSearchChange: (v: string) => void;
  onPageChange: (page: number) => void;
  emptyTitle?: string;
};

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--admin-border)]">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-[var(--admin-border)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ResourceTable<T extends { [k: string]: unknown }>({
  columns,
  rows,
  rowKey,
  editHref,
  loading,
  page,
  pageSize,
  total,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  emptyTitle = "No records yet",
}: Props<T>) {
  const [localSearch, setLocalSearch] = useState(search);

  useMemo(() => {
    setLocalSearch(search);
  }, [search]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search…"
          className="admin-input max-w-sm"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchChange(localSearch);
          }}
          onBlur={() => {
            if (localSearch !== search) onSearchChange(localSearch);
          }}
        />
        <p className="text-sm text-[var(--admin-muted)]">
          {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-[var(--admin-muted)] ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-[var(--admin-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={columns.length + 1} />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-[var(--admin-muted)]"
                >
                  {emptyTitle}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)]/60"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <Link
                      href={editHref(row)}
                      className="text-sm font-medium text-[var(--admin-accent)] hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--admin-border)] p-4">
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-[var(--admin-muted)]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
