"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      eventType: String(formData.get("eventType") || "").trim(),
      eventDate: String(formData.get("eventDate") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("Thank you. We will be in touch shortly.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Unable to send right now. Please email us directly.");
    }
  }

  return (
    <section id="contact" className="relative bg-navy">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.28em] text-gold">
              CONTACT
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-wide text-ivory md:text-4xl">
              Begin Your Enquiry
            </h2>
            <div className="mt-4 h-px w-14 bg-gold" />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70 md:text-base">
              Tell us a little about your occasion. We respond personally and
              will guide the next steps with care.
            </p>

            <div className="mt-10 space-y-5 text-sm text-ivory/75">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] text-gold">
                  EMAIL
                </p>
                <a
                  href="mailto:rajputevents04@gmail.com"
                  className="mt-1 inline-block transition-colors hover:text-gold"
                >
                  rajputevents04@gmail.com
                </a>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] text-gold">
                  SOCIAL
                </p>
                <a
                  href="https://instagram.com/rajputevents"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block transition-colors hover:text-gold"
                >
                  @rajputevents
                </a>
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.18em] text-gold">
                  WHATSAPP
                </p>
                <p className="mt-1">Rajput Events | Planning &amp; Management</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-gold/25 bg-navy-soft/40 p-6 md:p-8"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Full Name *
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="input-field input-field-dark"
                  placeholder="Your name"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Email *
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field input-field-dark"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Phone
                </span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="input-field input-field-dark"
                  placeholder="+92 ..."
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Event Type *
                </span>
                <select
                  name="eventType"
                  required
                  defaultValue=""
                  className="input-field input-field-dark appearance-none"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Private Celebration">Private Celebration</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Preferred Date
                </span>
                <input
                  name="eventDate"
                  type="date"
                  className="input-field input-field-dark"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs tracking-[0.14em] uppercase text-ivory/60">
                  Message *
                </span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="input-field input-field-dark resize-y"
                  placeholder="Share your vision, guest count, or any details that matter..."
                />
              </label>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "loading"}
                className="border border-gold bg-gold px-8 py-3.5 font-[family-name:var(--font-body)] text-xs tracking-[0.18em] uppercase text-navy transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send Enquiry"}
              </button>

              {message ? (
                <p
                  role="status"
                  className={`text-sm ${
                    status === "success" ? "text-gold" : "text-red-300"
                  }`}
                >
                  {message}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
