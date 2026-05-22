"use client";

import { useMemo, useState } from "react";
import { MONTH_LABELS } from "@/data/seasonalWateringDays";
import { getCitiesByCounty } from "@/data/wateringRestrictions";
import {
  calculateControllerSchedule,
  createDefaultStation,
} from "@/lib/calculateWateringSchedule";
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
const selectClass =
  "mt-1 w-full rounded-lg border border-[var(--color-light-blue)] bg-white px-3 py-2.5 text-[var(--color-navy)]";

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
    const first = getCitiesByCounty(next)[0];
    if (first) setCityId(first.id);
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
      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm sm:p-8">
        <fieldset className="space-y-5">
          <legend className="font-display text-lg text-[var(--color-navy)]">
            Your property
          </legend>
          <p className="text-sm text-[var(--color-navy)]/70">
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
              className={selectClass}
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
              className={selectClass}
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
                className={selectClass}
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
              className={selectClass}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <legend className="font-display text-lg text-[var(--color-navy)]">
              Your stations
            </legend>
            <button
              type="button"
              onClick={addStation}
              disabled={stations.length >= MAX_STATIONS}
              className="rounded-full bg-[var(--color-medium-blue)] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              + Add station
            </button>
          </div>
          <p className="text-sm text-[var(--color-navy)]/70">
            One row per controller station (valve). Programs A, B, and C are
            assigned by landscape type — lawn, drip/shrubs, or new sod/seed.
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
        </fieldset>

        <button
          type="submit"
          className="mt-8 w-full rounded-full py-3.5 text-base font-bold text-white sm:w-auto sm:px-10"
          style={{ background: "var(--color-pink)" }}
        >
          Calculate Controller Program
        </button>
      </div>
    </form>
  );
}
