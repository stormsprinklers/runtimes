"use client";

import { bookNowUrl } from "@/lib/navigation";
import type { ControllerCalculatorResult } from "@/types/watering-calculator";
import { ProgramScheduleCard } from "./ProgramScheduleCard";
import { RestrictionBadge } from "./RestrictionBadge";
import { RunTimeline } from "./RunTimeline";

interface WateringScheduleResultsProps {
  result: ControllerCalculatorResult;
  onReset: () => void;
}

export function WateringScheduleResults({
  result,
  onReset,
}: WateringScheduleResultsProps) {
  const primaryProgram = result.programs[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl text-[var(--color-navy)]">
            Controller Program Recommendation
          </h2>
          <RestrictionBadge status={result.badge} label={result.badgeLabel} />
        </div>
        <p className="mt-2 text-sm text-[var(--color-navy)]/80">
          {result.cityName} · {result.programs.length} program
          {result.programs.length !== 1 ? "s" : ""} · {result.stationOrder.length}{" "}
          station{result.stationOrder.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-4 rounded-lg bg-[var(--color-light-grey)]/80 p-4 text-sm">
          <p className="font-semibold text-[var(--color-navy)]">Local watering rule</p>
          <p className="mt-1 text-[var(--color-navy)]/80">
            {result.restrictionText}
          </p>
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
      </div>

      {result.hydrozoneWarnings.length > 0 && (
        <div
          className="rounded-xl border-l-4 p-4"
          style={{
            borderColor: "var(--color-medium-blue)",
            background: "color-mix(in srgb, var(--color-medium-blue) 10%, white)",
          }}
        >
          <h3 className="font-display text-lg text-[var(--color-navy)]">
            Hydrozoning tips
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-navy)]">
            {result.hydrozoneWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {result.programs.map((program) => (
        <ProgramScheduleCard key={program.programId} program={program} />
      ))}

      {primaryProgram && result.timeline.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl text-[var(--color-navy)]">
            Run order — {primaryProgram.label}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-navy)]/70">
            What happens after the first start time ({primaryProgram.primaryStartTime}
            ) on a watering day:
          </p>
          <div className="mt-4">
            <RunTimeline entries={result.timeline} />
          </div>
        </div>
      )}

      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <div className="rounded-xl bg-[var(--color-light-blue)]/40 p-5">
          <h3 className="font-display text-lg text-[var(--color-navy)]">
            Important notes
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
