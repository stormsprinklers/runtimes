import { formatZoneDisplayName } from "@/lib/zoneDisplay";
import { formInputClass, formSelectClass } from "@/lib/ui";
import type {
  LawnType,
  Slope,
  SoilType,
  SprinklerType,
  StationInput,
  SunExposure,
} from "@/types/watering-calculator";

interface StationCardProps {
  station: StationInput;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<StationInput>) => void;
  onRemove: () => void;
}

export function StationCard({
  station,
  index,
  canRemove,
  onChange,
  onRemove,
}: StationCardProps) {
  const zoneNumber = index + 1;

  return (
    <div className="rounded-xl border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/40 p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <label className="min-w-0 flex-1">
          <span className="font-display block text-sm text-[var(--color-navy)]">
            {formatZoneDisplayName(zoneNumber, station.name)}
          </span>
          <span className="mt-1 block text-xs text-[var(--color-navy)]/55">
            Zone name
          </span>
          <input
            type="text"
            value={station.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Front lawn"
            className={`${formInputClass} !mt-1`}
            aria-label={`Name for zone ${zoneNumber}`}
          />
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-[var(--color-pink)] active:bg-[var(--color-light-blue)]/40"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Sprinkler type
          </span>
          <select
            value={station.sprinklerType}
            onChange={(e) =>
              onChange({ sprinklerType: e.target.value as SprinklerType })
            }
            className={formSelectClass}
          >
            <option value="spray">Spray heads</option>
            <option value="rotor">Rotors</option>
            <option value="mp-rotator">MP Rotators</option>
            <option value="drip">Drip</option>
            <option value="bubbler">Bubblers</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Vegetation type
          </span>
          <select
            value={station.lawnType}
            onChange={(e) => onChange({ lawnType: e.target.value as LawnType })}
            className={formSelectClass}
          >
            <option value="established-lawn">Grass / established lawn</option>
            <option value="new-sod">New sod</option>
            <option value="new-seed">New seed</option>
            <option value="shrubs">Shrubs</option>
            <option value="trees">Trees</option>
            <option value="garden-beds">Garden beds</option>
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Sun
            </span>
            <select
              value={station.sunExposure}
              onChange={(e) =>
                onChange({ sunExposure: e.target.value as SunExposure })
              }
              className={formSelectClass}
            >
              <option value="full-sun">Full sun</option>
              <option value="mixed">Mixed</option>
              <option value="mostly-shade">Mostly shade</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
              Soil
            </span>
            <select
              value={station.soilType}
              onChange={(e) =>
                onChange({ soilType: e.target.value as SoilType })
              }
              className={formSelectClass}
            >
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sandy">Sandy</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Slope
          </span>
          <select
            value={station.slope}
            onChange={(e) => onChange({ slope: e.target.value as Slope })}
            className={formSelectClass}
          >
            <option value="flat">Flat</option>
            <option value="moderate">Moderate slope</option>
            <option value="steep">Steep slope</option>
          </select>
        </label>
      </div>
    </div>
  );
}
