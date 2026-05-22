import type { Metadata } from "next";
import { WateringCalculatorForm } from "@/components/watering/WateringCalculatorForm";
import {
  getCitiesByCounty,
  SALT_LAKE_COUNTY_CITY_IDS,
} from "@/data/wateringRestrictions";
import { heroSectionClass, pageSectionClass } from "@/lib/ui";

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

const saltLakeCityNames = SALT_LAKE_COUNTY_CITY_IDS.map(
  (id) => getCitiesByCounty("salt-lake").find((c) => c.id === id)?.city,
).filter(Boolean);

export default function WateringRunTimesPage() {
  return (
    <main>
      <section
        className={heroSectionClass}
        style={{
          background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-medium-blue) 55%, var(--color-light-blue) 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-light-blue)] uppercase sm:text-sm">
            Storm Sprinklers · Utah
          </p>
          <h1 className="font-display mt-2 text-2xl leading-tight sm:mt-3 sm:text-4xl">
            Utah Sprinkler Watering Run Time Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base">
            Estimate how long to run your sprinkler zones based on your city,
            sprinkler type, and current watering restrictions.
          </p>
        </div>
      </section>

      <section className={pageSectionClass}>
        <p className="mb-6 text-sm leading-relaxed text-[var(--color-navy)]/75">
          <strong className="text-[var(--color-navy)]">Salt Lake County:</strong>{" "}
          {saltLakeCityNames.join(", ")} — each with links to official city or
          water-provider sources.
        </p>
        <WateringCalculatorForm />
        <p className="mt-6 rounded-lg border border-[var(--color-light-blue)] bg-white/80 p-3 text-xs leading-relaxed text-[var(--color-navy)]/70 sm:mt-8 sm:p-4">
          <strong className="text-[var(--color-navy)]">Disclaimer:</strong> This
          tool provides general irrigation scheduling guidance. Always follow your
          city, HOA, and water provider&apos;s current rules.
        </p>
      </section>
    </main>
  );
}
