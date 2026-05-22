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
    cycles: 1,
    minutesPerCycle: 24,
    soakMinutes: 0,
  },
  rotor: {
    minutesPerWatering: 45,
    cycles: 1,
    minutesPerCycle: 45,
    soakMinutes: 0,
  },
  "mp-rotator": {
    minutesPerWatering: 60,
    cycles: 1,
    minutesPerCycle: 60,
    soakMinutes: 0,
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
