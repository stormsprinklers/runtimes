import { weekdayLabels } from "@/data/wateringRestrictions";
import { cardShellClass } from "@/lib/ui";
import type { ProgramSchedule, StationSchedule } from "@/types/watering-calculator";

function StationMobileCard({ station }: { station: StationSchedule }) {
  return (
    <li className="rounded-lg border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/50 p-3">
      <p className="font-semibold text-[var(--color-navy)]">{station.name}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-[var(--color-navy)]">
        <div>
          <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/55">
            Runtime
          </dt>
          <dd className="mt-0.5">{station.totalMinutes} min total</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/55">
            Cycles
          </dt>
          <dd className="mt-0.5">
            {station.cycles} × {station.minutesPerCycle} min
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-semibold uppercase text-[var(--color-navy)]/55">
            Soak
          </dt>
          <dd className="mt-0.5">
            {station.soakMinutes > 0 ? `${station.soakMinutes} min` : "—"}
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function ProgramScheduleCard({ program }: { program: ProgramSchedule }) {
  const wateringDaysText =
    program.wateringDays.length > 0
      ? program.wateringDays.map((d) => weekdayLabels[d]).join(", ")
      : null;

  return (
    <article className={cardShellClass}>
      <h3 className="font-display text-lg text-[var(--color-navy)] sm:text-xl">
        {program.label}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-navy)]/75">
        {program.daysPerWeek} day{program.daysPerWeek !== 1 ? "s" : ""} per week
        {wateringDaysText && (
          <>
            <span className="hidden sm:inline"> — </span>
            <span className="mt-0.5 block sm:mt-0 sm:inline">
              {wateringDaysText}
            </span>
          </>
        )}
      </p>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-navy)]/60">
          Start time{program.startTimes.length > 1 ? "s" : ""}
        </p>
        <ul className="mt-1.5 space-y-2">
          {program.startTimes.map((t) => (
            <li
              key={t}
              className={`font-semibold text-[var(--color-navy)] ${
                program.startTimes.length > 1
                  ? "rounded-lg bg-[var(--color-light-blue)]/50 px-3 py-2.5 text-sm leading-snug"
                  : "text-xl sm:text-lg"
              }`}
            >
              {t}
              {program.startTimes.length > 1 && (
                <span className="mt-0.5 block font-normal text-[var(--color-navy)]/70 sm:inline sm:font-semibold sm:text-[var(--color-navy)]">
                  <span className="hidden sm:inline"> — </span>
                  <span className="sm:hidden">Each start runs all stations</span>
                  <span className="hidden sm:inline">
                    full program runs (all stations)
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-4 space-y-3 md:hidden">
        {program.stations.map((s) => (
          <StationMobileCard key={s.stationId} station={s} />
        ))}
      </ul>

      <div className="mt-5 hidden overflow-x-auto md:block">
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

      <p className="mt-3 text-xs leading-relaxed text-[var(--color-navy)]/70">
        One program run ≈ {program.totalRunMinutes} minutes (all stations in
        sequence)
      </p>

      {program.usesCycleSoak && (
        <div
          className="mt-4 rounded-lg p-3 text-sm leading-relaxed text-[var(--color-navy)]"
          style={{
            background: "color-mix(in srgb, var(--color-medium-blue) 12%, white)",
          }}
        >
          <p className="font-semibold">Cycle-and-soak</p>
          <p className="mt-1">{program.cycleSoakExplanation}</p>
        </div>
      )}

      {program.stations.some((s) => s.warnings.length > 0) && (
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-[var(--color-pink)]">
          {program.stations.flatMap((s) => s.warnings).map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
