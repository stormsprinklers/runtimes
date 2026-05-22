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
  LawnType,
  Slope,
  SoilType,
  SunExposure,
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
  WateringCalculatorResult["badge"],
  string
> = {
  "auto-update": "Active restriction",
  "state-guide-fallback": "State guide fallback",
  "provider-lookup": "Provider lookup required",
  "manual-review": "Manual review",
  "recommendation-only": "Recommendation only",
  "provider-aware": "Provider-aware",
};

/** Parse "May 1" / "May 15" into Date for current year */
export function parseNoWaterBeforeDate(
  text: string,
  referenceYear: number,
): Date | null {
  const match = text.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})$/i);
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

/** Pick N maximally spaced days from a sorted list of weekdays */
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

/** Evenly spaced days across the week when no city assignment */
export function pickSpacedFromWeek(
  count: number,
  noConsecutive: boolean,
): Weekday[] {
  if (count <= 0) return [];
  if (count === 1) return ["wednesday"];
  if (count === 2) return noConsecutive ? ["monday", "thursday"] : ["tuesday", "friday"];
  if (count === 3) return ["monday", "wednesday", "friday"];
  if (count === 4) return ["monday", "tuesday", "thursday", "saturday"];
  if (count >= 5) return ["monday", "tuesday", "wednesday", "thursday", "friday"];
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

function buildLawnNotes(lawnType: LawnType, sprinklerMismatch: boolean): string[] {
  const notes: string[] = [];
  if (lawnType === "new-sod" || lawnType === "new-seed") {
    notes.push(
      "New sod/seed may need more frequent shallow watering during establishment — many cities allow exceptions; verify with your city.",
    );
  }
  if (lawnType === "trees-shrubs" && sprinklerMismatch) {
    notes.push(
      "Trees and shrubs often need drip or bubblers rather than spray — consider zone-specific equipment.",
    );
  }
  if (lawnType === "garden-beds" && sprinklerMismatch) {
    notes.push("Garden beds are often best served by drip irrigation.");
  }
  return notes;
}

export function calculateWateringSchedule(
  input: WateringCalculatorInput,
): WateringCalculatorResult | null {
  const rule = getCityRule(input.cityId);
  if (!rule) return null;

  const today = input.referenceDate ?? new Date();
  const baseDays = getBaseDaysPerWeek(input.month);
  const daysPerWeek = applyCityDayLimits(baseDays, rule, today);

  const wateringDays = resolveAllowedWateringDays(
    daysPerWeek,
    rule,
    input.addressParity,
  );

  const baseRuntime = SPRINKLER_RUNTIME_DEFAULTS[input.sprinklerType];
  const sunMult = SUN_MULTIPLIERS[input.sunExposure];
  const soilMult = SOIL_MULTIPLIERS[input.soilType];
  const slopeMult = SLOPE_MULTIPLIERS[input.slope];

  const adjustedTotal = Math.round(
    baseRuntime.minutesPerWatering * sunMult * soilMult * slopeMult,
  );

  let cycles = baseRuntime.cycles;
  let soakMinutes = baseRuntime.soakMinutes;

  const needsCycleSoak =
    input.soilType === "clay" ||
    input.slope === "moderate" ||
    input.slope === "steep";

  if (needsCycleSoak) {
    cycles += 1;
    soakMinutes = 45;
  }

  const minutesPerCycle = Math.max(1, Math.ceil(adjustedTotal / cycles));

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

  const sprinklerMismatch =
    (input.lawnType === "trees-shrubs" || input.lawnType === "garden-beds") &&
    (input.sprinklerType === "spray" || input.sprinklerType === "rotor");

  notes.push(...buildLawnNotes(input.lawnType, sprinklerMismatch));

  const timeRestriction = formatTimeRestriction(rule);
  if (timeRestriction) notes.push(timeRestriction);

  if (wateringDays.length > 0) {
    notes.push(
      `Recommended watering days: ${wateringDays.map((d) => weekdayLabels[d]).join(", ")}.`,
    );
  }

  const usesStateGuide = rule.ruleStatus === "state-guide-fallback";

  return {
    cityName: rule.city,
    county: rule.county,
    daysPerWeek,
    wateringDays,
    totalMinutes: adjustedTotal,
    cycles,
    minutesPerCycle,
    soakMinutes,
    recommendedStartTime: "5:00 AM",
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
    baseDaysFromSeason: baseDays,
    timeRestriction,
  };
}
