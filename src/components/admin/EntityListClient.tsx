"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ResourceTable, type TableColumn } from "./ResourceTable";
import { StatusBadge } from "./StatusBadge";
import { EntityFormModal } from "./EntityFormModal";
import { fetchList } from "@/lib/admin/client-api";
import { RESOURCE_META, type ResourceKey } from "@/lib/admin/resource-config";
import { RESOURCE_LABELS } from "@/lib/admin/resource-fields";

type Row = Record<string, unknown>;

const STATUS_FIELDS = [
  "stage",
  "status",
  "vendorStatus",
  "clearance",
  "implementationStatus",
  "approvalStatus",
] as const;

const PAGE_SIZE = 10;

export function EntityListClient({ resourceKey }: { resourceKey: ResourceKey }) {
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const search = searchParams.get("search") || "";
  const editParam = searchParams.get("edit");
  const newParam = searchParams.get("new");

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const openedFromQuery = useRef<string | null>(null);

  const idField = def.businessIdField;
  const labelField = def.labelField;

  useEffect(() => {
    if (!newParam && !editParam) {
      openedFromQuery.current = null;
      return;
    }
    const key = newParam === "1" ? "new" : `edit:${editParam}`;
    if (openedFromQuery.current === key) return;
    openedFromQuery.current = key;

    if (newParam === "1") {
      setEditId(null);
      setModalOpen(true);
    } else if (editParam) {
      setEditId(editParam);
      setModalOpen(true);
    }

    const q = new URLSearchParams(searchParams.toString());
    q.delete("new");
    q.delete("edit");
    const qs = q.toString();
    router.replace(`/admin/${meta.adminPath}${qs ? `?${qs}` : ""}`);
  }, [newParam, editParam, searchParams, router, meta.adminPath]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchList<Row>(resourceKey, {
        page,
        pageSize: PAGE_SIZE,
        search,
        sort: `${idField}:asc`,
      });
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resourceKey, page, search, idField]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo(() => {
    const cols: TableColumn<Row>[] = [
      {
        key: "col-id",
        header: "ID",
        render: (row) => (
          <span className="font-mono text-[11px]">{String(row[idField] ?? "—")}</span>
        ),
      },
    ];

    if (labelField && labelField !== idField) {
      cols.push({
        key: "col-label",
        header: "Name",
        render: (row) => {
          const value = row[labelField];
          const text = value == null || value === "" ? "—" : String(value);
          return (
            <span className="text-xs">
              {text.length > 60 ? `${text.slice(0, 60)}…` : text}
            </span>
          );
        },
      });
    }

    const statusField =
      STATUS_FIELDS.find((f) => rows.some((r) => r[f] != null)) ||
      STATUS_FIELDS.find((f) => f === "stage" || f === "status");

    if (statusField) {
      cols.push({
        key: "col-status",
        header: "Status",
        render: (row) => <StatusBadge status={String(row[statusField] ?? "")} />,
      });
    }

    return cols;
  }, [idField, labelField, rows]);

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

  function openCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(row: Row) {
    setEditId(String(row[idField] || ""));
    setModalOpen(true);
  }

  return (
    <>
      <PageHeader
        title={meta.title}
        description={`${total} record${total === 1 ? "" : "s"} · sorted by ID`}
        actionLabel={`Add ${meta.singular}`}
        onAction={openCreate}
      />
      {error ? (
        <p className="mb-3 text-xs text-[var(--admin-danger)]">{error}</p>
      ) : null}
      <ResourceTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String(row[idField] || row._id || "")}
        onRowOpen={openEdit}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        search={search}
        onSearchChange={(v) => setQuery({ search: v })}
        onPageChange={(p) => setQuery({ page: p })}
      />
      <EntityFormModal
        open={modalOpen}
        resourceKey={resourceKey}
        businessId={editId}
        onClose={() => setModalOpen(false)}
        onSaved={() => void load()}
      />
    </>
  );
}
