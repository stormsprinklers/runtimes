export type County = "utah" | "salt-lake";

export type DroughtLevel = "none" | "moderate" | "severe";

export type AddressParity = "odd" | "even" | "unknown";

export type ShadeLevel = "full-sun" | "partial-shade" | "heavy-shade";

export type SlopeLevel = "flat" | "moderate" | "steep";

export type SoilType = "clay" | "loam" | "sandy";

export type EmissionType =
  | "fixed-spray"
  | "rotating-nozzle"
  | "rotor"
  | "drip"
  | "bubbler";

export type VegetationType =
  | "cool-season-lawn"
  | "warm-season-lawn"
  | "mixed-lawn"
  | "shrubs"
  | "trees"
  | "groundcover"
  | "garden-beds";

export type IrrigationEfficiency = "high" | "average" | "low";

export interface ZoneInput {
  id: string;
  name: string;
  areaSqFt: number;
  emissionType: EmissionType;
  precipitationRateInHr: number;
  shade: ShadeLevel;
  slope: SlopeLevel;
  soil: SoilType;
  vegetation: VegetationType;
  efficiency: IrrigationEfficiency;
}

export interface CalculatorInput {
  cityId: string;
  droughtLevel: DroughtLevel;
  addressParity: AddressParity;
  zones: ZoneInput[];
  maxRuntimeMinutes?: number;
}

export interface ZoneSchedule {
  zoneId: string;
  zoneName: string;
  runtimeMinutes: number;
  cyclesPerDay: number;
  soakMinutesBetweenCycles: number;
  daysPerWeek: number;
  weeklyWaterInches: number;
  notes: string[];
}

export interface ProgramRecommendation {
  cityName: string;
  county: County;
  allowedDays: string[];
  maxWateringDaysPerWeek: number;
  droughtAdjustmentPercent: number;
  seasonalWeeklyWaterInches: number;
  zones: ZoneSchedule[];
  summary: string[];
  warnings: string[];
  tips: string[];
}
