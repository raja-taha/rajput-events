import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-root flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
