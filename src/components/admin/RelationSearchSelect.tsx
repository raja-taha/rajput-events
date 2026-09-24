"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { fetchList, getOne } from "@/lib/admin/client-api";
import { RESOURCE_META, type ResourceKey } from "@/lib/admin/resource-config";
import { clsx } from "clsx";

type Option = {
  id: string;
  label: string;
};

type Props = {
  resource: ResourceKey;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function RelationSearchSelect({
  resource,
  value,
  onChange,
  required,
  placeholder = "Search and select…",
}: Props) {
  const meta = RESOURCE_META[resource];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const res = await fetchList<Record<string, unknown>>(resource, {
          page: 1,
          pageSize: 25,
          search,
          sort: `${meta.businessIdField}:asc`,
        }, { silentAll: true });
        setOptions(
          res.data.map((row) => {
            const id = String(row[meta.businessIdField] ?? "");
            const name = String(row[meta.labelField] ?? "");
            const label =
              name && name !== id ? `${id} — ${name}` : id || "—";
            return { id, label };
          }),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [meta.businessIdField, meta.labelField, resource],
  );

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => void load(query), 200);
    return () => window.clearTimeout(t);
  }, [open, query, load]);

  useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const row = await getOne<Record<string, unknown>>(resource, value, {
          silentAll: true,
        });
        if (cancelled) return;
        const name = String(row[meta.labelField] ?? "");
        setSelectedLabel(name && name !== value ? `${value} — ${name}` : value);
      } catch {
        if (!cancelled) setSelectedLabel(value);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, resource, meta.labelField]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const display = useMemo(
    () => selectedLabel || value || "",
    [selectedLabel, value],
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="admin-input flex w-full items-center justify-between gap-2 text-left !py-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={clsx("truncate text-xs", !display && "text-[var(--admin-muted)]")}>
          {display || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value ? (
            <span
              role="button"
              tabIndex={0}
              className="rounded p-0.5 hover:bg-[var(--admin-surface-2)]"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSelectedLabel("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  onChange("");
                  setSelectedLabel("");
                }
              }}
            >
              <X size={12} />
            </span>
          ) : null}
          <ChevronsUpDown size={14} className="opacity-60" />
        </span>
      </button>
      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          value={value}
          onChange={() => undefined}
          required
        />
      ) : null}
      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-lg">
          <div className="border-b border-[var(--admin-border)] p-1.5">
            <input
              autoFocus
              className="admin-input !py-1.5 text-xs"
              placeholder={`Search ${meta.title.toLowerCase()}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1 text-xs">
            {loading ? (
              <li className="flex items-center gap-2 px-3 py-2 text-[var(--admin-muted)]">
                <Loader2 size={12} className="animate-spin" /> Loading…
              </li>
            ) : options.length === 0 ? (
              <li className="px-3 py-2 text-[var(--admin-muted)]">No matches</li>
            ) : (
              options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={clsx(
                      "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-[var(--admin-surface-2)]",
                      opt.id === value && "bg-[var(--admin-primary-soft)]",
                    )}
                    onClick={() => {
                      onChange(opt.id);
                      setSelectedLabel(opt.label);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.id === value ? <Check size={12} /> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
