import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { fail, ok, unauthorized } from "@/lib/admin/api";
import { Setting } from "@/models/Setting";
import { writeAudit } from "@/lib/admin/audit";

const DEFAULTS: Record<string, string> = {
  businessName: "Rajput Events",
  businessEmail: "rajputevents04@gmail.com",
  businessWhatsApp: "",
  businessAddress: "",
  serviceArea: "Rawalpindi / Islamabad",
  bankAccountTitle: "",
  bankIban: "",
  launchNote: "Small private weekend events",
  advanceSuggestion: "60% (planning reference only)",
  balanceSuggestion: "48 hours before the event (planning reference only)",
  serviceFocus: "Simple decor and coordination",
  currency: "PKR",
  timezone: "Asia/Karachi",
};

async function loadSettings() {
  const rows = await Setting.find({}).lean();
  const map = { ...DEFAULTS };
  for (const row of rows) {
    map[row.key] = String(row.value ?? "");
  }
  return map;
}

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();
  const data = await loadSettings();
  return ok({ data });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Invalid request body");
  }

  for (const [key, value] of Object.entries(body)) {
    if (!(key in DEFAULTS) && key !== "currency" && key !== "timezone") continue;
    await Setting.findOneAndUpdate(
      { key },
      {
        key,
        value: String(value ?? ""),
        updatedBy: session.email,
        createdBy: session.email,
      },
      { upsert: true, new: true },
    );
  }

  await writeAudit({
    action: "update",
    resource: "settings",
    actor: session.email,
    changes: { after: body },
  });

  return ok({ data: await loadSettings() });
}
