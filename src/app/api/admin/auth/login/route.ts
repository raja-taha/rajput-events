import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkLoginRateLimit,
  createAdminSessionToken,
  getAdminEmail,
  setSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { fail, ok } from "@/lib/admin/api";
import { writeAudit } from "@/lib/admin/audit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) {
    return fail("RATE_LIMITED", "Too many login attempts. Try again later.", 429);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("INVALID_JSON", "Invalid request body");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid credentials");
  }

  const email = parsed.data.email.trim().toLowerCase();
  const adminEmail = getAdminEmail();

  if (!adminEmail || email !== adminEmail) {
    await verifyAdminPassword(parsed.data.password);
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const valid = await verifyAdminPassword(parsed.data.password);
  if (!valid) {
    return fail("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const token = await createAdminSessionToken(email);
  const response = ok({
    email,
    role: "admin",
  });
  setSessionCookie(response, token);
  await writeAudit({
    action: "login",
    resource: "auth",
    metadata: { email, ip },
  });
  return response;
}
