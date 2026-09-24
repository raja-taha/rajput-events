"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ResourceTable } from "./ResourceTable";
import { StatusBadge } from "./StatusBadge";
import { fetchList } from "@/lib/admin/client-api";
import { RESOURCE_META, type ResourceKey } from "@/lib/admin/resource-config";
import { RESOURCE_LABELS } from "@/lib/admin/resource-fields";

type Row = Record<string, unknown>;

export function EntityListClient({ resourceKey }: { resourceKey: ResourceKey }) {
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const search = searchParams.get("search") || "";

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchList<Row>(resourceKey, { page, pageSize: 25, search });
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resourceKey, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const idField = def.businessIdField;
  const labelField = def.labelField || idField;
  const statusFields = ["stage", "status", "vendorStatus", "clearance", "implementationStatus"];

  const columns = [
    {
      key: idField,
      header: "ID",
      render: (row: Row) => (
        <span className="font-mono text-xs">{String(row[idField] ?? "")}</span>
      ),
    },
    {
      key: labelField,
      header: "Name",
      render: (row: Row) => String(row[labelField] ?? "—"),
    },
    ...statusFields
      .filter((f) => rows.some((r) => r[f] != null) || f === "stage" || f === "status")
      .slice(0, 1)
      .map((f) => ({
        key: f,
        header: "Status",
        render: (row: Row) => <StatusBadge status={String(row[f] ?? "")} />,
      })),
  ];

  const setQuery = (next: { page?: number; search?: string }) => {
    const q = new URLSearchParams(searchParams.toString());
    if (next.page != null) q.set("page", String(next.page));
    if (next.search != null) {
      if (next.search) q.set("search", next.search);
      else q.delete("search");
      q.set("page", "1");
    }
    router.push(`/admin/${meta.adminPath}?${q.toString()}`);
  };

  return (
    <>
      <PageHeader
        title={meta.title}
        description={`Manage ${meta.title.toLowerCase()} records.`}
        actionHref={`/admin/${meta.adminPath}/new`}
        actionLabel={`New ${meta.singular}`}
      />
      {error ? (
        <p className="mb-4 text-sm text-[var(--admin-danger)]">{error}</p>
      ) : null}
      <ResourceTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String(row[idField])}
        editHref={(row) => `/admin/${meta.adminPath}/${encodeURIComponent(String(row[idField]))}`}
        loading={loading}
        page={page}
        pageSize={25}
        total={total}
        totalPages={totalPages}
        search={search}
        onSearchChange={(v) => setQuery({ search: v })}
        onPageChange={(p) => setQuery({ page: p })}
      />
    </>
  );
}
