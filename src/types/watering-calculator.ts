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
  /** Optional override for testing; defaults to today */
  referenceDate?: Date;
}

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
