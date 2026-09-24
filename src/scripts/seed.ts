import { connectMongo } from "../lib/admin/mongodb";
import { Service } from "../models/Service";
import { Task } from "../models/Task";
import { Document } from "../models/Document";
import { MarketingContent } from "../models/MarketingContent";
import { Setting } from "../models/Setting";
import { ensureCounterAtLeast } from "../lib/admin/ids";
import { writeAudit } from "../lib/admin/audit";

async function upsertById(
  model: { findOneAndUpdate: Function },
  idField: string,
  id: string,
  data: Record<string, unknown>,
) {
  await model.findOneAndUpdate(
    { [idField]: id },
    { $set: { ...data, [idField]: id }, $setOnInsert: { createdBy: "seed" } },
    { upsert: true, new: true },
  );
}

async function seed() {
  await connectMongo();

  const settings = {
    businessName: "Rajput Events",
    businessEmail: "rajputevents04@gmail.com",
    serviceArea: "Rawalpindi / Islamabad",
    currency: "PKR",
    timezone: "Asia/Karachi",
    launchNote: "Small private weekend events",
    advanceSuggestion: "60% (planning reference only)",
    balanceSuggestion: "48 hours before the event (planning reference only)",
    serviceFocus: "Simple decor and coordination",
  };

  for (const [key, value] of Object.entries(settings)) {
    await Setting.findOneAndUpdate(
      { key },
      { key, value, updatedBy: "seed" },
      { upsert: true },
    );
  }

  const services = [
    {
      serviceId: "RE-SVC-001",
      servicePackageName: "Essential",
      categoryLevel: "Package level",
      pricingUnit: "Per event",
      status: "Draft",
    },
    {
      serviceId: "RE-SVC-002",
      servicePackageName: "Signature",
      categoryLevel: "Package level",
      pricingUnit: "Per event",
      status: "Draft",
    },
    {
      serviceId: "RE-SVC-003",
      servicePackageName: "Premium",
      categoryLevel: "Package level",
      pricingUnit: "Per event",
      status: "Draft",
    },
    {
      serviceId: "RE-SVC-004",
      servicePackageName: "Custom",
      categoryLevel: "Package level",
      pricingUnit: "Per event",
      status: "Draft",
      pricingNotes: "Write a tailored scope and quotation.",
    },
    {
      serviceId: "RE-SVC-005",
      servicePackageName: "Weekend Mini Celebration",
      categoryLevel: "Launch concept",
      pricingUnit: "Per event",
      status: "Draft",
      includedScope:
        "Simple decor for a small private weekend event. Final scope to be agreed.",
      excludedOptionalItems:
        "Venue, food, photography and transport unless expressly included.",
      pricingNotes:
        "Earlier planning range: PKR 50,000–65,000. Not a confirmed price.",
    },
  ];

  for (const s of services) {
    await upsertById(Service, "serviceId", s.serviceId, s);
  }
  await ensureCounterAtLeast("service", 5);

  const businessTasks = [
    "Confirm business phone, email and operating address",
    "Review registration and invoicing requirements with a qualified adviser",
    "Set up and verify dedicated business payment details",
    "Prepare quote, client agreement, invoice and receipt numbering",
    "Complete Google Business, Facebook and WhatsApp profiles",
    "Build vendor shortlist and check two options for critical services",
    "Cost and define the first weekend package",
    "Create event folders and restricted document access",
  ];

  for (let i = 0; i < businessTasks.length; i += 1) {
    const taskId = `RE-TSK-${String(i + 1).padStart(3, "0")}`;
    await upsertById(Task, "taskId", taskId, {
      taskId,
      scope: "BUSINESS",
      isTemplate: false,
      phase: "Business setup",
      taskActivityCue: businessTasks[i],
      status: "To do",
      priority: "Normal",
    });
  }
  await ensureCounterAtLeast("task", 8);

  const templates = [
    ["TPL-001", "Qualification", "Collect the customer brief, date, guest count, budget and decision maker"],
    ["TPL-002", "Qualification", "Check service area, available time and manageable event scope"],
    ["TPL-003", "Qualification", "Inspect venue or obtain reliable access and dimension evidence"],
    ["TPL-004", "Qualification", "Get supplier prices including delivery, setup, collection and overtime"],
    ["TPL-005", "Booking", "Send quotation with scope, exclusions, validity and payment schedule"],
    ["TPL-006", "Booking", "Record written acceptance and signed client agreement"],
    ["TPL-007", "Booking", "Verify cleared booking advance and issue receipt"],
    ["TPL-008", "Booking", "Confirm venue and critical supplier availability"],
  ] as const;

  for (const [taskId, phase, cue] of templates) {
    await upsertById(Task, "taskId", taskId, {
      taskId,
      scope: "TEMPLATE",
      isTemplate: true,
      phase,
      taskActivityCue: cue,
      status: "Template",
      priority: "Normal",
    });
  }

  const docs = [
    ["RE-DOC-001", "Business", "Business registration / tax classification review"],
    ["RE-DOC-002", "Business", "Dedicated bank details verification"],
    ["RE-DOC-003", "Business", "Client agreement and invoice wording review"],
    ["RE-DOC-004", "Business", "Relevant premises / local approvals review"],
  ] as const;

  for (const [documentId, scope, documentCheck] of docs) {
    await upsertById(Document, "documentId", documentId, {
      documentId,
      scope,
      documentCheck,
      applicability: "To confirm",
      status: "To check",
      notesTemplateFilename:
        "Confirm applicability, responsible owner and evidence before marking complete.",
    });
  }
  await ensureCounterAtLeast("document", 4);

  const marketing = [
    [
      "RE-MKT-001",
      "Google Business",
      "Complete service description, service area, contact information and cover image.",
    ],
    [
      "RE-MKT-002",
      "Facebook",
      "Complete page information and upload the Rajput Events navy-and-gold cover.",
    ],
    [
      "RE-MKT-003",
      "WhatsApp Business",
      "Complete business profile, greeting, enquiry questions and approved service catalogue.",
    ],
  ] as const;

  for (const [contentId, platform, caption] of marketing) {
    await upsertById(MarketingContent, "contentId", contentId, {
      contentId,
      platform,
      contentType: "Business profile",
      postTopicCaption: caption,
      status: "Draft",
    });
  }
  await ensureCounterAtLeast("marketing", 3);

  await writeAudit({ action: "seed", resource: "system" });
  console.log("Seed completed successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
