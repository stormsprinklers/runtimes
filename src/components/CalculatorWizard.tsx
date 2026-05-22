"use client";

import { useState } from "react";
import { calculateProgram, createDefaultZone } from "@/lib/calculator";
import { bookNowUrl } from "@/lib/navigation";
import { getCityById, utahCities } from "@/lib/utah-cities";
import type {
  AddressParity,
  CalculatorInput,
  DroughtLevel,
  EmissionType,
  IrrigationEfficiency,
  ProgramRecommendation,
  ShadeLevel,
  SlopeLevel,
  SoilType,
  VegetationType,
  ZoneInput,
} from "@/types/calculator";
import { ProgramResults } from "./ProgramResults";

const STEPS = ["Location", "System", "Zones", "Review"] as const;

const emissionOptions: { value: EmissionType; label: string }[] = [
  { value: "fixed-spray", label: "Fixed spray heads" },
  { value: "rotating-nozzle", label: "Rotating nozzles (MPR)" },
  { value: "rotor", label: "Gear-driven rotors" },
  { value: "drip", label: "Drip irrigation" },
  { value: "bubbler", label: "Bubblers" },
];

export function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const [cityId, setCityId] = useState("orem");
  const [addressParity, setAddressParity] = useState<AddressParity>("unknown");
  const [droughtLevel, setDroughtLevel] = useState<DroughtLevel>("none");
  const [maxRuntimeMinutes, setMaxRuntimeMinutes] = useState(20);
  const [zones, setZones] = useState<ZoneInput[]>([createDefaultZone(0)]);
  const [program, setProgram] = useState<ProgramRecommendation | null>(null);

  const updateZone = (id: string, patch: Partial<ZoneInput>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...patch } : z)),
    );
  };

  const addZone = () => {
    setZones((prev) => [...prev, createDefaultZone(prev.length)]);
  };

  const removeZone = (id: string) => {
    if (zones.length <= 1) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handleSubmit = () => {
    const input: CalculatorInput = {
      cityId,
      droughtLevel,
      addressParity,
      zones,
      maxRuntimeMinutes,
    };
    setProgram(calculateProgram(input));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (program) {
    return (
      <ProgramResults
        program={program}
        onReset={() => {
          setProgram(null);
          setStep(0);
        }}
      />
    );
  }

  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              i === step
                ? "bg-[var(--color-navy)] text-white"
                : i < step
                  ? "bg-[var(--color-medium-blue)] text-white"
                  : "bg-[var(--color-light-grey)] text-[var(--color-navy)]/60"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[var(--color-light-blue)] bg-white p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl text-[var(--color-navy)]">
                Where do you live?
              </h2>
              <p className="mt-1 text-sm text-[var(--color-navy)]/70">
                We apply your city&apos;s typical watering day limits. Always
                confirm current ordinances with your municipality.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                City
              </span>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] bg-white px-3 py-2.5 text-[var(--color-navy)]"
              >
                <optgroup label="Utah County">
                  {utahCities
                    .filter((c) => c.county === "utah")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Salt Lake County">
                  {utahCities
                    .filter((c) => c.county === "salt-lake")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </label>
            {getCityById(cityId)?.watering.addressBasedSchedule && (
              <label className="block">
                <span className="text-sm font-semibold text-[var(--color-navy)]">
                  Street address number
                </span>
                <select
                  value={addressParity}
                  onChange={(e) =>
                    setAddressParity(e.target.value as AddressParity)
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2.5"
                >
                  <option value="unknown">Not sure / choose below</option>
                  <option value="odd">Odd (1, 3, 5…)</option>
                  <option value="even">Even (0, 2, 4…)</option>
                </select>
                <span className="mt-1 block text-xs text-[var(--color-navy)]/60">
                  {cityId === "orem"
                    ? "Orem: odd → Mon & Thu; even → Tue & Fri."
                    : "JVWCD cities: odd → Mon/Wed/Fri; even → Tue/Thu/Sat."}
                </span>
              </label>
            )}
            <label className="block">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Drought / water restrictions
              </span>
              <select
                value={droughtLevel}
                onChange={(e) =>
                  setDroughtLevel(e.target.value as DroughtLevel)
                }
                className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2.5"
              >
                <option value="none">None — normal watering</option>
                <option value="moderate">Moderate restrictions (~15% reduction)</option>
                <option value="severe">Severe restrictions (~30% reduction)</option>
              </select>
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl text-[var(--color-navy)]">
                System basics
              </h2>
              <p className="mt-1 text-sm text-[var(--color-navy)]/70">
                How many zones does your controller have? Add one entry per
                watering zone.
              </p>
            </div>
            <label className="block max-w-xs">
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                Max runtime per cycle (minutes)
              </span>
              <input
                type="number"
                min={5}
                max={60}
                value={maxRuntimeMinutes}
                onChange={(e) =>
                  setMaxRuntimeMinutes(Number(e.target.value) || 20)
                }
                className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2.5"
              />
              <span className="mt-1 block text-xs text-[var(--color-navy)]/60">
                Helps cap runtimes for clay soil or slope cycle-soak.
              </span>
            </label>
            <p className="text-sm font-medium text-[var(--color-navy)]">
              {zones.length} zone{zones.length !== 1 ? "s" : ""} configured — edit
              details in the next step.
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-[var(--color-navy)]">
                Zone details
              </h2>
              <button
                type="button"
                onClick={addZone}
                className="rounded-full bg-[var(--color-medium-blue)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                + Add Zone
              </button>
            </div>

            {zones.map((zone, index) => (
              <div
                key={zone.id}
                className="rounded-xl border border-[var(--color-light-blue)] bg-[var(--color-light-grey)]/30 p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) =>
                      updateZone(zone.id, { name: e.target.value })
                    }
                    className="font-display rounded border border-transparent bg-transparent text-lg text-[var(--color-navy)] focus:border-[var(--color-medium-blue)] focus:bg-white focus:px-2"
                  />
                  {zones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeZone(zone.id)}
                      className="text-sm text-[var(--color-pink)] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Area (sq ft)
                    </span>
                    <input
                      type="number"
                      min={50}
                      value={zone.areaSqFt}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          areaSqFt: Number(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Precipitation rate (in/hr)
                    </span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.05}
                      value={zone.precipitationRateInHr}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          precipitationRateInHr: Number(e.target.value) || 0,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Emission type
                    </span>
                    <select
                      value={zone.emissionType}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          emissionType: e.target.value as EmissionType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      {emissionOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Vegetation
                    </span>
                    <select
                      value={zone.vegetation}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          vegetation: e.target.value as VegetationType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      <option value="cool-season-lawn">Cool-season lawn</option>
                      <option value="warm-season-lawn">Warm-season lawn</option>
                      <option value="mixed-lawn">Mixed lawn</option>
                      <option value="shrubs">Shrubs</option>
                      <option value="trees">Trees</option>
                      <option value="groundcover">Groundcover</option>
                      <option value="garden-beds">Garden beds</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Shade
                    </span>
                    <select
                      value={zone.shade}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          shade: e.target.value as ShadeLevel,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      <option value="full-sun">Full sun</option>
                      <option value="partial-shade">Partial shade</option>
                      <option value="heavy-shade">Heavy shade</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Slope
                    </span>
                    <select
                      value={zone.slope}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          slope: e.target.value as SlopeLevel,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      <option value="flat">Flat</option>
                      <option value="moderate">Moderate</option>
                      <option value="steep">Steep</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Soil type
                    </span>
                    <select
                      value={zone.soil}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          soil: e.target.value as SoilType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      <option value="clay">Clay</option>
                      <option value="loam">Loam</option>
                      <option value="sandy">Sandy</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase text-[var(--color-navy)]/60">
                      Irrigation efficiency
                    </span>
                    <select
                      value={zone.efficiency}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          efficiency: e.target.value as IrrigationEfficiency,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--color-light-blue)] px-3 py-2"
                    >
                      <option value="high">High (uniform coverage)</option>
                      <option value="average">Average</option>
                      <option value="low">Low (dry spots, overspray)</option>
                    </select>
                  </label>
                </div>
                {index < zones.length - 1 && (
                  <hr className="mt-6 border-[var(--color-light-blue)]" />
                )}
              </div>
            ))}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl text-[var(--color-navy)]">
              Review
            </h2>
            <p className="text-sm text-[var(--color-navy)]/70">
              City:{" "}
              <strong>
                {utahCities.find((c) => c.id === cityId)?.name ?? cityId}
              </strong>
              {" · "}
              Drought: <strong>{droughtLevel}</strong>
              {" · "}
              {zones.length} zone(s)
            </p>
            <ul className="divide-y divide-[var(--color-light-blue)] rounded-lg border border-[var(--color-light-blue)]">
              {zones.map((z) => (
                <li
                  key={z.id}
                  className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-[var(--color-navy)]">
                    {z.name}
                  </span>
                  <span className="text-[var(--color-navy)]/70">
                    {z.vegetation.replace(/-/g, " ")} · {z.emissionType.replace(/-/g, " ")} ·{" "}
                    {z.shade.replace(/-/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--color-navy)]/60">
              This tool provides educational estimates, not engineering specs.
              For controller programming on-site,{" "}
              <a
                href={bookNowUrl}
                className="text-[var(--color-medium-blue)] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                book a tune-up
              </a>
              .
            </p>
          </section>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded-full px-5 py-2.5 font-semibold text-[var(--color-navy)] disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full px-6 py-2.5 font-bold text-white"
              style={{ background: "var(--color-medium-blue)" }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full px-6 py-2.5 font-bold text-white"
              style={{ background: "var(--color-pink)" }}
            >
              Calculate Program
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
