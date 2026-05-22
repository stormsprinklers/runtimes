import { CalculatorWizard } from "@/components/CalculatorWizard";

export default function Home() {
  return (
    <main>
      <section
        className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20"
        style={{
          background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-medium-blue) 55%, var(--color-light-blue) 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-4xl text-center text-white">
          <p className="text-sm font-semibold tracking-wide text-[var(--color-light-blue)] uppercase">
            Storm Sprinklers · Utah
          </p>
          <h1 className="font-display mt-3 text-3xl leading-tight sm:text-4xl md:text-5xl">
            Sprinkler Runtime &amp; Program Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Enter your lawn and system details to get zone runtimes and a weekly
            program tailored to your city&apos;s watering rules, drought stage,
            shade, slope, soil, and plants.
          </p>
          <p className="mt-3 text-sm font-medium">
            Fast <span className="text-[var(--color-pink)]">|</span> Honest{" "}
            <span className="text-[var(--color-pink)]">|</span> Reliable
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <CalculatorWizard />
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Local rules",
              text: "Select your Utah or Salt Lake County city for typical allowed watering days.",
            },
            {
              title: "Your landscape",
              text: "Shade, slope, soil, vegetation, and head type all adjust how long each zone should run.",
            },
            {
              title: "Smarter watering",
              text: "Cycle-soak on slopes, efficiency fixes, and drought reductions built into every recommendation.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-[var(--color-light-blue)] bg-white p-5 shadow-sm"
            >
              <h3 className="font-display text-[var(--color-navy)]">{card.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-navy)]/75">{card.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
