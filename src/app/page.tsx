import Link from "next/link";
import { btnPrimaryClass, heroSectionClass } from "@/lib/ui";

export default function Home() {
  return (
    <main>
      <section
        className={`${heroSectionClass} sm:py-20`}
        style={{
          background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-medium-blue) 55%, var(--color-light-blue) 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-light-blue)] uppercase sm:text-sm">
            Storm Sprinklers · Utah
          </p>
          <h1 className="font-display mt-2 text-2xl leading-tight sm:mt-3 sm:text-4xl md:text-5xl">
            Sprinkler Runtime &amp; Program Tools
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
            Free calculators for Utah County and Salt Lake County homeowners —
            built around local watering rules and your landscape.
          </p>
          <Link
            href="/watering-run-times"
            className={`${btnPrimaryClass} mt-6 inline-flex sm:mt-8`}
            style={{ background: "var(--color-pink)" }}
          >
            Open Watering Run Time Calculator
          </Link>
          <p className="mt-3 text-xs font-medium sm:mt-4 sm:text-sm">
            Fast <span className="text-[var(--color-pink)]">|</span> Honest{" "}
            <span className="text-[var(--color-pink)]">|</span> Reliable
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
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
              className="rounded-xl border border-[var(--color-light-blue)] bg-white p-4 shadow-sm sm:p-5"
            >
              <h2 className="font-display text-[var(--color-navy)]">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-navy)]/75">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
