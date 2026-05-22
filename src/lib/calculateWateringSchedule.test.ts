import { describe, expect, it } from "vitest";
import { getBaseDaysPerWeek } from "@/data/seasonalWateringDays";
import {
  applyCityDayLimits,
  assignProgram,
  calculateControllerSchedule,
  calculateWateringSchedule,
  createDefaultStation,
  formatMinutesToTime,
  parseNoWaterBeforeDate,
  parseTimeToMinutes,
  resolveAllowedWateringDays,
} from "@/lib/calculateWateringSchedule";
import {
  getCitiesByCounty,
  getCityRule,
  SALT_LAKE_COUNTY_CITY_IDS,
} from "@/data/wateringRestrictions";

describe("seasonalWateringDays", () => {
  it("April has 1 base day", () => {
    expect(getBaseDaysPerWeek(3)).toBe(1);
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

  it("SLC keeps at least one watering day in May", () => {
    const rule = getCityRule("salt-lake-city")!;
    const days = applyCityDayLimits(2, rule, new Date(2026, 4, 20));
    expect(days).toBe(1);
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
  it("groups lawn to A and drip shrubs to B", () => {
    const lawn = createDefaultStation(0);
    const drip = {
      ...createDefaultStation(1),
      lawnType: "shrubs" as const,
      sprinklerType: "drip" as const,
    };
    expect(assignProgram(lawn)).toBe("A");
    expect(assignProgram(drip)).toBe("B");
  });

  it("groups new sod to C and trees to D", () => {
    const sod = { ...createDefaultStation(0), lawnType: "new-sod" as const };
    const trees = { ...createDefaultStation(1), lawnType: "trees" as const };
    expect(assignProgram(sod)).toBe("C");
    expect(assignProgram(trees)).toBe("D");
  });
});

describe("calculateControllerSchedule", () => {
  const julyDate = new Date(2026, 6, 15);

  it("returns all four program tabs", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [createDefaultStation(0)],
    });
    expect(result?.programs).toHaveLength(4);
    expect(result?.programs.map((p) => p.programId)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
  });

  it("formats zone display names", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [{ ...createDefaultStation(0), name: "Front lawn" }],
    });
    const zone = result?.programs.find((p) => p.programId === "A")
      ?.zoneNames[0];
    expect(zone).toBe("Zone 1 — Front lawn");
  });

  it("3 zones produce lawn + drip programs", () => {
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

  it("clay + steep grass gets cycle-soak start times", () => {
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
    const program = result?.programs.find((p) => p.programId === "A");
    expect(program?.usesCycleSoak).toBe(true);
    expect(program?.startTimeCount).toBeGreaterThan(1);
    expect(program?.cycleSoakNote).toBeTruthy();
  });

  it("trees do not get cycle-soak", () => {
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
          lawnType: "trees",
          sprinklerType: "drip",
          soilType: "clay",
          slope: "steep",
        },
      ],
    });
    const program = result?.programs.find((p) => p.programId === "D");
    expect(program?.usesCycleSoak).toBe(false);
    expect(program?.scheduleMode).toBe("interval");
    expect(program?.startTimeCount).toBe(1);
  });

  it("program start time count always matches each zone cycle count", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [createDefaultStation(0)],
    });
    const program = result?.programs.find((p) => p.programId === "A")!;
    expect(program.startTimeCount).toBe(program.startTimes.length);
    for (const station of program.stations) {
      expect(station.cycles).toBe(program.startTimeCount);
    }
  });

  it("default spray lawn uses one start time per day across multiple watering days", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [createDefaultStation(0)],
    });
    const program = result?.programs.find((p) => p.programId === "A")!;
    expect(program.daysPerWeek).toBeGreaterThanOrEqual(2);
    expect(program.startTimeCount).toBe(1);
    expect(program.stations[0].cycles).toBe(1);
    expect(program.stations[0].totalMinutes).toBeGreaterThan(0);
    expect(result?.notes.some((n) => n.includes("once per watering day"))).toBe(
      true,
    );
  });

  it("once-per-week cap uses multiple start times on the single watering day", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "salt-lake",
        cityId: "south-jordan",
        addressParity: "unknown",
        month: 5,
        referenceDate: new Date(2026, 5, 20),
      },
      stations: [createDefaultStation(0)],
    });
    const program = result?.programs.find((p) => p.programId === "A")!;
    expect(program.daysPerWeek).toBe(1);
    expect(program.startTimeCount).toBeGreaterThan(1);
  });

  it("spaces cycle-soak start times by full program pass", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        { ...createDefaultStation(0), soilType: "clay", slope: "flat" },
        { ...createDefaultStation(1), name: "Back", soilType: "clay", slope: "flat" },
        { ...createDefaultStation(2), name: "Side", soilType: "clay", slope: "flat" },
      ],
    });
    const program = result?.programs.find((p) => p.programId === "A");
    expect(program?.startTimes.length).toBeGreaterThan(1);
    const t0 = parseTimeToMinutes(program!.startTimes[0]);
    const t1 = parseTimeToMinutes(program!.startTimes[1]);
    const passMin = program!.stations.reduce(
      (s, st) => s + st.minutesPerCycle,
      0,
    );
    expect(t1 - t0).toBeGreaterThanOrEqual(passMin);
  });

  it("grass program starts in the morning after evening programs", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: julyDate,
      },
      stations: [
        { ...createDefaultStation(0), name: "Lawn" },
        {
          ...createDefaultStation(1),
          name: "Shrubs",
          lawnType: "shrubs",
          sprinklerType: "drip",
        },
      ],
    });
    const grass = result?.programs.find((p) => p.programId === "A");
    const shrubs = result?.programs.find((p) => p.programId === "B");
    const grassMin = parseTimeToMinutes(grass!.startTimes[0]);
    const shrubMin = parseTimeToMinutes(shrubs!.startTimes[0]);
    expect(shrubMin).toBeGreaterThanOrEqual(19 * 60);
    expect(grassMin).toBeGreaterThanOrEqual(4 * 60);
    expect(grassMin).toBeLessThan(8 * 60);
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
    expect(result?.programs.find((p) => p.programId === "A")?.wateringDays.length).toBe(0);
    expect(result?.warnings.some((w) => w.includes("May 1"))).toBe(true);
  });
});

describe("calculateWateringSchedule (single-zone wrapper)", () => {
  it("clay + steep grass adds cycle-soak cycles matching start times", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "utah",
        cityId: "provo",
        addressParity: "unknown",
        month: 6,
        referenceDate: new Date(2026, 6, 15),
      },
      stations: [
        {
          ...createDefaultStation(0),
          soilType: "clay",
          slope: "steep",
        },
      ],
    });
    const program = result?.programs.find((p) => p.programId === "A")!;
    expect(program.startTimeCount).toBe(3);
    expect(program.stations[0].cycles).toBe(3);
    expect(program.daysPerWeek).toBeGreaterThanOrEqual(2);
    expect(program.stations[0].soakMinutes).toBe(45);
  });
});

describe("Salt Lake County cities", () => {
  it("includes all 18 primary cities with official source URLs", () => {
    const slc = getCitiesByCounty("salt-lake");
    const primary = slc.slice(0, SALT_LAKE_COUNTY_CITY_IDS.length);
    expect(primary.map((c) => c.id)).toEqual([...SALT_LAKE_COUNTY_CITY_IDS]);
    for (const city of primary) {
      expect(city.sourceUrl).toMatch(/^https:\/\//);
      expect(city.sourceLabel.length).toBeGreaterThan(0);
      expect(city.county).toBe("salt-lake");
    }
  });

  it("Salt Lake City returns watering days and zone runtimes in May", () => {
    const result = calculateControllerSchedule({
      site: {
        county: "salt-lake",
        cityId: "salt-lake-city",
        addressParity: "unknown",
        month: 4,
        referenceDate: new Date(2026, 4, 20),
      },
      stations: [createDefaultStation(0)],
    });
    expect(result?.cityDaysPerWeek).toBeGreaterThan(0);
    const programA = result?.programs.find((p) => p.programId === "A");
    expect(programA?.scheduleLabel).not.toContain("No outdoor watering");
    expect(programA?.stations[0]?.totalMinutes).toBeGreaterThan(0);
    expect(programA?.startTimes.length).toBeGreaterThan(0);
  });

  it("South Jordan caps at one day per week in summer", () => {
    const rule = getCityRule("south-jordan")!;
    const days = applyCityDayLimits(3, rule, new Date(2026, 5, 20));
    expect(days).toBe(1);
  });

  it("Midvale recommends at most two days after May 15", () => {
    const rule = getCityRule("midvale")!;
    const days = applyCityDayLimits(3, rule, new Date(2026, 5, 20));
    expect(days).toBe(2);
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

describe("formatMinutesToTime", () => {
  it("formats 4 AM after extended timeline", () => {
    expect(formatMinutesToTime(24 * 60 + 4 * 60)).toMatch(/4:00 AM/i);
  });
});
