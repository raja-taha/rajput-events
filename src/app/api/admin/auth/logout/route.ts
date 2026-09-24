import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { ok } from "@/lib/admin/api";

export async function POST() {
  await writeAudit({ action: "logout", resource: "auth" });
  const response = ok({ success: true });
  clearSessionCookie(response);
  return response;
}
