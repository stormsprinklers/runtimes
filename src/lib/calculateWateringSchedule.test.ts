import { describe, expect, it } from "vitest";
import { getBaseDaysPerWeek } from "@/data/seasonalWateringDays";
import {
  applyCityDayLimits,
  assignProgram,
  calculateControllerSchedule,
  calculateWateringSchedule,
  createDefaultStation,
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

describe("assignProgram", () => {
  it("groups lawn to A and drip to B", () => {
    const lawn = createDefaultStation(0);
    const drip = { ...createDefaultStation(1), lawnType: "garden-beds" as const, sprinklerType: "drip" as const };
    expect(assignProgram(lawn)).toBe("A");
    expect(assignProgram(drip)).toBe("B");
  });

  it("groups new sod to C", () => {
    const sod = { ...createDefaultStation(0), lawnType: "new-sod" as const };
    expect(assignProgram(sod)).toBe("C");
  });
});

describe("calculateControllerSchedule", () => {
  const julyDate = new Date(2026, 6, 15);

  it("3 stations produce lawn + drip programs", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        { ...createDefaultStation(0), name: "Front lawn" },
        { ...createDefaultStation(1), name: "Back lawn" },
        {
          ...createDefaultStation(2),
          name: "Beds",
          lawnType: "garden-beds",
          sprinklerType: "drip",
        },
      ],
    });
    expect(result?.programs.length).toBe(2);
    expect(result?.programs.find((p) => p.programId === "A")?.stations.length).toBe(2);
    expect(result?.programs.find((p) => p.programId === "B")?.stations.length).toBe(1);
  });

  it("Lehi lawn program has 2 days per week", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "lehi",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [createDefaultStation(0), createDefaultStation(1)],
    });
    const programA = result?.programs.find((p) => p.programId === "A");
    expect(programA?.daysPerWeek).toBe(2);
  });

  it("clay + steep station gets extra cycle and 45 min soak", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        {
          ...createDefaultStation(0),
          soilType: "clay",
          slope: "steep",
        },
      ],
    });
    const station = result?.programs[0]?.stations[0];
    expect(station?.cycles).toBe(4);
    expect(station?.soakMinutes).toBe(45);
  });

  it("cycle-soak program gets multiple start times", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        {
          ...createDefaultStation(0),
          soilType: "clay",
          slope: "flat",
        },
      ],
    });
    const program = result?.programs[0];
    expect(program?.usesCycleSoak).toBe(true);
    expect(program?.startTimes.length).toBeGreaterThan(1);
  });

  it("mixed sun on two lawn stations triggers hydrozone warning", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        { ...createDefaultStation(0), sunExposure: "full-sun" },
        { ...createDefaultStation(1), sunExposure: "mostly-shade" },
      ],
    });
    expect(result?.hydrozoneWarnings.length).toBeGreaterThan(0);
  });

  it("American Fork in April yields 0 watering days", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "american-fork",
        addressParity: "odd",
        month: 3,
        referenceDate: new Date(2026, 3, 20),
      },
      stations: [createDefaultStation(0)],
    });
    expect(result?.cityDaysPerWeek).toBe(0);
    expect(result?.programs[0]?.wateringDays.length).toBe(0);
    expect(result?.warnings.some((w) => w.includes("May 1"))).toBe(true);
  });

  it("builds a run-order timeline", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        createDefaultStation(0),
        { ...createDefaultStation(1), name: "Station 2" },
      ],
    });
    expect(result?.timeline.length).toBeGreaterThan(0);
  });
});

describe("calculateWateringSchedule (single-zone wrapper)", () => {
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
});

describe("resolveAllowedWateringDays", () => {
  it("Pleasant Grove odd uses Mon/Wed/Fri", () => {
    const rule = getCityRule("pleasant-grove")!;
    const days = resolveAllowedWateringDays(3, rule, "odd");
    expect(days).toEqual(["monday", "wednesday", "friday"]);
  });
});

describe("parseNoWaterBeforeDate", () => {
  it("parses May 15", () => {
    const d = parseNoWaterBeforeDate("May 15", 2026);
    expect(d?.getMonth()).toBe(4);
    expect(d?.getDate()).toBe(15);
  });
});
