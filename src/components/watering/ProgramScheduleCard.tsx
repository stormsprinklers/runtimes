import { weekdayLabels } from "@/data/wateringRestrictions";
import type { ProgramSchedule } from "@/types/watering-calculator";

export function ProgramScheduleCard({ program }: { program: ProgramSchedule }) {
  return (
    <article className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm">
      <h3 className="font-display text-xl text-[var(--color-navy)]">
        {program.label}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-navy)]/75">
        {program.daysPerWeek} day{program.daysPerWeek !== 1 ? "s" : ""} per week
        {program.wateringDays.length > 0 && (
          <>
            {" "}
            — {program.wateringDays.map((d) => weekdayLabels[d]).join(", ")}
          </>
        )}
      </p>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
          Start time{program.startTimes.length > 1 ? "s" : ""}
        </p>
        <ul className="mt-1 space-y-1">
          {program.startTimes.map((t) => (
            <li
              key={t}
              className={`font-semibold text-[var(--color-navy)] ${
                program.startTimes.length > 1
                  ? "rounded bg-[var(--color-light-blue)]/50 px-2 py-1 text-sm"
                  : "text-lg"
              }`}
            >
              {t}
              {program.startTimes.length > 1 &&
                " — full program runs (all stations)"}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-light-blue)] text-xs uppercase tracking-wide text-[var(--color-navy)]/60">
              <th className="py-2 pr-3 font-semibold">Station</th>
              <th className="py-2 pr-3 font-semibold">Runtime</th>
              <th className="py-2 pr-3 font-semibold">Cycles</th>
              <th className="py-2 font-semibold">Soak</th>
            </tr>
          </thead>
          <tbody>
            {program.stations.map((s) => (
              <tr
                key={s.stationId}
                className="border-b border-[var(--color-light-blue)]/50 last:border-0"
              >
                <td className="py-2.5 pr-3 font-medium text-[var(--color-navy)]">
                  {s.name}
                </td>
                <td className="py-2.5 pr-3 text-[var(--color-navy)]">
                  {s.totalMinutes} min total
                </td>
                <td className="py-2.5 pr-3 text-[var(--color-navy)]">
                  {s.cycles} × {s.minutesPerCycle} min
                </td>
                <td className="py-2.5 text-[var(--color-navy)]">
                  {s.soakMinutes > 0 ? `${s.soakMinutes} min` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--color-navy)]/70">
        One program run ≈ {program.totalRunMinutes} minutes (all stations in
        sequence)
      </p>

      {program.usesCycleSoak && (
        <div
          className="mt-4 rounded-lg p-3 text-sm text-[var(--color-navy)]"
          style={{
            background: "color-mix(in srgb, var(--color-medium-blue) 12%, white)",
          }}
        >
          <p className="font-semibold">Cycle-and-soak</p>
          <p className="mt-1">{program.cycleSoakExplanation}</p>
        </div>
      )}

      {program.stations.some((s) => s.warnings.length > 0) && (
        <ul className="mt-3 space-y-1 text-xs text-[var(--color-pink)]">
          {program.stations.flatMap((s) => s.warnings).map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
