import { bookNowUrl } from "@/lib/navigation";
import { weekdayLabels } from "@/data/wateringRestrictions";
import type { WateringCalculatorResult } from "@/types/watering-calculator";
import { RestrictionBadge } from "./RestrictionBadge";

interface WateringScheduleResultsProps {
  result: WateringCalculatorResult;
  onReset: () => void;
}

export function WateringScheduleResults({
  result,
  onReset,
}: WateringScheduleResultsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl text-[var(--color-navy)]">
            Recommended Schedule
          </h2>
          <RestrictionBadge status={result.badge} label={result.badgeLabel} />
        </div>
        <p className="mt-2 text-sm text-[var(--color-navy)]/80">
          {result.cityName} · {result.daysPerWeek} day
          {result.daysPerWeek !== 1 ? "s" : ""} per week
          {result.baseDaysFromSeason !== result.daysPerWeek &&
            ` (season base: ${result.baseDaysFromSeason})`}
        </p>
        {result.wateringDays.length > 0 ? (
          <p className="mt-3 text-lg font-semibold text-[var(--color-navy)]">
            {result.wateringDays.map((d) => weekdayLabels[d]).join(", ")}
          </p>
        ) : (
          <p className="mt-3 font-semibold text-[var(--color-pink)]">
            No watering days recommended for this month under current restrictions.
          </p>
        )}
        <p className="mt-2 text-sm text-[var(--color-navy)]">
          Start time: <strong>{result.recommendedStartTime}</strong>
          {result.timeRestriction && (
            <span className="block mt-1 text-[var(--color-navy)]/75">
              {result.timeRestriction}
            </span>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl text-[var(--color-navy)]">
          Runtime Per Zone
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Total per watering day
            </dt>
            <dd className="text-2xl font-bold text-[var(--color-navy)]">
              {result.totalMinutes} min
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Per cycle
            </dt>
            <dd className="text-2xl font-bold text-[var(--color-navy)]">
              {result.minutesPerCycle} min
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/50 p-6">
        <h3 className="font-display text-xl text-[var(--color-navy)]">
          Cycle &amp; Soak Plan
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Cycles
            </dt>
            <dd className="text-xl font-bold text-[var(--color-navy)]">
              {result.cycles}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Minutes / cycle
            </dt>
            <dd className="text-xl font-bold text-[var(--color-navy)]">
              {result.minutesPerCycle}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Soak between
            </dt>
            <dd className="text-xl font-bold text-[var(--color-navy)]">
              {result.soakMinutes > 0 ? `${result.soakMinutes} min` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl text-[var(--color-navy)]">
          Local Watering Rule
        </h3>
        <p className="mt-2 text-sm text-[var(--color-navy)]">
          {result.restrictionText}
        </p>
        <p className="mt-3 text-sm text-[var(--color-navy)]/80">
          {result.recommendationText}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl text-[var(--color-navy)]">Source</h3>
        <a
          href={result.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-semibold text-[var(--color-medium-blue)] underline"
        >
          {result.sourceLabel} →
        </a>
        {result.stateGuideUrl && result.stateGuideUrl !== result.sourceUrl && (
          <a
            href={result.stateGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block font-semibold text-[var(--color-medium-blue)] underline"
          >
            Utah Weekly Lawn Watering Guide →
          </a>
        )}
      </div>

      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <div
          className="rounded-xl border-l-4 p-5"
          style={{
            borderColor: "var(--color-pink)",
            background: "color-mix(in srgb, var(--color-pink) 10%, white)",
          }}
        >
          <h3 className="font-display text-lg text-[var(--color-navy)]">
            Important Notes
          </h3>
          {result.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium text-[var(--color-navy)]">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          {result.notes.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-[var(--color-navy)]/85">
              {result.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border-2 border-[var(--color-medium-blue)] px-6 py-2.5 font-semibold text-[var(--color-navy)] hover:bg-[var(--color-light-blue)]/50"
        >
          Start Over
        </button>
        <a
          href={bookNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-6 py-2.5 font-bold text-white hover:opacity-90"
          style={{ background: "var(--color-pink)" }}
        >
          Book a Tune-Up
        </a>
      </div>
    </div>
  );
}
