import { brand } from "@/lib/brand";
import type { ProgramId } from "@/types/watering-calculator";

/** Brand color outlines for program tabs A → D */
export const PROGRAM_TAB_COLORS: Record<ProgramId, string> = {
  A: brand.colors.pink,
  B: brand.colors.lightBlue,
  C: brand.colors.mediumBlue,
  D: brand.colors.navy,
};

export const PROGRAM_SHORT_LABELS: Record<ProgramId, string> = {
  A: "Program A",
  B: "Program B",
  C: "Program C",
  D: "Program D",
};

export const PROGRAM_DESCRIPTIONS: Record<ProgramId, string> = {
  A: "Grass & lawn sprinklers",
  B: "Shrubs, beds & drip",
  C: "New sod / seed",
  D: "Trees (deep, infrequent)",
};
