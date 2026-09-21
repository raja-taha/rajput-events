import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const phone = body.phone?.trim() || "";
    const eventType = body.eventType?.trim() || "";
    const eventDate = body.eventDate?.trim() || "";
    const message = body.message?.trim() || "";

    if (!name || !email || !eventType || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.CONTACT_TO || user;
    const fromName = process.env.CONTACT_FROM_NAME || "Rajput Events Website";

    if (!user || !pass || !to) {
      return NextResponse.json(
        {
          error:
            "Email service is not configured. Please set SMTP credentials in .env.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const subject = `New enquiry from ${name} — ${eventType}`;

    const textBody = [
      "New enquiry from the Rajput Events website",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Event type: ${eventType}`,
      `Preferred date: ${eventDate || "Not provided"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const htmlBody = `
      <div style="font-family: Georgia, serif; color: #252833; line-height: 1.6;">
        <h2 style="color: #0B1736; margin-bottom: 8px;">New Enquiry — Rajput Events</h2>
        <p style="color: #C9A45C; margin-top: 0;">Website contact form</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone</td><td>${escapeHtml(phone || "Not provided")}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Event type</td><td>${escapeHtml(eventType)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Preferred date</td><td>${escapeHtml(eventDate || "Not provided")}</td></tr>
        </table>
        <p style="margin-top: 20px; font-weight: bold;">Message</p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again later." },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
