"use client";

import { useState } from "react";
import type { ProgramSchedule } from "@/types/watering-calculator";
import { ALL_PROGRAM_IDS } from "@/types/watering-calculator";

interface ProgramTabsProps {
  programs: ProgramSchedule[];
}

function ProgramPanel({ program }: { program: ProgramSchedule }) {
  const hasZones = program.zoneNames.length > 0;

  return (
    <div className="space-y-5">
      {!hasZones ? (
        <p className="text-sm text-[var(--color-navy)]/60">
          No zones assigned to this program. Zones are grouped automatically by
          vegetation type and sprinkler type.
        </p>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/55">
              Zones in this program
            </p>
            <ul className="mt-2 space-y-1.5">
              {program.zoneNames.map((zone) => (
                <li
                  key={zone}
                  className="text-sm font-medium text-[var(--color-navy)]"
                >
                  {zone}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/55">
              Watering days
            </p>
            <p className="mt-1.5 text-base font-semibold text-[var(--color-navy)]">
              {program.scheduleLabel}
            </p>
            {program.scheduleMode === "interval" && program.intervalDays && (
              <p className="mt-1 text-sm text-[var(--color-navy)]/70">
                Interval watering — run every {program.intervalDays} day
                {program.intervalDays !== 1 ? "s" : ""}.
              </p>
            )}
            {program.scheduleMode === "odd-days" && (
              <p className="mt-1 text-sm text-[var(--color-navy)]/70">
                Odd address / odd-day schedule from your city rules.
              </p>
            )}
            {program.scheduleMode === "even-days" && (
              <p className="mt-1 text-sm text-[var(--color-navy)]/70">
                Even address / even-day schedule from your city rules.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/55">
              Start times
            </p>
            <p className="mt-1.5 text-base font-semibold text-[var(--color-navy)]">
              {program.startTimeCount} start time
              {program.startTimeCount !== 1 ? "s" : ""}
            </p>
            <ul className="mt-2 space-y-2">
              {program.startTimes.map((time, i) => (
                <li
                  key={`${time}-${i}`}
                  className="rounded-lg bg-[var(--color-light-grey)]/80 px-3 py-2.5 font-mono text-sm font-bold text-[var(--color-navy)]"
                >
                  Start {i + 1}: {time}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-navy)]/65">
              Each start time runs all zones in this program in order. Start times
              are spaced so runs do not overlap with other programs.
            </p>
          </div>

          {program.cycleSoakNote && (
            <div
              className="rounded-lg p-3 text-sm leading-relaxed text-[var(--color-navy)]"
              style={{
                background:
                  "color-mix(in srgb, var(--color-medium-blue) 12%, white)",
              }}
            >
              <p className="font-semibold">Cycle-and-soak (grass only)</p>
              <p className="mt-1">{program.cycleSoakNote}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ProgramTabs({ programs }: ProgramTabsProps) {
  const byId = new Map(programs.map((p) => [p.programId, p]));
  const ordered = ALL_PROGRAM_IDS.map((id) => byId.get(id)!);
  const firstWithZones =
    ordered.find((p) => p.zoneNames.length > 0)?.programId ?? "A";
  const [active, setActive] = useState(firstWithZones);
  const current = byId.get(active) ?? ordered[0];

  return (
    <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white shadow-sm">
      <div
        className="flex gap-1 overflow-x-auto border-b border-[var(--color-light-blue)] p-2 sm:gap-2 sm:p-3"
        role="tablist"
        aria-label="Controller programs"
      >
        {ordered.map((program) => {
          const isActive = program.programId === active;
          const zoneCount = program.zoneNames.length;
          return (
            <button
              key={program.programId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${program.programId}`}
              onClick={() => setActive(program.programId)}
              className="shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition sm:px-4"
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: program.tabColor,
                background: isActive
                  ? `color-mix(in srgb, ${program.tabColor} 18%, white)`
                  : "white",
                color: "var(--color-navy)",
              }}
            >
              <span className="block">Program {program.programId}</span>
              <span
                className="mt-0.5 block text-xs font-normal opacity-70"
              >
                {zoneCount === 0
                  ? "No zones"
                  : `${zoneCount} zone${zoneCount !== 1 ? "s" : ""}`}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${current.programId}`}
        role="tabpanel"
        className="p-4 sm:p-6"
        style={{
          borderTop: `3px solid ${current.tabColor}`,
        }}
      >
        <h3 className="font-display text-lg text-[var(--color-navy)]">
          {current.label}
        </h3>
        <ProgramPanel program={current} />
      </div>
    </div>
  );
}
