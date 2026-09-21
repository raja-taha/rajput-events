const services = [
  {
    title: "Weddings",
    description:
      "Full-service wedding planning and day-of coordination — ceremonies, receptions, and multi-day celebrations with cultural sensitivity and quiet control.",
  },
  {
    title: "Corporate Events",
    description:
      "Conferences, launches, galas, and team gatherings planned with professional polish, clear logistics, and a welcoming guest experience.",
  },
  {
    title: "Private Celebrations",
    description:
      "Anniversaries, engagements, milestone birthdays, and intimate dinners designed to feel personal, warm, and beautifully composed.",
  },
  {
    title: "Venue & Vendor Management",
    description:
      "Trusted sourcing, negotiation, and on-site oversight so every supplier arrives aligned to your timeline and standard.",
  },
  {
    title: "Decor & Styling Direction",
    description:
      "Cohesive visual direction — florals, lighting, tablescapes, and spatial flow — that matches your story and setting.",
  },
  {
    title: "Guest Experience",
    description:
      "From invitations to hospitality cues, we shape a seamless journey for every guest who walks through the door.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative bg-navy">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.28em] text-gold">
            SERVICES
          </p>
          <h2 className="gold-underline mt-4 font-[family-name:var(--font-display)] text-3xl tracking-wide text-ivory md:text-4xl">
            What We Orchestrate
          </h2>
          <p className="mt-10 text-sm leading-relaxed text-ivory/70 md:text-base">
            Whether you need end-to-end planning or focused coordination, we
            bring structure, taste, and a steady hand to every brief.
          </p>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article key={service.title} className="group">
              <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] text-gold/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl tracking-wide text-ivory transition-colors group-hover:text-gold">
                {service.title}
              </h3>
              <div className="mt-3 h-px w-12 bg-gold/50 transition-all duration-500 group-hover:w-20" />
              <p className="mt-4 text-sm leading-relaxed text-ivory/65">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
