import type { Metadata } from "next";
import { WateringCalculatorForm } from "@/components/watering/WateringCalculatorForm";

export const metadata: Metadata = {
  title: "Utah Sprinkler Watering Run Time Calculator | Storm Sprinklers",
  description:
    "Estimate sprinkler zone runtimes and watering days by city, sprinkler type, and current Utah watering restrictions in Utah and Salt Lake County.",
  alternates: {
    canonical: "/watering-run-times",
  },
  openGraph: {
    title: "Utah Sprinkler Watering Run Time Calculator",
    description:
      "Free tool to estimate how long to run your sprinkler zones based on your city and local watering rules.",
    siteName: "Storm Sprinklers",
  },
};

export default function WateringRunTimesPage() {
  return (
    <main>
      <section
        className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16"
        style={{
          background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-medium-blue) 55%, var(--color-light-blue) 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <p className="text-sm font-semibold tracking-wide text-[var(--color-light-blue)] uppercase">
            Storm Sprinklers · Utah
          </p>
          <h1 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
            Utah Sprinkler Watering Run Time Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90">
            Use this calculator to estimate how long to run your sprinkler zones
            based on your city, sprinkler type, and current watering restrictions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <WateringCalculatorForm />
        <p className="mt-8 rounded-lg border border-[var(--color-light-blue)] bg-white/80 p-4 text-xs text-[var(--color-navy)]/70">
          <strong className="text-[var(--color-navy)]">Disclaimer:</strong> This
          tool provides general irrigation scheduling guidance. Always follow your
          city, HOA, and water provider&apos;s current rules.
        </p>
      </section>
    </main>
  );
}
