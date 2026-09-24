"use client";

import { Toaster } from "react-hot-toast";

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3500,
        className: "!text-xs !font-medium",
        style: {
          background: "var(--admin-surface)",
          color: "var(--admin-text)",
          border: "1px solid var(--admin-border)",
          borderRadius: "10px",
          boxShadow: "var(--admin-shadow)",
          maxWidth: "360px",
        },
        success: {
          iconTheme: {
            primary: "var(--admin-success)",
            secondary: "#fff",
          },
        },
        error: {
          duration: 4500,
          iconTheme: {
            primary: "var(--admin-danger)",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
