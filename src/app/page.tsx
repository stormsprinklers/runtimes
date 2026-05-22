import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section
        className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
        style={{
          background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-medium-blue) 55%, var(--color-light-blue) 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <p className="text-sm font-semibold tracking-wide text-[var(--color-light-blue)] uppercase">
            Storm Sprinklers · Utah
          </p>
          <h1 className="font-display mt-3 text-3xl leading-tight sm:text-4xl md:text-5xl">
            Sprinkler Runtime &amp; Program Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Free calculators for Utah County and Salt Lake County homeowners —
            built around local watering rules and your landscape.
          </p>
          <Link
            href="/watering-run-times"
            className="mt-8 inline-block rounded-full px-8 py-3.5 text-base font-bold text-white transition hover:opacity-90"
            style={{ background: "var(--color-pink)" }}
          >
            Open Watering Run Time Calculator
          </Link>
          <p className="mt-4 text-sm font-medium">
            Fast <span className="text-[var(--color-pink)]">|</span> Honest{" "}
            <span className="text-[var(--color-pink)]">|</span> Reliable
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Local rules",
              text: "40+ cities with address-based schedules, time windows, and links to official sources.",
            },
            {
              title: "Your landscape",
              text: "Sprinkler type, sun, soil, slope, and season adjust runtimes and cycle-soak.",
            },
            {
              title: "Smarter watering",
              text: "Seasonal day limits plus city caps — aligned with Utah drought guidance.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-[var(--color-light-blue)] bg-white p-5 shadow-sm"
            >
              <h2 className="font-display text-[var(--color-navy)]">{card.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-navy)]/75">{card.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
