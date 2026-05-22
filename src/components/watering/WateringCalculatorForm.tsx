"use client";

import { useMemo, useState } from "react";
import { MONTH_LABELS } from "@/data/seasonalWateringDays";
import { getCitiesByCounty } from "@/data/wateringRestrictions";
import { calculateWateringSchedule } from "@/lib/calculateWateringSchedule";
import type {
  AddressParity,
  County,
  LawnType,
  Slope,
  SoilType,
  SprinklerType,
  SunExposure,
  WateringCalculatorResult,
} from "@/types/watering-calculator";
import { CityRestrictionPanel } from "./CityRestrictionPanel";
import { WateringScheduleResults } from "./WateringScheduleResults";

const selectClass =
  "mt-1 w-full rounded-lg border border-[var(--color-light-blue)] bg-white px-3 py-2.5 text-[var(--color-navy)]";

export function WateringCalculatorForm() {
  const defaultMonth = new Date().getMonth();
  const [county, setCounty] = useState<County>("utah");
  const [cityId, setCityId] = useState("provo");
  const [addressParity, setAddressParity] = useState<AddressParity>("unknown");
  const [sprinklerType, setSprinklerType] = useState<SprinklerType>("spray");
  const [lawnType, setLawnType] = useState<LawnType>("established-lawn");
  const [sunExposure, setSunExposure] = useState<SunExposure>("full-sun");
  const [soilType, setSoilType] = useState<SoilType>("loam");
  const [slope, setSlope] = useState<Slope>("flat");
  const [month, setMonth] = useState(defaultMonth);
  const [result, setResult] = useState<WateringCalculatorResult | null>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const computed = calculateWateringSchedule({
      county,
      cityId,
      addressParity,
      sprinklerType,
      lawnType,
      sunExposure,
      soilType,
      slope,
      month,
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
            Location
          </legend>

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
        </fieldset>

        <fieldset className="mt-8 space-y-5 border-t border-[var(--color-light-blue)] pt-8">
          <legend className="font-display text-lg text-[var(--color-navy)]">
            System &amp; landscape
          </legend>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              Sprinkler type
            </span>
            <select
              value={sprinklerType}
              onChange={(e) =>
                setSprinklerType(e.target.value as SprinklerType)
              }
              className={selectClass}
            >
              <option value="spray">Spray heads</option>
              <option value="rotor">Rotors</option>
              <option value="mp-rotator">MP Rotators</option>
              <option value="drip">Drip irrigation</option>
              <option value="bubbler">Bubblers</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              Lawn / landscape type
            </span>
            <select
              value={lawnType}
              onChange={(e) => setLawnType(e.target.value as LawnType)}
              className={selectClass}
            >
              <option value="established-lawn">Established lawn</option>
              <option value="new-sod">New sod</option>
              <option value="new-seed">New seed</option>
              <option value="trees-shrubs">Trees / shrubs</option>
              <option value="garden-beds">Garden beds</option>
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Sun exposure
              </span>
              <select
                value={sunExposure}
                onChange={(e) =>
                  setSunExposure(e.target.value as SunExposure)
                }
                className={selectClass}
              >
                <option value="full-sun">Full sun</option>
                <option value="mixed">Mixed sun / shade</option>
                <option value="mostly-shade">Mostly shade</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Soil type
              </span>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className={selectClass}
              >
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sandy">Sandy</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Slope
              </span>
              <select
                value={slope}
                onChange={(e) => setSlope(e.target.value as Slope)}
                className={selectClass}
              >
                <option value="flat">Flat</option>
                <option value="moderate">Moderate slope</option>
                <option value="steep">Steep slope</option>
              </select>
            </label>

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
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-8 w-full rounded-full py-3.5 text-base font-bold text-white sm:w-auto sm:px-10"
          style={{ background: "var(--color-pink)" }}
        >
          Calculate Schedule
        </button>
      </div>
    </form>
  );
}
