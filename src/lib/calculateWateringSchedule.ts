import { getBaseDaysPerWeek } from "@/data/seasonalWateringDays";
import { SPRINKLER_RUNTIME_DEFAULTS } from "@/data/sprinklerRuntimeDefaults";
import {
  PROGRAM_DESCRIPTIONS,
  PROGRAM_SHORT_LABELS,
  PROGRAM_TAB_COLORS,
} from "@/lib/programStyles";
import { formatZoneDisplayName } from "@/lib/zoneDisplay";
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
  WateringCalculatorInput,
  WateringCalculatorResult,
  WateringScheduleMode,
  Weekday,
} from "@/types/watering-calculator";
import { ALL_PROGRAM_IDS } from "@/types/watering-calculator";

const ALL_WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const EVENING_START_MIN = 19 * 60; // 7:00 PM
const GRASS_START_MIN = 24 * 60 + 4 * 60; // 4:00 AM next calendar morning
const START_BUFFER_MIN = 5;

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
  "Each start time runs every zone in that program once, in order. Do not assign one start time per zone unless your controller manual calls for it.";

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
    // e.g. SLC Stage 2: one day less than normal — keep at least 1 day in active season
    days = Math.max(1, days - 1);
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

function formatWeekdayList(days: Weekday[]): string {
  return days.map((d) => weekdayLabels[d]).join(", ");
}

function isGrassSprinkler(station: StationInput): boolean {
  return (
    station.lawnType === "established-lawn" &&
    (station.sprinklerType === "spray" ||
      station.sprinklerType === "rotor" ||
      station.sprinklerType === "mp-rotator")
  );
}

export function assignProgram(station: StationInput): ProgramId {
  if (station.lawnType === "new-sod" || station.lawnType === "new-seed") {
    return "C";
  }
  if (station.lawnType === "trees") {
    return "D";
  }
  if (
    station.lawnType === "shrubs" ||
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
  if (programId === "D") return 1;
  return 7;
}

export function calculateStationRuntime(
  station: StationInput,
): StationRuntimeCore {
  const baseRuntime = SPRINKLER_RUNTIME_DEFAULTS[station.sprinklerType];
  const sunMult = SUN_MULTIPLIERS[station.sunExposure];
  const soilMult = SOIL_MULTIPLIERS[station.soilType];
  const slopeMult = SLOPE_MULTIPLIERS[station.slope];

  let baseMinutes = baseRuntime.minutesPerWatering;
  let cycles = baseRuntime.cycles;
  let soakMinutes = 0;

  if (station.lawnType === "trees") {
    baseMinutes = 75;
    cycles = 1;
  } else if (station.lawnType === "shrubs" && station.sprinklerType === "drip") {
    baseMinutes = 50;
    cycles = 1;
  }

  const adjustedTotal = Math.round(
    baseMinutes * sunMult * soilMult * slopeMult,
  );

  const needsCycleSoak =
    isGrassSprinkler(station) &&
    (station.soilType === "clay" ||
      station.slope === "moderate" ||
      station.slope === "steep");

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

export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 5 * 60;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${mins.toString().padStart(2, "0")} ${period}`;
}

function onePassMinutes(stations: StationSchedule[]): number {
  return stations.reduce((sum, s) => sum + s.minutesPerCycle, 0);
}

function buildStartTimesForProgram(
  startMinute: number,
  stations: StationSchedule[],
  usesCycleSoak: boolean,
): { startTimes: string[]; endMinute: number } {
  const passMin = onePassMinutes(stations);
  if (passMin <= 0) {
    return { startTimes: [formatMinutesToTime(startMinute)], endMinute: startMinute };
  }

  const maxCycles = Math.max(...stations.map((s) => s.cycles), 1);
  const useMultipleStarts = usesCycleSoak && maxCycles > 1;
  const startTimes: string[] = [];
  let cursor = startMinute;

  if (useMultipleStarts) {
    const cycleCount = Math.min(maxCycles, 3);
    for (let i = 0; i < cycleCount; i++) {
      startTimes.push(formatMinutesToTime(cursor));
      cursor += passMin + START_BUFFER_MIN;
    }
  } else {
    startTimes.push(formatMinutesToTime(cursor));
    cursor += passMin + START_BUFFER_MIN;
  }

  return { startTimes, endMinute: cursor };
}

export function resolveProgramWateringSchedule(
  programId: ProgramId,
  cityDays: number,
  rule: CityWateringRule,
  parity: AddressParity,
): {
  scheduleMode: WateringScheduleMode;
  scheduleLabel: string;
  daysPerWeek: number;
  wateringDays: Weekday[];
  intervalDays?: number;
} {
  if (cityDays <= 0) {
    return {
      scheduleMode: "specific-days",
      scheduleLabel: "No outdoor watering recommended for this season",
      daysPerWeek: 0,
      wateringDays: [],
    };
  }

  if (programId === "D") {
    const intervalDays = 10;
    return {
      scheduleMode: "interval",
      scheduleLabel: `Every ${intervalDays} days (deep, infrequent)`,
      daysPerWeek: 0,
      wateringDays: [],
      intervalDays,
    };
  }

  if (programId === "C") {
    const days = pickSpacedFromWeek(Math.min(7, cityDays || 7), false);
    return {
      scheduleMode: "specific-days",
      scheduleLabel: `Specific days — ${formatWeekdayList(days)}`,
      daysPerWeek: days.length,
      wateringDays: days,
    };
  }

  if (rule.everyThirdDayGuidance && programId === "A") {
    return {
      scheduleMode: "interval",
      scheduleLabel: "Every 3 days",
      daysPerWeek: Math.min(cityDays, 3),
      wateringDays: [],
      intervalDays: 3,
    };
  }

  if (parity === "odd" && rule.oddAddressDays?.length) {
    const programDays = getProgramDaysPerWeek(programId, cityDays);
    const days = resolveAllowedWateringDays(programDays, rule, "odd");
    return {
      scheduleMode: "odd-days",
      scheduleLabel: `Odd address days — ${formatWeekdayList(days)}`,
      daysPerWeek: days.length,
      wateringDays: days,
    };
  }

  if (parity === "even" && rule.evenAddressDays?.length) {
    const programDays = getProgramDaysPerWeek(programId, cityDays);
    const days = resolveAllowedWateringDays(programDays, rule, "even");
    return {
      scheduleMode: "even-days",
      scheduleLabel: `Even address days — ${formatWeekdayList(days)}`,
      daysPerWeek: days.length,
      wateringDays: days,
    };
  }

  if (
    programId === "B" &&
    parity === "unknown" &&
    !rule.oddAddressDays?.length &&
    !rule.evenAddressDays?.length
  ) {
    return {
      scheduleMode: "interval",
      scheduleLabel: "Every 3 days",
      daysPerWeek: 2,
      wateringDays: [],
      intervalDays: 3,
    };
  }

  const programDays = getProgramDaysPerWeek(programId, cityDays);
  const days = resolveAllowedWateringDays(programDays, rule, parity);
  return {
    scheduleMode: "specific-days",
    scheduleLabel:
      days.length > 0
        ? `Specific days — ${formatWeekdayList(days)}`
        : "Follow local watering ordinance",
    daysPerWeek: days.length,
    wateringDays: days,
  };
}

function scheduleProgramStartTimes(
  programs: ProgramSchedule[],
): void {
  let eveningCursor = EVENING_START_MIN;

  const eveningOrder: ProgramId[] = ["B", "C", "D"];
  for (const programId of eveningOrder) {
    const program = programs.find((p) => p.programId === programId);
    if (!program?.stations.length) continue;

    const { startTimes, endMinute } = buildStartTimesForProgram(
      eveningCursor,
      program.stations,
      program.usesCycleSoak,
    );
    program.startTimes = startTimes;
    program.startTimeCount = startTimes.length;
    program.primaryStartTime = startTimes[0];
    eveningCursor = endMinute;
  }

  const grass = programs.find((p) => p.programId === "A");
  if (grass?.stations.length) {
    const grassStart = Math.max(eveningCursor, GRASS_START_MIN);
    const { startTimes } = buildStartTimesForProgram(
      grassStart,
      grass.stations,
      grass.usesCycleSoak,
    );
    grass.startTimes = startTimes;
    grass.startTimeCount = startTimes.length;
    grass.primaryStartTime = startTimes[0];
  }
}

function stationMismatchWarnings(
  station: StationInput,
  zoneNumber: number,
): string[] {
  const warnings: string[] = [];
  const sprayRotor =
    station.sprinklerType === "spray" ||
    station.sprinklerType === "rotor" ||
    station.sprinklerType === "mp-rotator";
  if (
    (station.lawnType === "shrubs" ||
      station.lawnType === "trees" ||
      station.lawnType === "garden-beds") &&
    sprayRotor
  ) {
    warnings.push(
      `${formatZoneDisplayName(zoneNumber, station.name)}: use drip or bubblers for trees, shrubs, and beds when possible.`,
    );
  }
  return warnings;
}

export function detectHydrozoneIssues(
  stations: StationInput[],
  programs: ProgramSchedule[],
): string[] {
  const warnings: string[] = [];

  for (const program of programs) {
    if (program.programId !== "A" || !program.stations.length) continue;

    const programStations = stations.filter((s) => {
      const sched = program.stations.find((ps) => ps.stationId === s.id);
      return !!sched;
    });

    const sunTypes = new Set(programStations.map((s) => s.sunExposure));
    if (sunTypes.has("full-sun") && sunTypes.has("mostly-shade")) {
      warnings.push(
        `Program A: ${programStations.map((s) => s.name).join(" and ")} mix full sun and heavy shade — separate zones when possible.`,
      );
    }

    const slopes = new Set(programStations.map((s) => s.slope));
    if (slopes.has("flat") && (slopes.has("moderate") || slopes.has("steep"))) {
      warnings.push(
        `Program A: flat and sloped lawn share a program — consider a dedicated zone for slopes.`,
      );
    }

    const sprinklerFamilies = new Set(
      programStations.map((s) =>
        s.sprinklerType === "spray"
          ? "spray"
          : s.sprinklerType === "rotor" || s.sprinklerType === "mp-rotator"
            ? "rotor-family"
            : "point",
      ),
    );
    if (sprinklerFamilies.has("spray") && sprinklerFamilies.has("rotor-family")) {
      warnings.push(
        `Program A: spray heads and rotors apply water at different rates — hydrozone them on separate programs.`,
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

  notes.push(
    "Drip/shrub zones may run any time inside your allowed watering window (typically 7:00 PM–7:00 AM). Grass is scheduled toward morning, before sunrise.",
  );

  return { warnings, notes };
}

function emptyProgram(programId: ProgramId): ProgramSchedule {
  return {
    programId,
    label: `${PROGRAM_SHORT_LABELS[programId]} — ${PROGRAM_DESCRIPTIONS[programId]}`,
    tabColor: PROGRAM_TAB_COLORS[programId],
    zoneNames: [],
    scheduleMode: "specific-days",
    scheduleLabel: "No zones assigned",
    daysPerWeek: 0,
    wateringDays: [],
    startTimes: [],
    startTimeCount: 0,
    primaryStartTime: "—",
    stations: [],
    totalRunMinutes: 0,
    usesCycleSoak: false,
  };
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

  const stationSchedules: StationSchedule[] = stations.map((station, index) => {
    const runtime = calculateStationRuntime(station);
    const programId = assignProgram(station);
    const zoneNumber = index + 1;
    const method: CycleSoakMethod =
      runtime.needsCycleSoak && runtime.cycles > 1
        ? "multiple-start-times"
        : "built-in";

    return {
      stationId: station.id,
      zoneNumber,
      name: station.name,
      displayName: formatZoneDisplayName(zoneNumber, station.name),
      programId,
      totalMinutes: runtime.totalMinutes,
      cycles: runtime.cycles,
      minutesPerCycle: runtime.minutesPerCycle,
      soakMinutes: runtime.soakMinutes,
      cycleSoakMethod: method,
      warnings: stationMismatchWarnings(station, zoneNumber),
    };
  });

  const activeByProgram = new Map<ProgramId, StationSchedule[]>();
  for (const sched of stationSchedules) {
    const list = activeByProgram.get(sched.programId) ?? [];
    list.push(sched);
    activeByProgram.set(sched.programId, list);
  }

  const programs: ProgramSchedule[] = ALL_PROGRAM_IDS.map((programId) => {
    const programStations = activeByProgram.get(programId) ?? [];
    if (!programStations.length) return emptyProgram(programId);

    const watering = resolveProgramWateringSchedule(
      programId,
      cityDays,
      rule,
      site.addressParity,
    );

    const usesCycleSoak = programStations.some(
      (s) => s.cycles > 1 && s.soakMinutes > 0,
    );

    let cycleSoakNote: string | undefined;
    if (usesCycleSoak && programId === "A") {
      const rep = programStations.find((s) => s.cycles > 1) ?? programStations[0];
      cycleSoakNote = `Cycle-and-soak for grass: ${rep.cycles} start times, ${rep.minutesPerCycle} min per zone each run (about ${onePassMinutes(programStations)} min per full program pass).`;
    }

    return {
      programId,
      label: `${PROGRAM_SHORT_LABELS[programId]} — ${PROGRAM_DESCRIPTIONS[programId]}`,
      tabColor: PROGRAM_TAB_COLORS[programId],
      zoneNames: programStations.map((s) => s.displayName),
      scheduleMode: watering.scheduleMode,
      scheduleLabel: watering.scheduleLabel,
      daysPerWeek: watering.daysPerWeek,
      wateringDays: watering.wateringDays,
      intervalDays: watering.intervalDays,
      startTimes: [],
      startTimeCount: 0,
      primaryStartTime: "—",
      stations: programStations,
      totalRunMinutes: programStations.reduce(
        (sum, s) => sum + s.totalMinutes,
        0,
      ),
      usesCycleSoak,
      cycleSoakNote,
    };
  });

  scheduleProgramStartTimes(programs);

  const hydrozoneWarnings = detectHydrozoneIssues(stations, programs);
  const { warnings, notes } = buildCityWarningsAndNotes(rule, cityDays);

  if (programs.some((p) => p.programId === "C" && p.stations.length)) {
    notes.push(
      "Program C (new sod/seed): establishment often needs lighter, more frequent watering — verify city allowances.",
    );
  }

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
    timeline: [],
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
        name: "Front lawn",
        sprinklerType: input.sprinklerType,
        lawnType: input.lawnType,
        sunExposure: input.sunExposure,
        soilType: input.soilType,
        slope: input.slope,
      },
    ],
  });

  if (!result) return null;

  const program = result.programs.find((p) => p.stations.length > 0);
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
    recommendedStartTime: program?.primaryStartTime ?? "5:00 AM",
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
  const names = ["Front lawn", "Back lawn", "Side yard", "Park strip"];
  return {
    id: `station-${index}-${Date.now()}`,
    name: names[index] ?? `Zone ${index + 1}`,
    sprinklerType: index === 0 ? "spray" : "rotor",
    lawnType: "established-lawn",
    sunExposure: "full-sun",
    soilType: "loam",
    slope: "flat",
  };
}
