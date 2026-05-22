import type { StationSchedule } from "@/types/watering-calculator";

/** Human-readable run time for one zone (controller dial / app entry). */
export function formatZoneRuntimeSummary(station: StationSchedule): string {
  if (station.cycles > 1) {
    const soak =
      station.soakMinutes > 0
        ? `, ${station.soakMinutes} min soak between cycles`
        : "";
    return `${station.minutesPerCycle} min per cycle × ${station.cycles} cycles (${station.totalMinutes} min total${soak})`;
  }
  return `${station.totalMinutes} min per run`;
}
