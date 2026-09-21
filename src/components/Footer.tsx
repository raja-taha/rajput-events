import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-navy-deep">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Rajput Events"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-gold/40"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] text-gold">
                RAJPUT EVENTS
              </p>
              <p className="mt-1 font-[family-name:var(--font-serif)] text-base italic text-ivory/70">
                Every Occasion, Beautifully Orchestrated.
              </p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ivory/65">
            Elegant, dependable planning for weddings and corporate occasions —
            organized with care, delivered with warmth.
          </p>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] text-gold">
            EXPLORE
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/75">
            <li>
              <Link href="#about" className="hover:text-gold transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link
                href="#services"
                className="hover:text-gold transition-colors"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="#approach"
                className="hover:text-gold transition-colors"
              >
                Approach
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="hover:text-gold transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] text-gold">
            CONNECT
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/75">
            <li>
              <a
                href="mailto:rajputevents04@gmail.com"
                className="hover:text-gold transition-colors"
              >
                rajputevents04@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/rajputevents"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                Instagram @rajputevents
              </a>
            </li>
            <li>
              <span className="text-ivory/55">
                WhatsApp: Rajput Events | Planning &amp; Management
              </span>
            </li>
            <li>
              <a
                href="https://rajputevents.com"
                className="hover:text-gold transition-colors"
              >
                rajputevents.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-center text-xs tracking-wide text-ivory/45 md:flex-row md:px-8 md:text-left">
          <p>
            © {new Date().getFullYear()} Rajput Events. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-serif)] italic">
            Celebrations Planned. Memories Perfected.
          </p>
        </div>
      </div>
    </footer>
  );
}
