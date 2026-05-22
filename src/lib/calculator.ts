import type {
  CalculatorInput,
  DroughtLevel,
  IrrigationEfficiency,
  ProgramRecommendation,
  ShadeLevel,
  SlopeLevel,
  SoilType,
  VegetationType,
  ZoneInput,
  ZoneSchedule,
} from "@/types/calculator";
import { getCityById, resolveAllowedDays, weekdayLabels } from "./utah-cities";

/** Target weekly depth (inches) for peak summer — Northern Utah turf baseline */
const BASE_WEEKLY_WATER_INCHES = 1.5;

const droughtMultipliers: Record<DroughtLevel, number> = {
  none: 1,
  moderate: 0.85,
  severe: 0.7,
};

const shadeMultipliers: Record<ShadeLevel, number> = {
  "full-sun": 1,
  "partial-shade": 0.75,
  "heavy-shade": 0.55,
};

const slopeSoak: Record<SlopeLevel, { cycleFactor: number; soakMinutes: number }> =
  {
    flat: { cycleFactor: 1, soakMinutes: 0 },
    moderate: { cycleFactor: 2, soakMinutes: 30 },
    steep: { cycleFactor: 3, soakMinutes: 45 },
  };

const soilFrequencyBias: Record<SoilType, number> = {
  sandy: 1.05,
  loam: 1,
  clay: 0.92,
};

const vegetationWeeklyInches: Record<VegetationType, number> = {
  "cool-season-lawn": 1.5,
  "warm-season-lawn": 1.2,
  "mixed-lawn": 1.35,
  shrubs: 0.9,
  trees: 0.75,
  groundcover: 0.8,
  "garden-beds": 1.0,
};

const efficiencyDivisors: Record<IrrigationEfficiency, number> = {
  high: 0.75,
  average: 0.65,
  low: 0.55,
};

const defaultPrecipRates: Record<ZoneInput["emissionType"], number> = {
  "fixed-spray": 1.5,
  "rotating-nozzle": 0.6,
  rotor: 0.45,
  drip: 0.25,
  bubbler: 0.15,
};

function formatDays(days: string[]): string {
  return days.map((d) => weekdayLabels[d] ?? d).join(", ");
}

function computeZoneSchedule(
  zone: ZoneInput,
  weeklyWaterInches: number,
  maxRuntimeMinutes = 20,
): ZoneSchedule {
  const precip =
    zone.precipitationRateInHr > 0
      ? zone.precipitationRateInHr
      : defaultPrecipRates[zone.emissionType];

  const efficiency = efficiencyDivisors[zone.efficiency];
  const shade = shadeMultipliers[zone.shade];
  const soil = soilFrequencyBias[zone.soil];
  const vegBase = vegetationWeeklyInches[zone.vegetation];
  const vegRatio = vegBase / BASE_WEEKLY_WATER_INCHES;

  const zoneWeeklyInches =
    weeklyWaterInches * shade * soil * vegRatio * (BASE_WEEKLY_WATER_INCHES / vegBase);

  const adjustedWeekly = zoneWeeklyInches / efficiency;

  const { cycleFactor, soakMinutes } = slopeSoak[zone.slope];
  const cyclesPerDay = cycleFactor;
  const dailyInches = adjustedWeekly / 3;
  const inchesPerCycle = dailyInches / cyclesPerDay;

  const runtimeHours = inchesPerCycle / precip;
  let runtimeMinutes = Math.round(runtimeHours * 60);
  runtimeMinutes = Math.max(3, Math.min(runtimeMinutes, maxRuntimeMinutes));

  const notes: string[] = [];
  if (zone.slope !== "flat") {
    notes.push(
      `Cycle-and-soak: run ${cyclesPerDay} cycles with ~${soakMinutes} min soak between cycles on ${zone.slope} slope.`,
    );
  }
  if (zone.efficiency === "low") {
    notes.push(
      "Low distribution uniformity — consider head-to-head spacing, matched nozzles, or pressure regulation.",
    );
  }
  if (zone.emissionType === "drip" || zone.emissionType === "bubbler") {
    notes.push("Verify emitter GPH and plant water needs; runtime is approximate for point source.");
  }

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    runtimeMinutes,
    cyclesPerDay,
    soakMinutesBetweenCycles: soakMinutes,
    daysPerWeek: 3,
    weeklyWaterInches: Math.round(adjustedWeekly * 100) / 100,
    notes,
  };
}

export function calculateProgram(input: CalculatorInput): ProgramRecommendation {
  const city = getCityById(input.cityId);
  const cityName = city?.name ?? "Your city";
  const county = city?.county ?? "utah";
  const rules = city?.watering ?? {
    maxDaysPerWeek: 3,
    allowedDays: ["monday", "wednesday", "friday"],
    notes: [],
  };

  const { days: allowedDays, maxDays, parityNote } = resolveAllowedDays(
    rules,
    input.addressParity,
  );

  const droughtMult = droughtMultipliers[input.droughtLevel];
  const droughtAdjustmentPercent = Math.round((1 - droughtMult) * 100);

  let seasonalWeekly = BASE_WEEKLY_WATER_INCHES * droughtMult;
  const maxDaysPerWeek = Math.min(maxDays, 7);
  seasonalWeekly = seasonalWeekly * (maxDaysPerWeek / 3);

  const maxRuntime = input.maxRuntimeMinutes ?? 20;
  const zones = input.zones.map((z) =>
    computeZoneSchedule(z, seasonalWeekly, maxRuntime),
  );

  const warnings: string[] = [];
  if (input.droughtLevel !== "none") {
    warnings.push(
      `Drought restriction (${input.droughtLevel}) applied — reduce watering ${droughtAdjustmentPercent}% vs normal.`,
    );
  }
  if (rules.maxMinutesPerStation) {
    warnings.push(
      `Your city may limit ${rules.maxMinutesPerStation} minutes per station per day — verify locally.`,
    );
  }

  const tips = [
    "Water before 10 AM or after 6 PM to reduce evaporation.",
    "Run a catch-cup test yearly to verify precipitation rate and uniformity.",
    "Adjust monthly: peak summer needs more water; spring and fall need less.",
    "Mow cool-season grass taller in summer to shade roots and reduce stress.",
  ];

  const summary = [
    `Recommended schedule for ${cityName} (${county === "utah" ? "Utah" : "Salt Lake"} County).`,
    rules.flexibleSchedule
      ? `Voluntary limit: ${maxDaysPerWeek} day(s) per week — choose any days that fit your schedule.`
      : `Water on: ${formatDays(allowedDays)} (${maxDaysPerWeek} day(s) per week).`,
    `Target ~${seasonalWeekly.toFixed(2)} inches per week on turf (adjusted for restrictions).`,
  ];

  if (parityNote) summary.push(parityNote);
  if (rules.timeRestrictions) summary.push(rules.timeRestrictions);

  return {
    cityName,
    county,
    allowedDays,
    maxWateringDaysPerWeek: maxDaysPerWeek,
    droughtAdjustmentPercent,
    seasonalWeeklyWaterInches: Math.round(seasonalWeekly * 100) / 100,
    zones: zones.map((z) => ({ ...z, daysPerWeek: maxDaysPerWeek })),
    summary,
    warnings: [...warnings, ...rules.notes],
    tips,
  };
}

export function createDefaultZone(index: number): ZoneInput {
  return {
    id: `zone-${index}-${Date.now()}`,
    name: `Zone ${index + 1}`,
    areaSqFt: 500,
    emissionType: "fixed-spray",
    precipitationRateInHr: 1.5,
    shade: "full-sun",
    slope: "flat",
    soil: "loam",
    vegetation: "cool-season-lawn",
    efficiency: "average",
  };
}
