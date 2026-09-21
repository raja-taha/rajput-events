const steps = [
  {
    step: "01",
    title: "Discover",
    copy: "We listen — your vision, guests, budget, and non-negotiables — then shape a clear brief together.",
  },
  {
    step: "02",
    title: "Design",
    copy: "Concept, timeline, and vendor shortlist take form so every decision feels considered and calm.",
  },
  {
    step: "03",
    title: "Coordinate",
    copy: "We manage schedules, confirmations, and on-site flow so the day unfolds exactly as planned.",
  },
  {
    step: "04",
    title: "Deliver",
    copy: "From first arrival to final farewell, we stay present — quietly ensuring every detail lands.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="relative bg-ivory text-charcoal">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.28em] text-gold">
            OUR APPROACH
          </p>
          <h2 className="gold-underline mt-4 font-[family-name:var(--font-display)] text-3xl tracking-wide text-navy md:text-4xl">
            How We Work
          </h2>
          <p className="mt-10 text-sm leading-relaxed text-charcoal/75 md:text-base">
            A clear process keeps celebrations graceful. Four stages, one
            standard — organized excellence with a human touch.
          </p>
        </div>

        <ol className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {steps.map((item) => (
            <li key={item.step} className="relative">
              <p className="font-[family-name:var(--font-display)] text-4xl tracking-wider text-gold/35">
                {item.step}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-wide text-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                {item.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
