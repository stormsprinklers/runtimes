export type County = "utah" | "salt-lake";

export type AddressParity = "odd" | "even" | "unknown";

export type SprinklerType = "spray" | "rotor" | "mp-rotator" | "drip" | "bubbler";

export type LawnType =
  | "established-lawn"
  | "new-sod"
  | "new-seed"
  | "trees-shrubs"
  | "garden-beds";

export type SunExposure = "full-sun" | "mixed" | "mostly-shade";

export type SoilType = "clay" | "loam" | "sandy" | "unknown";

export type Slope = "flat" | "moderate" | "steep";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type AutomationStatus =
  | "auto-update"
  | "state-guide-fallback"
  | "provider-lookup"
  | "manual-review"
  | "recommendation-only"
  | "provider-aware";

export type ProgramId = "A" | "B" | "C";

export type CycleSoakMethod = "built-in" | "multiple-start-times";

export interface StationInput {
  id: string;
  name: string;
  sprinklerType: SprinklerType;
  lawnType: LawnType;
  sunExposure: SunExposure;
  soilType: SoilType;
  slope: Slope;
}

export interface SiteInput {
  county: County;
  cityId: string;
  addressParity: AddressParity;
  month: number;
  referenceDate?: Date;
}

export interface ControllerCalculatorInput {
  site: SiteInput;
  stations: StationInput[];
}

/** @deprecated Use ControllerCalculatorInput — kept for single-zone wrapper */
export interface WateringCalculatorInput {
  county: County;
  cityId: string;
  addressParity: AddressParity;
  sprinklerType: SprinklerType;
  lawnType: LawnType;
  sunExposure: SunExposure;
  soilType: SoilType;
  slope: Slope;
  month: number;
  referenceDate?: Date;
}

export interface StationSchedule {
  stationId: string;
  name: string;
  programId: ProgramId;
  totalMinutes: number;
  cycles: number;
  minutesPerCycle: number;
  soakMinutes: number;
  cycleSoakMethod: CycleSoakMethod;
  warnings: string[];
}

export interface ProgramSchedule {
  programId: ProgramId;
  label: string;
  daysPerWeek: number;
  wateringDays: Weekday[];
  startTimes: string[];
  primaryStartTime: string;
  stations: StationSchedule[];
  totalRunMinutes: number;
  usesCycleSoak: boolean;
  cycleSoakExplanation: string;
}

export interface TimelineEntry {
  time: string;
  label: string;
}

export interface ControllerCalculatorResult {
  cityName: string;
  county: County;
  baseDaysFromSeason: number;
  cityDaysPerWeek: number;
  warnings: string[];
  notes: string[];
  badge: AutomationStatus;
  badgeLabel: string;
  sourceUrl: string;
  sourceLabel: string;
  restrictionText: string;
  recommendationText: string;
  providerNote?: string;
  stateGuideUrl?: string;
  timeRestriction?: string;
  programs: ProgramSchedule[];
  stationOrder: string[];
  timeline: TimelineEntry[];
  hydrozoneWarnings: string[];
  startTimeMistakeNote: string;
}

/** @deprecated Single-zone result — use ControllerCalculatorResult */
export interface WateringCalculatorResult {
  cityName: string;
  county: County;
  daysPerWeek: number;
  wateringDays: Weekday[];
  totalMinutes: number;
  cycles: number;
  minutesPerCycle: number;
  soakMinutes: number;
  recommendedStartTime: string;
  warnings: string[];
  notes: string[];
  badge: AutomationStatus;
  badgeLabel: string;
  sourceUrl: string;
  sourceLabel: string;
  restrictionText: string;
  recommendationText: string;
  providerNote?: string;
  stateGuideUrl?: string;
  baseDaysFromSeason: number;
  timeRestriction?: string;
}

export interface StationRuntimeCore {
  totalMinutes: number;
  cycles: number;
  minutesPerCycle: number;
  soakMinutes: number;
  needsCycleSoak: boolean;
}
