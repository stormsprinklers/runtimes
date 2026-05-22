import type { SprinklerType } from "@/types/watering-calculator";

export interface SprinklerRuntimeDefault {
  minutesPerWatering: number;
  cycles: number;
  minutesPerCycle: number;
  soakMinutes: number;
}

export const SPRINKLER_RUNTIME_DEFAULTS: Record<
  SprinklerType,
  SprinklerRuntimeDefault
> = {
  spray: {
    minutesPerWatering: 24,
    cycles: 3,
    minutesPerCycle: 8,
    soakMinutes: 30,
  },
  rotor: {
    minutesPerWatering: 45,
    cycles: 3,
    minutesPerCycle: 15,
    soakMinutes: 30,
  },
  "mp-rotator": {
    minutesPerWatering: 60,
    cycles: 3,
    minutesPerCycle: 20,
    soakMinutes: 30,
  },
  drip: {
    minutesPerWatering: 45,
    cycles: 1,
    minutesPerCycle: 45,
    soakMinutes: 0,
  },
  bubbler: {
    minutesPerWatering: 10,
    cycles: 1,
    minutesPerCycle: 10,
    soakMinutes: 0,
  },
};
