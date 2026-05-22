import { describe, expect, it } from "vitest";
import { getBaseDaysPerWeek } from "@/data/seasonalWateringDays";
import {
  applyCityDayLimits,
  calculateWateringSchedule,
  parseNoWaterBeforeDate,
  resolveAllowedWateringDays,
} from "@/lib/calculateWateringSchedule";
import { getCityRule } from "@/data/wateringRestrictions";

describe("seasonalWateringDays", () => {
  it("April has 0 base days", () => {
    expect(getBaseDaysPerWeek(3)).toBe(0);
  });

  it("July has 3 base days", () => {
    expect(getBaseDaysPerWeek(6)).toBe(3);
  });
});

describe("applyCityDayLimits", () => {
  it("SLC subtracts one day from normal in peak season", () => {
    const rule = getCityRule("salt-lake-city")!;
    const days = applyCityDayLimits(3, rule, new Date(2026, 6, 15));
    expect(days).toBe(2);
  });

  it("American Fork returns 0 before May 1", () => {
    const rule = getCityRule("american-fork")!;
    const days = applyCityDayLimits(2, rule, new Date(2026, 3, 20));
    expect(days).toBe(0);
  });

  it("South Jordan caps at 1 day after May 15", () => {
    const rule = getCityRule("south-jordan")!;
    const days = applyCityDayLimits(3, rule, new Date(2026, 5, 20));
    expect(days).toBe(1);
  });
});

describe("resolveAllowedWateringDays", () => {
  it("Pleasant Grove odd uses Mon/Wed/Fri", () => {
    const rule = getCityRule("pleasant-grove")!;
    const days = resolveAllowedWateringDays(3, rule, "odd");
    expect(days).toEqual(["monday", "wednesday", "friday"]);
  });

  it("Lehi picks 2 non-consecutive days", () => {
    const rule = getCityRule("lehi")!;
    const days = resolveAllowedWateringDays(2, rule, "unknown");
    expect(days.length).toBe(2);
    const indices = days.map((d) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(d),
    );
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i] - indices[i - 1]).toBeGreaterThan(1);
    }
  });
});

describe("calculateWateringSchedule", () => {
  it("clay + steep adds a cycle with 45 min soak", () => {
    const result = calculateWateringSchedule({
      county: "utah",
      cityId: "provo",
      addressParity: "unknown",
      sprinklerType: "spray",
      lawnType: "established-lawn",
      sunExposure: "mixed",
      soilType: "clay",
      slope: "steep",
      month: 6,
      referenceDate: new Date(2026, 6, 15),
    });
    expect(result?.cycles).toBe(4);
    expect(result?.soakMinutes).toBe(45);
  });

  it("provider lookup cities include warning", () => {
    const result = calculateWateringSchedule({
      county: "salt-lake",
      cityId: "west-valley-city",
      addressParity: "unknown",
      sprinklerType: "rotor",
      lawnType: "established-lawn",
      sunExposure: "full-sun",
      soilType: "loam",
      slope: "flat",
      month: 6,
      referenceDate: new Date(2026, 6, 15),
    });
    expect(result?.warnings.some((w) => w.includes("water provider"))).toBe(true);
  });
});

describe("parseNoWaterBeforeDate", () => {
  it("parses May 15", () => {
    const d = parseNoWaterBeforeDate("May 15", 2026);
    expect(d?.getMonth()).toBe(4);
    expect(d?.getDate()).toBe(15);
  });
});
