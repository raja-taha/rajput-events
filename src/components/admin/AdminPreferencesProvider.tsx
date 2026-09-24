"use client";

import {
  createContext,
  useCallback,
  useContext,
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

  const setTablePageSize = useCallback((size: TablePageSize) => {
    setTablePageSizeState(size);
    window.localStorage.setItem(STORAGE_KEY, String(size));
  }, []);

  return (
    <PreferencesContext.Provider value={{ tablePageSize, setTablePageSize }}>
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
