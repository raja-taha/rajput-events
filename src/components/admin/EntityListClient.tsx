"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "./PageHeader";
import { ResourceTable, type TableColumn } from "./ResourceTable";
import { StatusBadge } from "./StatusBadge";
import { EntityFormModal } from "./EntityFormModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { MoneyText } from "./MoneyText";
import { RelationLink } from "./RelationLink";
import { fetchList, updateOne, archiveOne } from "@/lib/admin/client-api";
import { RESOURCE_META, type ResourceKey } from "@/lib/admin/resource-config";
import { RESOURCE_LABELS } from "@/lib/admin/resource-fields";
import { adminResourceHref, hasDetailPage } from "@/lib/admin/detail-pages";
import { customerStatuses, enquiryStages, quoteStatuses, bookingStages, changeImplementationStatuses, vendorStatuses } from "@/models/enums";
import { formatDate } from "@/lib/admin/dates";
import { useAdminPreferences } from "./AdminPreferencesProvider";

type Row = Record<string, unknown>;

const STATUS_FIELDS = [
  "stage",
  "status",
  "vendorStatus",
  "clearance",
  "implementationStatus",
  "approvalStatus",
] as const;

export function EntityListClient({ resourceKey }: { resourceKey: ResourceKey }) {
  const def = RESOURCE_META[resourceKey];
  const meta = RESOURCE_LABELS[resourceKey];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tablePageSize } = useAdminPreferences();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const search = searchParams.get("search") || "";
  const editParam = searchParams.get("edit");
  const newParam = searchParams.get("new");

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);
  const openedFromQuery = useRef<string | null>(null);
  const loadRequestId = useRef(0);

  const idField = def.businessIdField;
  const labelField = def.labelField;
  const isCustomers = resourceKey === "customers";
  const isEnquiries = resourceKey === "enquiries";
  const isQuotes = resourceKey === "quotes";
  const isVenues = resourceKey === "venues";
  const isBookings = resourceKey === "bookings";
  const isEventBriefs = resourceKey === "event-briefs";
  const isChanges = resourceKey === "changes";
  const isFeedback = resourceKey === "feedback";
  const isVendors = resourceKey === "vendors";

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
    const requestId = ++loadRequestId.current;
    setLoading(true);
    try {
      const res = await fetchList<Row>(resourceKey, {
        page,
        pageSize: tablePageSize,
        search,
        sort: `${idField}:asc`,
      });
      if (requestId !== loadRequestId.current) return;
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      if (requestId !== loadRequestId.current) return;
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [resourceKey, page, search, idField, tablePageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const prevPageSize = useRef(tablePageSize);
  useEffect(() => {
    if (prevPageSize.current === tablePageSize) return;
    prevPageSize.current = tablePageSize;
    if (page !== 1) {
      const q = new URLSearchParams(searchParams.toString());
      q.set("page", "1");
      router.push(`/admin/${meta.adminPath}?${q.toString()}`);
    }
  }, [tablePageSize, page, searchParams, router, meta.adminPath]);

  const onInlineFieldChange = useCallback(
    async (row: Row, field: string, value: string) => {
      const id = String(row[idField] || "");
      if (!id || String(row[field] || "") === value) return;
      setStatusSavingId(id);
      const previous = row[field];
      setRows((prev) =>
        prev.map((r) => (String(r[idField]) === id ? { ...r, [field]: value } : r)),
      );
      try {
        await updateOne(resourceKey, id, { [field]: value });
      } catch {
        setRows((prev) =>
          prev.map((r) =>
            String(r[idField]) === id ? { ...r, [field]: previous } : r,
          ),
        );
      } finally {
        setStatusSavingId(null);
      }
    },
    [idField, resourceKey],
  );

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

    if (isCustomers) {
      cols.push(
        {
          key: "col-label",
          header: "Name",
          render: (row) => {
            const text = String(row.fullName || "—");
            return (
              <span className="text-xs">
                {text.length > 40 ? `${text.slice(0, 40)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-phone",
          header: "Phone",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {String(row.mobileWhatsApp || "—")}
            </span>
          ),
        },
        {
          key: "col-email",
          header: "Email",
          render: (row) => {
            const email = String(row.email || "");
            return (
              <span className="text-xs" title={email || undefined}>
                {email
                  ? email.length > 28
                    ? `${email.slice(0, 28)}…`
                    : email
                  : "—"}
              </span>
            );
          },
        },
        {
          key: "col-status",
          header: "Status",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.status || "Active");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(row, "status", e.target.value)
                }
              >
                {customerStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isEnquiries) {
      cols.push(
        {
          key: "col-customer",
          header: "Customer",
          render: (row) => {
            const name = String(row.customerName || "");
            const cid = String(row.customerId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="customers" id={cid || null} label={name} />
                </div>
                {cid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {cid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-event-type",
          header: "Event type",
          render: (row) => (
            <span className="text-xs">{String(row.eventType || "—")}</span>
          ),
        },
        {
          key: "col-package",
          header: "Package",
          render: (row) => (
            <span className="text-xs">{String(row.packageLevel || "—")}</span>
          ),
        },
        {
          key: "col-budget",
          header: "Budget",
          render: (row) => (
            <MoneyText
              amount={Number(row.targetBudget || 0)}
              className="text-xs tabular-nums"
            />
          ),
        },
        {
          key: "col-status",
          header: "Status",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.stage || "New");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(row, "stage", e.target.value)
                }
              >
                {enquiryStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isQuotes) {
      cols.push(
        {
          key: "col-customer",
          header: "Customer",
          render: (row) => {
            const name = String(row.customerName || "");
            const cid = String(row.customerId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="customers" id={cid || null} label={name} />
                </div>
                {cid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {cid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-issue",
          header: "Issue date",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {formatDate(
                (row.issueDate as string | Date | null | undefined) ?? null,
              )}
            </span>
          ),
        },
        {
          key: "col-valid",
          header: "Valid until",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {formatDate(
                (row.validUntil as string | Date | null | undefined) ?? null,
              )}
            </span>
          ),
        },
        {
          key: "col-status",
          header: "Status",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.status || "Draft");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(row, "status", e.target.value)
                }
              >
                {quoteStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isBookings) {
      cols.push(
        {
          key: "col-customer",
          header: "Customer",
          render: (row) => {
            const name = String(row.customerName || "");
            const cid = String(row.customerId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="customers" id={cid || null} label={name} />
                </div>
                {cid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {cid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-title",
          header: "Event title",
          render: (row) => {
            const text = String(row.eventTitle || "—");
            return (
              <span className="text-xs" title={text}>
                {text.length > 36 ? `${text.slice(0, 36)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-type",
          header: "Type",
          render: (row) => (
            <span className="text-xs">{String(row.eventType || "—")}</span>
          ),
        },
        {
          key: "col-date",
          header: "Date",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {formatDate(
                (row.eventDate as string | Date | null | undefined) ?? null,
              )}
            </span>
          ),
        },
        {
          key: "col-guests",
          header: "Guests",
          render: (row) => {
            const n = row.guestCount;
            return (
              <span className="text-xs tabular-nums">
                {n == null || n === "" ? "—" : String(n)}
              </span>
            );
          },
        },
        {
          key: "col-venue",
          header: "Venue",
          render: (row) => {
            const name = String(row.venueName || "");
            const vid = String(row.venueId || "");
            return (
              <span className="text-xs">
                <RelationLink resource="venues" id={vid || null} label={name} />
              </span>
            );
          },
        },
        {
          key: "col-quoted",
          header: "Quoted",
          render: (row) => {
            const amount = row.quotedAmount;
            if (amount == null || amount === "") {
              return (
                <span className="text-xs text-[var(--admin-muted)]">—</span>
              );
            }
            return (
              <MoneyText
                amount={Number(amount)}
                className="text-xs tabular-nums"
              />
            );
          },
        },
        {
          key: "col-stage",
          header: "Stage",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.stage || "Tentative");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(row, "stage", e.target.value)
                }
              >
                {bookingStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isChanges) {
      cols.push(
        {
          key: "col-event",
          header: "Event",
          render: (row) => {
            const name = String(row.eventName || "");
            const eid = String(row.eventId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="bookings" id={eid || null} label={name} />
                </div>
                {eid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {eid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-requested",
          header: "Requested change",
          render: (row) => {
            const text = String(row.requestedChange || "—");
            return (
              <span className="text-xs" title={text}>
                {text.length > 48 ? `${text.slice(0, 48)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-fee",
          header: "Fee",
          render: (row) => {
            const amount = row.feeChangeExclTax;
            if (amount == null || amount === "") {
              return (
                <span className="text-xs text-[var(--admin-muted)]">—</span>
              );
            }
            return (
              <MoneyText
                amount={Number(amount)}
                className="text-xs tabular-nums"
              />
            );
          },
        },
        {
          key: "col-status",
          header: "Status",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.implementationStatus || "Pending");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(
                    row,
                    "implementationStatus",
                    e.target.value,
                  )
                }
              >
                {changeImplementationStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isFeedback) {
      cols.push(
        {
          key: "col-event",
          header: "Event",
          render: (row) => {
            const name = String(row.eventName || "");
            const eid = String(row.eventId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="bookings" id={eid || null} label={name} />
                </div>
                {eid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {eid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-rating",
          header: "Rating",
          render: (row) => {
            const n = row.overallRating;
            return (
              <span className="text-xs tabular-nums">
                {n == null || n === "" ? "—" : `${n}/5`}
              </span>
            );
          },
        },
        {
          key: "col-media",
          header: "Media consent",
          render: (row) => (
            <span className="text-xs">{String(row.mediaConsent || "—")}</span>
          ),
        },
      );
      return cols;
    }

    if (isEventBriefs) {
      cols.push(
        {
          key: "col-event",
          header: "Event",
          render: (row) => {
            const name = String(row.eventName || "");
            const eid = String(row.eventId || "");
            return (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">
                  <RelationLink resource="bookings" id={eid || null} label={name} />
                </div>
                {eid ? (
                  <div className="font-mono text-[10px] text-[var(--admin-muted)]">
                    {eid}
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "col-theme",
          header: "Theme",
          render: (row) => {
            const text = String(row.themeVision || "—");
            return (
              <span className="text-xs" title={text}>
                {text.length > 48 ? `${text.slice(0, 48)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-colours",
          header: "Colours",
          render: (row) => (
            <span className="text-xs">{String(row.colours || "—")}</span>
          ),
        },
      );
      return cols;
    }

    if (isVendors) {
      cols.push(
        {
          key: "col-name",
          header: "Business name",
          render: (row) => {
            const text = String(row.businessName || "—");
            return (
              <span className="text-xs">
                {text.length > 40 ? `${text.slice(0, 40)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-category",
          header: "Category",
          render: (row) => (
            <span className="text-xs">{String(row.category || "—")}</span>
          ),
        },
        {
          key: "col-contact",
          header: "Contact",
          render: (row) => (
            <span className="text-xs">{String(row.authorizedContact || "—")}</span>
          ),
        },
        {
          key: "col-mobile",
          header: "Mobile",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {String(row.mobileWhatsApp || "—")}
            </span>
          ),
        },
        {
          key: "col-email",
          header: "Email",
          render: (row) => {
            const email = String(row.email || "");
            return (
              <span className="text-xs" title={email || undefined}>
                {email
                  ? email.length > 28
                    ? `${email.slice(0, 28)}…`
                    : email
                  : "—"}
              </span>
            );
          },
        },
        {
          key: "col-status",
          header: "Status",
          render: (row) => {
            const id = String(row[idField] || "");
            const value = String(row.vendorStatus || "Prospect");
            return (
              <select
                className="admin-input !w-auto min-w-[7.5rem] !py-1 text-[11px]"
                value={value}
                disabled={statusSavingId === id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  void onInlineFieldChange(row, "vendorStatus", e.target.value)
                }
              >
                {vendorStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            );
          },
        },
      );
      return cols;
    }

    if (isVenues) {
      cols.push(
        {
          key: "col-name",
          header: "Name",
          render: (row) => {
            const text = String(row.venueName || "—");
            return (
              <span className="text-xs">
                {text.length > 40 ? `${text.slice(0, 40)}…` : text}
              </span>
            );
          },
        },
        {
          key: "col-area",
          header: "Area",
          render: (row) => (
            <span className="text-xs">{String(row.areaCity || "—")}</span>
          ),
        },
        {
          key: "col-manager",
          header: "Manager",
          render: (row) => (
            <span className="text-xs">{String(row.venueManager || "—")}</span>
          ),
        },
        {
          key: "col-contact",
          header: "Contact",
          render: (row) => (
            <span className="text-xs tabular-nums">
              {String(row.managerMobile || "—")}
            </span>
          ),
        },
        {
          key: "col-capacity",
          header: "Capacity",
          render: (row) => {
            const n = row.guestCapacity;
            return (
              <span className="text-xs tabular-nums">
                {n == null || n === "" ? "—" : String(n)}
              </span>
            );
          },
        },
      );
      return cols;
    }

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

    const statusField = STATUS_FIELDS.find((f) =>
      rows.some((r) => r[f] != null && r[f] !== ""),
    );

    if (statusField) {
      cols.push({
        key: "col-status",
        header: "Status",
        render: (row) => <StatusBadge status={String(row[statusField] ?? "")} />,
      });
    }

    return cols;
  }, [
    idField,
    labelField,
    rows,
    isCustomers,
    isEnquiries,
    isQuotes,
    isVenues,
    isBookings,
    isEventBriefs,
    isChanges,
    isFeedback,
    isVendors,
    statusSavingId,
    onInlineFieldChange,
  ]);

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

  function openDetail(row: Row) {
    const id = String(row[idField] || "");
    if (!id || !hasDetailPage(resourceKey)) return;
    router.push(adminResourceHref(resourceKey, id));
  }

  function requestDelete(row: Row) {
    const id = String(row[idField] || "");
    if (id) setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await archiveOne(resourceKey, deleteId);
      setDeleteId(null);
      await load();
    } catch {
      // toast handled in client-api
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={meta.title}
        description={`${total} record${total === 1 ? "" : "s"} · sorted by ID`}
        actionLabel={`Add ${meta.singular}`}
        onAction={openCreate}
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String(row[idField] || row._id || "")}
        onRowOpen={openEdit}
        onRowClick={hasDetailPage(resourceKey) ? openDetail : undefined}
        onRowDelete={requestDelete}
        loading={loading}
        page={page}
        pageSize={tablePageSize}
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
      <ConfirmDialog
        open={Boolean(deleteId)}
        title={`Delete ${meta.singular.toLowerCase()}?`}
        message="This record will be archived (soft delete)."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={() => {
          if (!deleting) void confirmDelete();
        }}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
      />
    </>
  );
}
