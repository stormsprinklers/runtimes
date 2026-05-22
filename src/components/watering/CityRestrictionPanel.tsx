import {
  getCityRule,
  UTAH_WEEKLY_LAWN_GUIDE_URL,
} from "@/data/wateringRestrictions";
import { RestrictionBadge } from "./RestrictionBadge";

interface CityRestrictionPanelProps {
  cityId: string;
}

export function CityRestrictionPanel({ cityId }: CityRestrictionPanelProps) {
  const city = getCityRule(cityId);
  if (!city) return null;

  return (
    <div
      className="rounded-xl border-l-4 p-4 text-sm"
      style={{
        borderColor: "var(--color-medium-blue)",
        background: "color-mix(in srgb, var(--color-light-blue) 35%, white)",
      }}
    >
      <RestrictionBadge status={city.ruleStatus} />
      <p className="mt-2 font-medium text-[var(--color-navy)]">
        {city.restrictionText}
      </p>
      {city.providerNote && (
        <p className="mt-2 text-[var(--color-navy)]/80">{city.providerNote}</p>
      )}
      <p className="mt-3 text-[var(--color-navy)]/70">
        Verify before programming your controller:
      </p>
      <a
        href={city.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block font-semibold text-[var(--color-medium-blue)] underline"
      >
        {city.sourceLabel} →
      </a>
      {city.ruleStatus === "state-guide-fallback" && (
        <a
          href={UTAH_WEEKLY_LAWN_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block font-semibold text-[var(--color-medium-blue)] underline"
        >
          Utah Weekly Lawn Watering Guide →
        </a>
      )}
    </div>
  );
}
