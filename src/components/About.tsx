export function About() {
  return (
    <section id="about" className="relative bg-ivory text-charcoal">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.28em] text-gold">
            ABOUT US
          </p>
          <h2 className="gold-underline mt-4 font-[family-name:var(--font-display)] text-3xl tracking-wide text-navy md:text-4xl">
            Celebrations, Carefully Conducted
          </h2>
          <p className="mt-10 font-[family-name:var(--font-body)] text-base leading-relaxed text-charcoal/80 md:text-lg">
            Rajput Events is built on a simple promise: every occasion deserves
            to feel intentional. From intimate weddings to polished corporate
            gatherings, we plan with calm precision and host with genuine
            warmth — so you can be present for the moments that matter.
          </p>
          <p className="mt-6 font-[family-name:var(--font-serif)] text-xl italic leading-relaxed text-navy/80 md:text-2xl">
            Celebrations Planned. Memories Perfected.
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-navy/10 pt-14 md:grid-cols-3 md:gap-8">
          {[
            {
              title: "Elegant",
              copy: "Refined aesthetics and thoughtful details that honour your vision without excess.",
            },
            {
              title: "Dependable",
              copy: "Clear timelines, trusted vendors, and steady communication from first enquiry to farewell.",
            },
            {
              title: "Welcoming",
              copy: "A calm, organized presence that puts guests at ease and keeps hosts confident.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center md:text-left">
              <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-navy">
                {item.title}
              </h3>
              <div className="mx-auto mt-3 h-px w-10 bg-gold md:mx-0" />
              <p className="mt-4 text-sm leading-relaxed text-charcoal/75">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
