"use client";

import { bookNowUrl } from "@/lib/navigation";
import {
  actionBarClass,
  btnPrimaryClass,
  btnSecondaryClass,
  cardShellClass,
} from "@/lib/ui";
import type { ControllerCalculatorResult } from "@/types/watering-calculator";
import { ExportPdfButton } from "./ExportPdfButton";
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
    <div className="space-y-5 sm:space-y-6">
      <div className={cardShellClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <h2 className="font-display text-xl leading-tight text-[var(--color-navy)] sm:text-2xl">
            Controller Program Recommendation
          </h2>
          <RestrictionBadge status={result.badge} label={result.badgeLabel} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-navy)]/80">
          {result.cityName} · {result.programs.length} program
          {result.programs.length !== 1 ? "s" : ""} · {result.stationOrder.length}{" "}
          station{result.stationOrder.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-4 rounded-lg bg-[var(--color-light-grey)]/80 p-3 text-sm sm:p-4">
          <p className="font-semibold text-[var(--color-navy)]">Local watering rule</p>
          <p className="mt-1 leading-relaxed text-[var(--color-navy)]/80">
            {result.restrictionText}
          </p>
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-anywhere mt-2 inline-block font-semibold text-[var(--color-medium-blue)] underline"
          >
            {result.sourceLabel} →
          </a>
          {result.stateGuideUrl && result.stateGuideUrl !== result.sourceUrl && (
            <a
              href={result.stateGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-anywhere mt-2 block font-semibold text-[var(--color-medium-blue)] underline"
            >
              Utah Weekly Lawn Watering Guide →
            </a>
          )}
        </div>
      </div>

      {result.hydrozoneWarnings.length > 0 && (
        <div
          className="rounded-xl border-l-4 p-3 sm:p-4"
          style={{
            borderColor: "var(--color-medium-blue)",
            background: "color-mix(in srgb, var(--color-medium-blue) 10%, white)",
          }}
        >
          <h3 className="font-display text-base text-[var(--color-navy)] sm:text-lg">
            Hydrozoning tips
          </h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-navy)]">
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
        <div className={cardShellClass}>
          <h3 className="font-display text-lg text-[var(--color-navy)] sm:text-xl">
            Run order — {primaryProgram.label}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-navy)]/70">
            After the first start time ({primaryProgram.primaryStartTime}) on a
            watering day:
          </p>
          <div className="mt-4">
            <RunTimeline entries={result.timeline} />
          </div>
        </div>
      )}

      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <div className="rounded-xl bg-[var(--color-light-blue)]/40 p-4 sm:p-5">
          <h3 className="font-display text-base text-[var(--color-navy)] sm:text-lg">
            Important notes
          </h3>
          {result.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-[var(--color-navy)]">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          {result.notes.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-navy)]/85">
              {result.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className={`${actionBarClass} safe-bottom`}>
        <ExportPdfButton result={result} />
        <button
          type="button"
          onClick={onReset}
          className={`${btnSecondaryClass} border-[var(--color-medium-blue)] hover:bg-[var(--color-light-blue)]/50`}
        >
          Start Over
        </button>
        <a
          href={bookNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnPrimaryClass} text-center`}
          style={{ background: "var(--color-pink)" }}
        >
          Book a Tune-Up
        </a>
      </div>
    </div>
  );
}
