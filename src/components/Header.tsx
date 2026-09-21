"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#approach", label: "Approach" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md border-b border-gold/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <Link
          href="#home"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.jpg"
            alt="Rajput Events"
            width={52}
            height={52}
            className="h-11 w-11 rounded-full object-cover ring-1 ring-gold/50 transition-transform duration-500 group-hover:scale-[1.03] md:h-12 md:w-12"
            priority
          />
          <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] text-gold md:text-base">
            RAJPUT EVENTS
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-body)] text-xs tracking-[0.16em] uppercase text-ivory/80 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            className="border border-gold/70 px-4 py-2 font-[family-name:var(--font-body)] text-xs tracking-[0.16em] uppercase text-gold transition-colors hover:bg-gold hover:text-navy"
          >
            Enquire
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-px w-6 bg-gold transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-gold transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-gold transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-navy-deep/98 transition-opacity duration-400 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-[family-name:var(--font-display)] text-2xl tracking-[0.12em] text-ivory transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 border border-gold px-6 py-3 font-[family-name:var(--font-body)] text-sm tracking-[0.18em] uppercase text-gold"
          >
            Enquire
          </Link>
        </nav>
      </div>
    </header>
  );
}
