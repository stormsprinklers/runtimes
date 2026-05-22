/**
 * Seasonal base watering days per week (Utah climate fallback).
 * Replace with live Utah Weekly Lawn Watering Guide API when available.
 */
export const SEASONAL_WATERING_DAYS: Record<number, number> = {
  0: 0, // January
  1: 0, // February
  2: 0, // March
  3: 0, // April
  4: 1, // May
  5: 2, // June
  6: 3, // July
  7: 3, // August
  8: 2, // September
  9: 1, // October
  10: 0, // November
  11: 0, // December
};

export function getBaseDaysPerWeek(month: number): number {
  const m = ((month % 12) + 12) % 12;
  return SEASONAL_WATERING_DAYS[m] ?? 0;
}

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
