import type { AddressParity, County } from "@/types/calculator";

export interface WateringRules {
  maxDaysPerWeek: number;
  allowedDays: string[];
  /** When true, use oddAllowedDays / evenAllowedDays based on address parity */
  addressBasedSchedule?: boolean;
  oddAllowedDays?: string[];
  evenAllowedDays?: string[];
  /** Resident picks any N days (e.g. Provo Stage 2 voluntary) */
  flexibleSchedule?: boolean;
  maxMinutesPerStation?: number;
  timeRestrictions?: string;
  notes: string[];
  sourceUrl?: string;
}

export interface UtahCity {
  id: string;
  name: string;
  county: County;
  watering: WateringRules;
}

const timeWindow =
  "No outdoor irrigation between 10:00 AM and 6:00 PM (typical Utah rule).";

function rules(
  partial: Omit<WateringRules, "notes"> & { notes?: string[] },
): WateringRules {
  const { notes: extraNotes, ...rest } = partial;
  return {
    timeRestrictions: timeWindow,
    ...rest,
    notes: [
      ...(extraNotes ?? []),
      "Confirm current restrictions with your city — rules change with drought stage.",
    ],
  };
}

/** JVWCD-style 3-day odd/even — Lehi, Sandy, West Jordan, etc. */
const jvwcdStage1 = rules({
  maxDaysPerWeek: 3,
  allowedDays: ["monday", "wednesday", "friday"],
  addressBasedSchedule: true,
  oddAllowedDays: ["monday", "wednesday", "friday"],
  evenAllowedDays: ["tuesday", "thursday", "saturday"],
  notes: [
    "Jordan Valley Water Conservancy District Stage 1 advisory: 3 days/week by address.",
  ],
  sourceUrl: "https://www.lehi-ut.gov/departments/public-works/water-and-sewer/water-conservation/",
});

/** Orem year-round 2-day odd/even */
const oremRules = rules({
  maxDaysPerWeek: 2,
  allowedDays: ["monday", "thursday"],
  addressBasedSchedule: true,
  oddAllowedDays: ["monday", "thursday"],
  evenAllowedDays: ["tuesday", "friday"],
  notes: [
    "Orem year-round ordinance: odd addresses Mon/Thu, even addresses Tue/Fri.",
    "Clay soils: use cycle-and-soak (short runs + soak + repeat).",
  ],
  sourceUrl: "https://orem.gov",
});

/** Provo Stage 2 voluntary — pick any 3 days */
const provoRules = rules({
  maxDaysPerWeek: 3,
  allowedDays: ["monday", "wednesday", "friday"],
  flexibleSchedule: true,
  notes: [
    "Provo Stage 2 advisory: voluntarily limit to 3 days/week (you choose which days).",
  ],
  sourceUrl: "https://www.provo.gov",
});

/** SLC Stage 2 advisory — 3 days flexible */
const slcRules = rules({
  maxDaysPerWeek: 3,
  allowedDays: ["monday", "wednesday", "friday"],
  flexibleSchedule: true,
  notes: ["Salt Lake City Stage 2 water advisory (2026): limit to 3 days/week."],
  sourceUrl: "https://www.slc.gov/utilities/",
});

const defaultRules = rules({
  maxDaysPerWeek: 3,
  allowedDays: ["monday", "wednesday", "friday"],
});

const strictTwoDay = rules({
  maxDaysPerWeek: 2,
  allowedDays: ["monday", "friday"],
  notes: ["This city often enforces stricter 2-day summer schedules."],
});

function city(
  id: string,
  name: string,
  county: County,
  watering: WateringRules,
): UtahCity {
  return { id, name, county, watering };
}

/** Full Storm Sprinklers service area + verified watering patterns where known */
export const utahCities: UtahCity[] = [
  // Utah County
  city("alpine", "Alpine", "utah", defaultRules),
  city("american-fork", "American Fork", "utah", defaultRules),
  city("cedar-hills", "Cedar Hills", "utah", jvwcdStage1),
  city("eagle-mountain", "Eagle Mountain", "utah", defaultRules),
  city("elk-ridge", "Elk Ridge", "utah", defaultRules),
  city("highland", "Highland", "utah", defaultRules),
  city("lehi", "Lehi", "utah", jvwcdStage1),
  city("lindon", "Lindon", "utah", defaultRules),
  city("mapleton", "Mapleton", "utah", defaultRules),
  city("orem", "Orem", "utah", oremRules),
  city("payson", "Payson", "utah", defaultRules),
  city("pleasant-grove", "Pleasant Grove", "utah", defaultRules),
  city("provo", "Provo", "utah", provoRules),
  city("salem", "Salem", "utah", defaultRules),
  city("santaquin", "Santaquin", "utah", defaultRules),
  city("saratoga-springs", "Saratoga Springs", "utah", strictTwoDay),
  city("spanish-fork", "Spanish Fork", "utah", defaultRules),
  city("springville", "Springville", "utah", defaultRules),
  city("vineyard", "Vineyard", "utah", jvwcdStage1),
  city("woodland-hills", "Woodland Hills", "utah", defaultRules),
  // Salt Lake County
  city("bluffdale", "Bluffdale", "salt-lake", jvwcdStage1),
  city("cottonwood-heights", "Cottonwood Heights", "salt-lake", defaultRules),
  city("draper", "Draper", "salt-lake", jvwcdStage1),
  city("herriman", "Herriman", "salt-lake", jvwcdStage1),
  city("holladay", "Holladay", "salt-lake", defaultRules),
  city("kearns", "Kearns", "salt-lake", defaultRules),
  city("magna", "Magna", "salt-lake", defaultRules),
  city("midvale", "Midvale", "salt-lake", defaultRules),
  city("millcreek", "Millcreek", "salt-lake", defaultRules),
  city("murray", "Murray", "salt-lake", defaultRules),
  city("riverton", "Riverton", "salt-lake", jvwcdStage1),
  city("salt-lake-city", "Salt Lake City", "salt-lake", slcRules),
  city("sandy", "Sandy", "salt-lake", jvwcdStage1),
  city("south-jordan", "South Jordan", "salt-lake", jvwcdStage1),
  city("south-salt-lake", "South Salt Lake", "salt-lake", defaultRules),
  city("taylorsville", "Taylorsville", "salt-lake", defaultRules),
  city("west-jordan", "West Jordan", "salt-lake", jvwcdStage1),
  city("west-valley-city", "West Valley City", "salt-lake", defaultRules),
  city("other-utah", "Other Utah County city", "utah", defaultRules),
  city("other-salt-lake", "Other Salt Lake County city", "salt-lake", defaultRules),
];

export function getCityById(id: string): UtahCity | undefined {
  return utahCities.find((c) => c.id === id);
}

export function resolveAllowedDays(
  watering: WateringRules,
  addressParity: AddressParity,
): { days: string[]; maxDays: number; parityNote?: string } {
  if (watering.addressBasedSchedule && addressParity !== "unknown") {
    const days =
      addressParity === "odd"
        ? (watering.oddAllowedDays ?? watering.allowedDays)
        : (watering.evenAllowedDays ?? watering.allowedDays);
    return {
      days,
      maxDays: days.length,
      parityNote:
        addressParity === "odd"
          ? "Odd street address schedule applied."
          : "Even street address schedule applied.",
    };
  }

  if (watering.addressBasedSchedule && addressParity === "unknown") {
    return {
      days: watering.allowedDays,
      maxDays: watering.maxDaysPerWeek,
      parityNote:
        "Select odd or even address for your city's assigned watering days.",
    };
  }

  return {
    days: watering.allowedDays,
    maxDays: watering.maxDaysPerWeek,
  };
}

export const weekdayLabels: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
