"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const TABLE_PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30] as const;
export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number];

const STORAGE_KEY = "re-admin-table-page-size";
const DEFAULT_PAGE_SIZE: TablePageSize = 10;

type PreferencesContextValue = {
  tablePageSize: TablePageSize;
  setTablePageSize: (size: TablePageSize) => void;
  showArchived: boolean;
  setShowArchived: (value: boolean) => Promise<void>;
  prefsReady: boolean;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function parsePageSize(value: string | null): TablePageSize {
  const n = Number(value);
  if (TABLE_PAGE_SIZE_OPTIONS.includes(n as TablePageSize)) {
    return n as TablePageSize;
  }
  return DEFAULT_PAGE_SIZE;
}

function readStoredPageSize(): TablePageSize {
  if (typeof window === "undefined") return DEFAULT_PAGE_SIZE;
  return parsePageSize(window.localStorage.getItem(STORAGE_KEY));
}

export function AdminPreferencesProvider({ children }: { children: ReactNode }) {
  const [tablePageSize, setTablePageSizeState] =
    useState<TablePageSize>(readStoredPageSize);
  const [showArchived, setShowArchivedState] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { credentials: "include" });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message || "Failed to load");
        const data = body.data || body || {};
        if (!cancelled) {
          setShowArchivedState(String(data.showArchived || "0") === "1");
        }
      } catch {
        // keep default off
      } finally {
        if (!cancelled) setPrefsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTablePageSize = useCallback((size: TablePageSize) => {
    setTablePageSizeState(size);
    window.localStorage.setItem(STORAGE_KEY, String(size));
  }, []);

  const setShowArchived = useCallback(async (value: boolean) => {
    setShowArchivedState(value);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showArchived: value ? "1" : "0" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message || "Failed to save");
    } catch {
      setShowArchivedState(!value);
      throw new Error("Failed to save preference");
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        tablePageSize,
        setTablePageSize,
        showArchived,
        setShowArchived,
        prefsReady,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function useAdminPreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error(
      "useAdminPreferences must be used within AdminPreferencesProvider",
    );
  }
  return ctx;
}
