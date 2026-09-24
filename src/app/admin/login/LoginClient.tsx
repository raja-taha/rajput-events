"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdminThemeProvider,
  useAdminTheme,
} from "@/components/admin/AdminThemeProvider";
import { AdminToaster } from "@/components/admin/AdminToaster";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { theme, toggleTheme } = useAdminTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message || "Invalid email or password");
        return;
      }
      toast.success("Signed in");
      const next = params.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-root relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--admin-primary) 25%, transparent) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="admin-btn admin-btn-ghost absolute right-4 top-4 z-10"
      >
        {theme === "light" ? "Dark" : "Light"} mode
      </button>

      <div className="relative z-10 w-full max-w-md admin-card p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <Sparkles size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Rajput Events Admin</h1>
          <p className="mt-1.5 text-sm text-[var(--admin-muted)]">
            Sign in to manage events, finance and operations
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Email
            </span>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
              />
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input !pl-10"
                placeholder="admin@example.com"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Password
            </span>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input !pl-10 !pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary w-full !py-3 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginClient() {
  return (
    <AdminThemeProvider>
      <LoginForm />
      <AdminToaster />
    </AdminThemeProvider>
  );
}
