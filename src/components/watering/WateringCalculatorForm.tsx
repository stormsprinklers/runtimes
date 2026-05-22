"use client";

import { useMemo, useState } from "react";
import { MONTH_LABELS } from "@/data/seasonalWateringDays";
import { getCitiesByCounty } from "@/data/wateringRestrictions";
import {
  calculateControllerSchedule,
  createDefaultStation,
} from "@/lib/calculateWateringSchedule";
import {
  btnPrimaryClass,
  cardShellClass,
  formSelectClass,
} from "@/lib/ui";
import type {
  AddressParity,
  ControllerCalculatorResult,
  County,
  StationInput,
} from "@/types/watering-calculator";
import { CityRestrictionPanel } from "./CityRestrictionPanel";
import { StationCard } from "./StationCard";
import { WateringScheduleResults } from "./WateringScheduleResults";

const MAX_STATIONS = 8;

export function WateringCalculatorForm() {
  const defaultMonth = new Date().getMonth();
  const [county, setCounty] = useState<County>("utah");
  const [cityId, setCityId] = useState("provo");
  const [addressParity, setAddressParity] = useState<AddressParity>("unknown");
  const [month, setMonth] = useState(defaultMonth);
  const [stations, setStations] = useState<StationInput[]>([
    createDefaultStation(0),
    createDefaultStation(1),
  ]);
  const [result, setResult] = useState<ControllerCalculatorResult | null>(
    null,
  );

  const cities = useMemo(() => getCitiesByCounty(county), [county]);

  const needsParity = useMemo(() => {
    const city = cities.find((c) => c.id === cityId);
    return !!(city?.oddAddressDays || city?.evenAddressDays);
  }, [cities, cityId]);

  function handleCountyChange(next: County) {
    setCounty(next);
    const list = getCitiesByCounty(next);
    const defaultId = next === "salt-lake" ? "salt-lake-city" : "provo";
    const pick = list.find((c) => c.id === defaultId) ?? list[0];
    if (pick) setCityId(pick.id);
    setResult(null);
  }

  function updateStation(id: string, patch: Partial<StationInput>) {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function addStation() {
    if (stations.length >= MAX_STATIONS) return;
    setStations((prev) => [...prev, createDefaultStation(prev.length)]);
  }

  function removeStation(id: string) {
    if (stations.length <= 1) return;
    setStations((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const computed = calculateControllerSchedule({
      site: {
        county,
        cityId,
        addressParity,
        month,
      },
      stations,
    });
    setResult(computed);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    return (
      <WateringScheduleResults
        result={result}
        onReset={() => setResult(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cardShellClass}>
        <fieldset className="space-y-5">
          <legend className="font-display text-lg text-[var(--color-navy)]">
            Your property
          </legend>
          <p className="text-sm leading-relaxed text-[var(--color-navy)]/70">
            City rules apply to your whole system. Stations below get their own
            runtimes and are grouped into programs automatically.
          </p>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              County
            </span>
            <select
              value={county}
              onChange={(e) => handleCountyChange(e.target.value as County)}
              className={formSelectClass}
            >
              <option value="utah">Utah County</option>
              <option value="salt-lake">Salt Lake County</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              City
            </span>
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setResult(null);
              }}
              className={formSelectClass}
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.city}
                </option>
              ))}
            </select>
          </label>

          <CityRestrictionPanel cityId={cityId} />

          {needsParity && (
            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Address parity
              </span>
              <select
                value={addressParity}
                onChange={(e) =>
                  setAddressParity(e.target.value as AddressParity)
                }
                className={formSelectClass}
              >
                <option value="unknown">Unknown / Not applicable</option>
                <option value="odd">Odd (1, 3, 5…)</option>
                <option value="even">Even (0, 2, 4…)</option>
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              Month / season
            </span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={formSelectClass}
            >
              {MONTH_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                  {i === defaultMonth ? " (current)" : ""}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="mt-8 space-y-4 border-t border-[var(--color-light-blue)] pt-8">
          <legend className="font-display text-lg text-[var(--color-navy)]">
            Your zones
          </legend>
          <p className="text-sm leading-relaxed text-[var(--color-navy)]/70">
            One card per controller zone. Name each zone (e.g. front lawn).
            Programs A–D group zones that share run days and start times.
          </p>

          <div className="space-y-4">
            {stations.map((station, index) => (
              <StationCard
                key={station.id}
                station={station}
                index={index}
                canRemove={stations.length > 1}
                onChange={(patch) => updateStation(station.id, patch)}
                onRemove={() => removeStation(station.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addStation}
            disabled={stations.length >= MAX_STATIONS}
            className="min-h-12 w-full rounded-full bg-[var(--color-medium-blue)] px-4 py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 sm:min-h-11 sm:py-2"
          >
            + Add station
          </button>
        </fieldset>
      </div>

      <div className="safe-bottom sticky bottom-0 z-10 -mx-4 border-t border-[var(--color-light-blue)] bg-[color-mix(in_srgb,var(--color-light-grey)_92%,white)] px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          className={btnPrimaryClass}
          style={{ background: "var(--color-pink)" }}
        >
          Calculate Controller Program
        </button>
      </div>
    </form>
  );
}
