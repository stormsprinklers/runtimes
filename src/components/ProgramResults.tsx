import { bookNowUrl } from "@/lib/navigation";
import { weekdayLabels } from "@/lib/utah-cities";
import type { ProgramRecommendation } from "@/types/calculator";

interface ProgramResultsProps {
  program: ProgramRecommendation;
  onReset: () => void;
}

export function ProgramResults({ program, onReset }: ProgramResultsProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-[var(--color-navy)]">
          Your Program Recommendation
        </h2>
        <p className="mt-2 text-[var(--color-navy)]/80">
          {program.cityName} · up to {program.maxWateringDaysPerWeek} days/week
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-navy)]">
          {program.summary.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-[var(--color-medium-blue)]">✓</span>
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-medium text-[var(--color-navy)]">
          Allowed days:{" "}
          {program.allowedDays
            .map((d) => weekdayLabels[d] ?? d)
            .join(", ")}
        </p>
      </div>

      {program.warnings.length > 0 && (
        <div
          className="rounded-xl border-l-4 p-4"
          style={{
            borderColor: "var(--color-pink)",
            background: "color-mix(in srgb, var(--color-pink) 12%, white)",
          }}
        >
          <h3 className="font-semibold text-[var(--color-navy)]">Important</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-navy)]">
            {program.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-display text-xl text-[var(--color-navy)]">
          Zone Schedule
        </h3>
        {program.zones.map((zone) => (
          <article
            key={zone.zoneId}
            className="rounded-xl border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/50 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-display text-lg text-[var(--color-navy)]">
                {zone.zoneName}
              </h4>
              <span className="rounded-full bg-[var(--color-medium-blue)] px-3 py-1 text-xs font-bold text-white">
                ~{zone.weeklyWaterInches}&quot; / week
              </span>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
                  Runtime
                </dt>
                <dd className="text-lg font-bold text-[var(--color-navy)]">
                  {zone.runtimeMinutes} min
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
                  Cycles / day
                </dt>
                <dd className="text-lg font-bold text-[var(--color-navy)]">
                  {zone.cyclesPerDay}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
                  Soak between
                </dt>
                <dd className="text-lg font-bold text-[var(--color-navy)]">
                  {zone.soakMinutesBetweenCycles > 0
                    ? `${zone.soakMinutesBetweenCycles} min`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
                  Days / week
                </dt>
                <dd className="text-lg font-bold text-[var(--color-navy)]">
                  {zone.daysPerWeek}
                </dd>
              </div>
            </dl>
            {zone.notes.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-[var(--color-navy)]/80">
                {zone.notes.map((n) => (
                  <li key={n}>• {n}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-xl bg-[var(--color-light-blue)]/40 p-5">
        <h3 className="font-display text-lg text-[var(--color-navy)]">Pro Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-navy)]">
          {program.tips.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border-2 border-[var(--color-medium-blue)] px-6 py-2.5 font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-light-blue)]/50"
        >
          Start Over
        </button>
        <a
          href={bookNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-6 py-2.5 font-bold text-white transition hover:opacity-90"
          style={{ background: "var(--color-pink)" }}
        >
          Book a Tune-Up
        </a>
      </div>
    </div>
  );
}
