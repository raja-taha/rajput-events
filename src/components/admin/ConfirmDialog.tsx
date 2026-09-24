"use client";

import { useEffect, useRef } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="admin-card fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 border-0 p-0 backdrop:bg-black/40"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h2>
        <p className="mt-1.5 text-xs text-[var(--admin-muted)]">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              destructive
                ? "admin-btn bg-[var(--admin-danger)] text-white hover:opacity-90"
                : "admin-btn admin-btn-primary"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
