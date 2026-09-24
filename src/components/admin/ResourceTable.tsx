"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

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
  onRowOpen: (row: T) => void;
  onRowDelete?: (row: T) => void;
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
        <tr key={`sk-row-${i}`} className="border-b border-[var(--admin-border)]">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={`sk-cell-${i}-${j}`} className="px-2.5 py-1.5">
              <div className="h-3 animate-pulse rounded bg-[var(--admin-border)]" />
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
  onRowOpen,
  onRowDelete,
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

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-[var(--admin-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search…"
          className="admin-input max-w-xs !py-1.5 text-xs"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchChange(localSearch);
          }}
          onBlur={() => {
            if (localSearch !== search) onSearchChange(localSearch);
          }}
        />
        <p className="text-[11px] text-[var(--admin-muted)]">
          {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              <th className="w-[1%] whitespace-nowrap py-1.5 pl-2.5 pr-5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={columns.length + 1} />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-2.5 py-8 text-center text-[var(--admin-muted)]"
                >
                  {emptyTitle}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const key = rowKey(row) || `row-${index}`;
                return (
                  <tr
                    key={key}
                    className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)]/70"
                  >
                    {columns.map((col) => (
                      <td
                        key={`${key}-${col.key}`}
                        className={`px-2.5 py-1.5 align-middle ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "—")}
                      </td>
                    ))}
                    <td className="py-1.5 pl-2.5 pr-5 align-middle">
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onRowOpen(row)}
                          className="rounded p-1.5 text-[var(--admin-primary)] hover:bg-[var(--admin-surface-2)]"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil size={14} strokeWidth={2} />
                        </button>
                        {onRowDelete ? (
                          <button
                            type="button"
                            onClick={() => onRowDelete(row)}
                            className="rounded p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-surface-2)]"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--admin-border)] px-3 py-2">
        <button
          type="button"
          className="admin-btn admin-btn-ghost !px-2 !py-1 text-[11px]"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="text-[11px] text-[var(--admin-muted)]">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="admin-btn admin-btn-ghost !px-2 !py-1 text-[11px]"
          disabled={page >= totalPages || loading || total === 0}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
