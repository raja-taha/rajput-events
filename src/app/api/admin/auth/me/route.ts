import { getAdminSession } from "@/lib/admin/auth";
import { ok, unauthorized } from "@/lib/admin/api";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  return ok({ email: session.email, role: session.role });
}
