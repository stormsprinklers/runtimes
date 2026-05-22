import type {
  LawnType,
  Slope,
  SoilType,
  SprinklerType,
  StationInput,
  SunExposure,
} from "@/types/watering-calculator";

const selectClass =
  "mt-1 w-full rounded-lg border border-[var(--color-light-blue)] bg-white px-3 py-2 text-sm text-[var(--color-navy)]";

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
  return (
    <div className="rounded-xl border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <input
          type="text"
          value={station.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="font-display flex-1 rounded border border-transparent bg-transparent text-base text-[var(--color-navy)] focus:border-[var(--color-medium-blue)] focus:bg-white focus:px-2"
          aria-label={`Station ${index + 1} name`}
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm font-medium text-[var(--color-pink)] hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Sprinkler type
          </span>
          <select
            value={station.sprinklerType}
            onChange={(e) =>
              onChange({ sprinklerType: e.target.value as SprinklerType })
            }
            className={selectClass}
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
            Landscape type
          </span>
          <select
            value={station.lawnType}
            onChange={(e) => onChange({ lawnType: e.target.value as LawnType })}
            className={selectClass}
          >
            <option value="established-lawn">Established lawn</option>
            <option value="new-sod">New sod</option>
            <option value="new-seed">New seed</option>
            <option value="trees-shrubs">Trees / shrubs</option>
            <option value="garden-beds">Garden beds</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Sun
          </span>
          <select
            value={station.sunExposure}
            onChange={(e) =>
              onChange({ sunExposure: e.target.value as SunExposure })
            }
            className={selectClass}
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
            onChange={(e) => onChange({ soilType: e.target.value as SoilType })}
            className={selectClass}
          >
            <option value="clay">Clay</option>
            <option value="loam">Loam</option>
            <option value="sandy">Sandy</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
            Slope
          </span>
          <select
            value={station.slope}
            onChange={(e) => onChange({ slope: e.target.value as Slope })}
            className={selectClass}
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
