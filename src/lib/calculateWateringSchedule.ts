import { getBaseDaysPerWeek } from "@/data/seasonalWateringDays";
import { SPRINKLER_RUNTIME_DEFAULTS } from "@/data/sprinklerRuntimeDefaults";
import {
  getCityRule,
  UTAH_WEEKLY_LAWN_GUIDE_URL,
  weekdayLabels,
  type CityWateringRule,
} from "@/data/wateringRestrictions";
import type {
  AddressParity,
  ControllerCalculatorInput,
  ControllerCalculatorResult,
  CycleSoakMethod,
  LawnType,
  ProgramId,
  ProgramSchedule,
  Slope,
  SoilType,
  StationInput,
  StationRuntimeCore,
  StationSchedule,
  SunExposure,
  TimelineEntry,
  WateringCalculatorInput,
  WateringCalculatorResult,
  Weekday,
} from "@/types/watering-calculator";

const ALL_WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const PRIMARY_START = "5:00 AM";

const PROGRAM_LABELS: Record<ProgramId, string> = {
  A: "Program A — Lawn",
  B: "Program B — Drip & landscape",
  C: "Program C — New sod / seed",
};

const SUN_MULTIPLIERS: Record<SunExposure, number> = {
  "full-sun": 1.15,
  mixed: 1.0,
  "mostly-shade": 0.75,
};

const SOIL_MULTIPLIERS: Record<SoilType, number> = {
  clay: 0.9,
  loam: 1.0,
  sandy: 1.15,
  unknown: 1.0,
};

const SLOPE_MULTIPLIERS: Record<Slope, number> = {
  flat: 1.0,
  moderate: 0.9,
  steep: 0.8,
};

const BADGE_LABELS: Record<
  ControllerCalculatorResult["badge"],
  string
> = {
  "auto-update": "Active restriction",
  "state-guide-fallback": "State guide fallback",
  "provider-lookup": "Provider lookup required",
  "manual-review": "Manual review",
  "recommendation-only": "Recommendation only",
  "provider-aware": "Provider-aware",
};

export const START_TIME_MISTAKE_NOTE =
  "Important: Each start time runs your entire program (all stations in order), not a single zone. Adding extra start times repeats the full program — a common mistake is assigning one start time per zone, which can triple your watering.";

export function parseNoWaterBeforeDate(
  text: string,
  referenceYear: number,
): Date | null {
  const match = text.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})$/i,
  );
  if (!match) return null;
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const month = months[match[1].toLowerCase()];
  const day = parseInt(match[2], 10);
  if (month === undefined) return null;
  return new Date(referenceYear, month, day);
}

export function applyCityDayLimits(
  baseDays: number,
  rule: CityWateringRule,
  today: Date,
): number {
  let days = baseDays;

  if (rule.noWateringBeforeDate) {
    const gate = parseNoWaterBeforeDate(
      rule.noWateringBeforeDate,
      today.getFullYear(),
    );
    if (gate && today < gate) return 0;
  }

  if (rule.subtractOneDayFromNormal && days > 0) {
    days = Math.max(0, days - 1);
  }

  if (rule.maxDaysPerWeek !== undefined) {
    days = Math.min(days, rule.maxDaysPerWeek);
  }

  if (rule.oncePerWeekCap) {
    days = Math.min(days, 1);
  }

  return days;
}

function weekdayIndex(d: Weekday): number {
  return ALL_WEEKDAYS.indexOf(d);
}

export function pickSpacedDays(
  candidates: Weekday[],
  count: number,
  noConsecutive: boolean,
): Weekday[] {
  if (count <= 0) return [];
  if (count >= candidates.length) return [...candidates];

  const indices = candidates.map(weekdayIndex).sort((a, b) => a - b);

  if (!noConsecutive && count === 2 && indices.length >= 2) {
    return [candidates[0], candidates[candidates.length - 1]];
  }

  const step = indices.length / count;
  const picked: Weekday[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.min(indices.length - 1, Math.floor(i * step + step / 2));
    picked.push(ALL_WEEKDAYS[indices[idx]]);
  }

  if (noConsecutive) {
    const unique = [...new Set(picked)];
    if (unique.length < count) {
      return pickSpacedFromWeek(count, noConsecutive);
    }
    for (let i = 1; i < unique.length; i++) {
      const diff = weekdayIndex(unique[i]) - weekdayIndex(unique[i - 1]);
      if (diff === 1) {
        return pickSpacedFromWeek(count, true);
      }
    }
    return unique.slice(0, count);
  }

  return picked.slice(0, count);
}

export function pickSpacedFromWeek(
  count: number,
  noConsecutive: boolean,
): Weekday[] {
  if (count <= 0) return [];
  if (count === 1) return ["wednesday"];
  if (count === 2)
    return noConsecutive ? ["monday", "thursday"] : ["tuesday", "friday"];
  if (count === 3) return ["monday", "wednesday", "friday"];
  if (count === 4) return ["monday", "tuesday", "thursday", "saturday"];
  if (count >= 5)
    return ["monday", "tuesday", "wednesday", "thursday", "friday"];
  return ["monday"];
}

export function resolveAllowedWateringDays(
  daysPerWeek: number,
  rule: CityWateringRule,
  parity: AddressParity,
): Weekday[] {
  if (daysPerWeek <= 0) return [];

  let assigned: Weekday[] | undefined;

  if (parity === "odd" && rule.oddAddressDays?.length) {
    assigned = rule.oddAddressDays;
  } else if (parity === "even" && rule.evenAddressDays?.length) {
    assigned = rule.evenAddressDays;
  } else if (rule.generalAllowedDays?.length) {
    assigned = rule.generalAllowedDays;
  }

  const useCount =
    rule.waterDaysToUse && assigned
      ? Math.min(daysPerWeek, rule.waterDaysToUse)
      : daysPerWeek;

  if (assigned?.length) {
    return pickSpacedDays(
      assigned,
      Math.min(useCount, assigned.length),
      !!rule.noConsecutiveDays,
    );
  }

  return pickSpacedFromWeek(useCount, !!rule.noConsecutiveDays);
}

export function assignProgram(station: StationInput): ProgramId {
  if (station.lawnType === "new-sod" || station.lawnType === "new-seed") {
    return "C";
  }
  if (
    station.lawnType === "trees-shrubs" ||
    station.lawnType === "garden-beds" ||
    station.sprinklerType === "drip" ||
    station.sprinklerType === "bubbler"
  ) {
    return "B";
  }
  return "A";
}

export function getProgramDaysPerWeek(
  programId: ProgramId,
  cityDays: number,
): number {
  if (cityDays <= 0) return 0;
  if (programId === "A") return cityDays;
  if (programId === "B") return Math.max(1, Math.min(cityDays, 2));
  return 7;
}

export function calculateStationRuntime(
  station: StationInput,
): StationRuntimeCore {
  const baseRuntime = SPRINKLER_RUNTIME_DEFAULTS[station.sprinklerType];
  const sunMult = SUN_MULTIPLIERS[station.sunExposure];
  const soilMult = SOIL_MULTIPLIERS[station.soilType];
  const slopeMult = SLOPE_MULTIPLIERS[station.slope];

  const adjustedTotal = Math.round(
    baseRuntime.minutesPerWatering * sunMult * soilMult * slopeMult,
  );

  let cycles = baseRuntime.cycles;
  let soakMinutes = baseRuntime.soakMinutes;

  const needsCycleSoak =
    station.soilType === "clay" ||
    station.slope === "moderate" ||
    station.slope === "steep";

  if (needsCycleSoak) {
    cycles += 1;
    soakMinutes = 45;
  }

  const minutesPerCycle = Math.max(1, Math.ceil(adjustedTotal / cycles));

  return {
    totalMinutes: adjustedTotal,
    cycles,
    minutesPerCycle,
    soakMinutes,
    needsCycleSoak,
  };
}

function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 5 * 60;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${mins.toString().padStart(2, "0")} ${period}`;
}

export function buildProgramStartTimes(
  programUsesCycleSoak: boolean,
  maxCycles: number,
  soakMinutes: number,
): string[] {
  if (!programUsesCycleSoak || maxCycles <= 1) {
    return [PRIMARY_START];
  }
  const base = parseTimeToMinutes(PRIMARY_START);
  const times: string[] = [];
  for (let i = 0; i < Math.min(maxCycles, 3); i++) {
    times.push(formatMinutesToTime(base + i * soakMinutes));
  }
  return times;
}

export function buildCycleSoakExplanation(
  method: CycleSoakMethod,
  cycles: number,
  minutesPerCycle: number,
  soakMinutes: number,
): string {
  if (method === "built-in") {
    return `If your controller supports cycle-and-soak: set ${cycles} cycles of ${minutesPerCycle} minutes with ${soakMinutes} minutes soak between cycles (same total water, less runoff).`;
  }
  return `Use ${cycles} program start times spaced about ${soakMinutes} minutes apart. Each start time runs all stations in this program once at ${minutesPerCycle} minutes per station.`;
}

function stationMismatchWarnings(station: StationInput): string[] {
  const warnings: string[] = [];
  const sprayRotor =
    station.sprinklerType === "spray" ||
    station.sprinklerType === "rotor" ||
    station.sprinklerType === "mp-rotator";
  if (
    (station.lawnType === "trees-shrubs" || station.lawnType === "garden-beds") &&
    sprayRotor
  ) {
    warnings.push(
      `${station.name}: trees/beds on spray or rotor heads — drip or bubblers are usually a better match.`,
    );
  }
  return warnings;
}

export function buildProgramTimeline(
  program: ProgramSchedule,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const startTimes = program.startTimes;

  startTimes.forEach((startTime, cycleIndex) => {
    let cursor = parseTimeToMinutes(startTime);
    const cycleLabel =
      startTimes.length > 1 ? ` (cycle ${cycleIndex + 1})` : "";

    program.stations.forEach((station, idx) => {
      entries.push({
        time: formatMinutesToTime(cursor),
        label: `${station.name} runs ${station.minutesPerCycle} min${cycleLabel}`,
      });
      cursor += station.minutesPerCycle;
      if (idx < program.stations.length - 1) {
        entries.push({
          time: formatMinutesToTime(cursor),
          label: `Next station starts`,
        });
      }
    });

    if (cycleIndex < startTimes.length - 1 && program.stations.length > 0) {
      const soak = program.stations[0]?.soakMinutes ?? 30;
      entries.push({
        time: formatMinutesToTime(cursor),
        label: `Soak ~${soak} min before next cycle`,
      });
    }
  });

  return entries;
}

export function detectHydrozoneIssues(
  stations: StationInput[],
  programs: ProgramSchedule[],
): string[] {
  const warnings: string[] = [];

  for (const program of programs) {
    if (program.programId !== "A") continue;

    const programStations = stations.filter((s) => {
      const sched = program.stations.find((ps) => ps.stationId === s.id);
      return !!sched;
    });

    const sunTypes = new Set(programStations.map((s) => s.sunExposure));
    if (sunTypes.has("full-sun") && sunTypes.has("mostly-shade")) {
      warnings.push(
        `Program A: ${programStations.map((s) => s.name).join(" and ")} mix full sun and heavy shade — separate stations on the controller if possible for even coverage.`,
      );
    }

    const slopes = new Set(programStations.map((s) => s.slope));
    if (slopes.has("flat") && (slopes.has("moderate") || slopes.has("steep"))) {
      warnings.push(
        `Program A: flat and sloped lawn share a program — slope areas often need cycle-and-soak; consider a dedicated station for slopes.`,
      );
    }

    const sprinklerFamilies = new Set(
      programStations.map((s) =>
        s.sprinklerType === "spray" ? "spray" : s.sprinklerType === "rotor" || s.sprinklerType === "mp-rotator" ? "rotor-family" : "point",
      ),
    );
    if (sprinklerFamilies.has("spray") && sprinklerFamilies.has("rotor-family")) {
      warnings.push(
        `Program A: spray heads and rotors apply water at very different rates — they should be on separate stations (hydrozoning).`,
      );
    }
  }

  return warnings;
}

function formatTimeRestriction(rule: CityWateringRule): string | undefined {
  if (rule.noWateringStart && rule.noWateringEnd) {
    const start = rule.noWateringStart;
    const end = rule.noWateringEnd;
    if (start === "18:00" && end === "10:00") {
      return "Water only between 6:00 PM and 10:00 AM.";
    }
    if (start === "19:00" && end === "07:00") {
      return "Water only between 7:00 PM and 7:00 AM.";
    }
    return `Avoid watering between ${start} and ${end} (check local ordinance for AM/PM).`;
  }
  return undefined;
}

function buildCityWarningsAndNotes(
  rule: CityWateringRule,
  daysPerWeek: number,
): { warnings: string[]; notes: string[] } {
  const warnings: string[] = [];
  const notes: string[] = [];

  if (rule.requiresProviderLookup || rule.ruleStatus === "provider-lookup") {
    warnings.push(
      "Watering rules may depend on your exact water provider. Use this as a general guide and verify with your utility.",
    );
  }

  if (rule.ruleStatus === "manual-review") {
    warnings.push(
      "We could not verify a current city-specific watering rule. This recommendation uses the Utah Weekly Lawn Watering Guide fallback.",
    );
  }

  if (rule.ruleStatus === "state-guide-fallback") {
    notes.push(
      `Follow the Utah Weekly Lawn Watering Guide each week: ${UTAH_WEEKLY_LAWN_GUIDE_URL}`,
    );
  }

  if (daysPerWeek === 0 && rule.noWateringBeforeDate) {
    warnings.push(
      `Outdoor irrigation is not recommended before ${rule.noWateringBeforeDate} for your city (except new seed/sod where allowed).`,
    );
  }

  if (rule.minHoursBetweenCycles) {
    notes.push(
      `Wait at least ${rule.minHoursBetweenCycles} hours between irrigation cycles on the same zone.`,
    );
  }

  if (rule.noConsecutiveDays) {
    notes.push("Do not water the same zone on consecutive calendar days.");
  }

  if (rule.everyThirdDayGuidance) {
    notes.push(
      "Every-third-day watering is generally adequate for established lawns in your city.",
    );
  }

  if (rule.paysonPdfReview) {
    warnings.push(
      "Payson publishes a PI watering schedule PDF — download it for exact assigned days.",
    );
  }

  if (rule.providerNote) {
    notes.push(rule.providerNote);
  }

  const timeRestriction = formatTimeRestriction(rule);
  if (timeRestriction) notes.push(timeRestriction);

  return { warnings, notes };
}

export function calculateControllerSchedule(
  input: ControllerCalculatorInput,
): ControllerCalculatorResult | null {
  const { site, stations } = input;
  if (!stations.length) return null;

  const rule = getCityRule(site.cityId);
  if (!rule) return null;

  const today = site.referenceDate ?? new Date();
  const baseDays = getBaseDaysPerWeek(site.month);
  const cityDays = applyCityDayLimits(baseDays, rule, today);
  const cityWateringDays = resolveAllowedWateringDays(
    cityDays,
    rule,
    site.addressParity,
  );

  const stationSchedules: StationSchedule[] = stations.map((station) => {
    const runtime = calculateStationRuntime(station);
    const programId = assignProgram(station);
    const method: CycleSoakMethod =
      runtime.needsCycleSoak && runtime.cycles > 1
        ? "built-in"
        : "built-in";

    return {
      stationId: station.id,
      name: station.name,
      programId,
      totalMinutes: runtime.totalMinutes,
      cycles: runtime.cycles,
      minutesPerCycle: runtime.minutesPerCycle,
      soakMinutes: runtime.soakMinutes,
      cycleSoakMethod: method,
      warnings: stationMismatchWarnings(station),
    };
  });

  const programIds: ProgramId[] = ["A", "B", "C"];
  const programs: ProgramSchedule[] = [];

  for (const programId of programIds) {
    const programStations = stationSchedules.filter(
      (s) => s.programId === programId,
    );
    if (!programStations.length) continue;

    const programDays = getProgramDaysPerWeek(programId, cityDays);
    const wateringDays =
      programId === "C" && cityDays > 0
        ? pickSpacedFromWeek(Math.min(programDays, 7), false)
        : programDays > 0
          ? resolveAllowedWateringDays(programDays, rule, site.addressParity)
          : [];

    const usesCycleSoak = programStations.some(
      (s) => s.cycles > 1 && s.soakMinutes > 0,
    );
    const maxCycles = Math.max(...programStations.map((s) => s.cycles));
    const maxSoak = Math.max(...programStations.map((s) => s.soakMinutes));

    const startTimes = buildProgramStartTimes(
      usesCycleSoak,
      maxCycles,
      maxSoak || 30,
    );

    const cycleSoakMethod: CycleSoakMethod = usesCycleSoak
      ? "multiple-start-times"
      : "built-in";

    let cycleSoakExplanation = "";
    if (usesCycleSoak) {
      const rep = programStations.find((s) => s.cycles > 1) ?? programStations[0];
      cycleSoakExplanation = buildCycleSoakExplanation(
        cycleSoakMethod,
        rep.cycles,
        rep.minutesPerCycle,
        rep.soakMinutes,
      );
    } else {
      cycleSoakExplanation =
        "No cycle-and-soak required for these stations under current conditions.";
    }

    programs.push({
      programId,
      label: PROGRAM_LABELS[programId],
      daysPerWeek: programDays,
      wateringDays,
      startTimes,
      primaryStartTime: startTimes[0],
      stations: programStations,
      totalRunMinutes: programStations.reduce(
        (sum, s) => sum + s.totalMinutes,
        0,
      ),
      usesCycleSoak,
      cycleSoakExplanation,
    });
  }

  const hydrozoneWarnings = detectHydrozoneIssues(stations, programs);

  const { warnings, notes } = buildCityWarningsAndNotes(rule, cityDays);

  if (programs.some((p) => p.programId === "C")) {
    notes.push(
      "Program C (new sod/seed): establishment often needs lighter, more frequent watering than established lawn — verify city allowances for new landscape.",
    );
  }

  const primaryProgram = programs[0];
  const timeline = primaryProgram
    ? buildProgramTimeline(primaryProgram)
    : [];

  const usesStateGuide = rule.ruleStatus === "state-guide-fallback";

  return {
    cityName: rule.city,
    county: rule.county,
    baseDaysFromSeason: baseDays,
    cityDaysPerWeek: cityDays,
    warnings,
    notes,
    badge: rule.ruleStatus,
    badgeLabel: BADGE_LABELS[rule.ruleStatus],
    sourceUrl: rule.sourceUrl,
    sourceLabel: rule.sourceLabel,
    restrictionText: rule.restrictionText,
    recommendationText: rule.recommendationText,
    providerNote: rule.providerNote,
    stateGuideUrl: usesStateGuide ? UTAH_WEEKLY_LAWN_GUIDE_URL : undefined,
    timeRestriction: formatTimeRestriction(rule),
    programs,
    stationOrder: stations.map((s) => s.id),
    timeline,
    hydrozoneWarnings,
    startTimeMistakeNote: START_TIME_MISTAKE_NOTE,
  };
}

export function calculateWateringSchedule(
  input: WateringCalculatorInput,
): WateringCalculatorResult | null {
  const result = calculateControllerSchedule({
    site: {
      county: input.county,
      cityId: input.cityId,
      addressParity: input.addressParity,
      month: input.month,
      referenceDate: input.referenceDate,
    },
    stations: [
      {
        id: "single",
        name: "Zone 1",
        sprinklerType: input.sprinklerType,
        lawnType: input.lawnType,
        sunExposure: input.sunExposure,
        soilType: input.soilType,
        slope: input.slope,
      },
    ],
  });

  if (!result) return null;

  const program = result.programs[0];
  const station = program?.stations[0];

  return {
    cityName: result.cityName,
    county: result.county,
    daysPerWeek: program?.daysPerWeek ?? 0,
    wateringDays: program?.wateringDays ?? [],
    totalMinutes: station?.totalMinutes ?? 0,
    cycles: station?.cycles ?? 1,
    minutesPerCycle: station?.minutesPerCycle ?? 0,
    soakMinutes: station?.soakMinutes ?? 0,
    recommendedStartTime: program?.primaryStartTime ?? PRIMARY_START,
    warnings: [...result.warnings, ...result.hydrozoneWarnings],
    notes: result.notes,
    badge: result.badge,
    badgeLabel: result.badgeLabel,
    sourceUrl: result.sourceUrl,
    sourceLabel: result.sourceLabel,
    restrictionText: result.restrictionText,
    recommendationText: result.recommendationText,
    providerNote: result.providerNote,
    stateGuideUrl: result.stateGuideUrl,
    baseDaysFromSeason: result.baseDaysFromSeason,
    timeRestriction: result.timeRestriction,
  };
}

export function createDefaultStation(index: number): StationInput {
  return {
    id: `station-${index}-${Date.now()}`,
    name: `Station ${index + 1}`,
    sprinklerType: index === 0 ? "spray" : "rotor",
    lawnType: "established-lawn",
    sunExposure: "full-sun",
    soilType: "loam",
    slope: "flat",
  };
}
