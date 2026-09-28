import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectMongo } from "@/lib/admin/mongodb";
import { nextBusinessId } from "@/lib/admin/ids";
import { writeAudit } from "@/lib/admin/audit";
import { Customer } from "@/models/Customer";
import { Enquiry } from "@/models/Enquiry";
import { EVENT_TYPE } from "@/models/enums";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  message?: string;
};

const ACTOR = "website-enquiry";
const CUSTOMER_NOTES = "Received through enquiry form";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapEventType(raw: string): (typeof EVENT_TYPE)[number] {
  const match = EVENT_TYPE.find(
    (t) => t.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? "Other";
}

function parsePreferredDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const phone = body.phone?.trim() || "";
    const eventTypeRaw = body.eventType?.trim() || "";
    const eventDate = body.eventDate?.trim() || "";
    const message = body.message?.trim() || "";

    if (!name || !email || !eventTypeRaw || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    await connectMongo();

    const emailRegex = new RegExp(
      `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i",
    );
    let customer = await Customer.findOne({
      email: emailRegex,
      archivedAt: null,
    });

    if (!customer) {
      const customerId = await nextBusinessId("customer");
      customer = await Customer.create({
        customerId,
        fullName: name,
        email,
        mobileWhatsApp: phone,
        status: "Lead",
        leadSource: "Website",
        preferredContactMethod: phone ? "WhatsApp" : "Email",
        notes: CUSTOMER_NOTES,
        createdBy: ACTOR,
        updatedBy: ACTOR,
        archivedAt: null,
      });
      await writeAudit({
        action: "create",
        resource: "customers",
        resourceId: String(customer._id),
        businessId: customerId,
        actor: ACTOR,
        changes: { after: customer.toObject() },
      });
    } else {
      const updates: Record<string, unknown> = {
        updatedBy: ACTOR,
      };
      if (!customer.fullName && name) updates.fullName = name;
      if (phone && !customer.mobileWhatsApp) updates.mobileWhatsApp = phone;
      const existingNotes = String(customer.notes || "").trim();
      if (!existingNotes.toLowerCase().includes(CUSTOMER_NOTES.toLowerCase())) {
        updates.notes = existingNotes
          ? `${existingNotes}\n${CUSTOMER_NOTES}`
          : CUSTOMER_NOTES;
      }
      if (Object.keys(updates).length > 1) {
        Object.assign(customer, updates);
        await customer.save();
      }
    }

    const enquiryId = await nextBusinessId("enquiry");
    const preferredDate = parsePreferredDate(eventDate);
    const enquiry = await Enquiry.create({
      enquiryId,
      receivedOn: new Date(),
      customerId: customer.customerId,
      eventType: mapEventType(eventTypeRaw),
      occasionTitle: eventTypeRaw,
      ...(preferredDate ? { preferredDate } : {}),
      leadSource: "Website",
      stage: "New",
      conversationNotes: message,
      createdBy: ACTOR,
      updatedBy: ACTOR,
      archivedAt: null,
    });
    await writeAudit({
      action: "create",
      resource: "enquiries",
      resourceId: String(enquiry._id),
      businessId: enquiryId,
      actor: ACTOR,
      changes: { after: enquiry.toObject() },
    });

    // Email notification is best-effort; CRM rows are the source of truth.
    try {
      await sendEnquiryEmail({
        name,
        email,
        phone,
        eventType: eventTypeRaw,
        eventDate,
        message,
        customerId: String(customer.customerId),
        enquiryId,
      });
    } catch (error) {
      console.error("Contact form email failed (CRM saved):", error);
    }

    return NextResponse.json({
      ok: true,
      customerId: customer.customerId,
      enquiryId,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again later." },
      { status: 500 },
    );
  }
}

async function sendEnquiryEmail(input: {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  message: string;
  customerId: string;
  enquiryId: string;
}) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || user;
  const fromName = process.env.CONTACT_FROM_NAME || "Rajput Events Website";

  if (!user || !pass || !to) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `New enquiry from ${input.name} — ${input.eventType}`;

  const textBody = [
    "New enquiry from the Rajput Events website",
    "",
    `Customer ID: ${input.customerId}`,
    `Enquiry ID: ${input.enquiryId}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Event type: ${input.eventType}`,
    `Preferred date: ${input.eventDate || "Not provided"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const htmlBody = `
      <div style="font-family: Georgia, serif; color: #252833; line-height: 1.6;">
        <h2 style="color: #0B1736; margin-bottom: 8px;">New Enquiry — Rajput Events</h2>
        <p style="color: #C9A45C; margin-top: 0;">Website contact form</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Customer</td><td>${escapeHtml(input.customerId)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Enquiry</td><td>${escapeHtml(input.enquiryId)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Name</td><td>${escapeHtml(input.name)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email</td><td>${escapeHtml(input.email)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone</td><td>${escapeHtml(input.phone || "Not provided")}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Event type</td><td>${escapeHtml(input.eventType)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Preferred date</td><td>${escapeHtml(input.eventDate || "Not provided")}</td></tr>
        </table>
        <p style="margin-top: 20px; font-weight: bold;">Message</p>
        <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
      </div>
    `;

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to,
    replyTo: input.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
