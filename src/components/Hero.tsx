import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-svh items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#122045_0%,_#0B1736_55%,_#070f24_100%)]"
        aria-hidden
      />
      <div
        className="animate-soft-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(201,164,92,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A45C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-16 pt-28 text-center md:px-8 md:pt-32">
        <div className="animate-logo-settle mb-8 md:mb-10">
          <Image
            src="/images/logo.jpg"
            alt="Rajput Events emblem"
            width={280}
            height={280}
            priority
            className="h-44 w-44 rounded-full object-cover ring-1 ring-gold/45 md:h-56 md:w-56"
          />
        </div>

        <p className="animate-fade-up font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-gold md:text-sm">
          RAJPUT EVENTS
        </p>

        <h1 className="animate-fade-up-delay-1 mt-5 max-w-2xl font-[family-name:var(--font-display)] text-3xl leading-snug tracking-wide text-ivory sm:text-4xl md:text-5xl md:leading-tight">
          Every Occasion, Beautifully Orchestrated.
        </h1>

        <p className="animate-fade-up-delay-2 mt-5 max-w-lg font-[family-name:var(--font-body)] text-sm leading-relaxed text-ivory/70 md:text-base">
          Elegant planning for weddings and corporate celebrations — dependable,
          organized, and warmly welcoming.
        </p>

        <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="#contact"
            className="min-w-[11rem] border border-gold bg-gold px-7 py-3.5 font-[family-name:var(--font-body)] text-xs tracking-[0.18em] uppercase text-navy transition-colors hover:bg-gold-soft"
          >
            Plan Your Event
          </Link>
          <Link
            href="#services"
            className="min-w-[11rem] border border-gold/60 px-7 py-3.5 font-[family-name:var(--font-body)] text-xs tracking-[0.18em] uppercase text-gold transition-colors hover:border-gold hover:bg-gold/10"
          >
            Our Services
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block" aria-hidden>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-gold/35 p-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold/80" />
        </div>
      </div>
    </section>
  );
}
