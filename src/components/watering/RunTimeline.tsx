import type { TimelineEntry } from "@/types/watering-calculator";

export function RunTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (!entries.length) return null;

  return (
    <>
      <ul className="space-y-2 sm:hidden">
        {entries.map((entry, i) => (
          <li
            key={`${entry.time}-${i}`}
            className="flex gap-3 rounded-lg border border-[var(--color-light-blue)]/80 bg-[var(--color-light-grey)]/40 px-3 py-2.5"
          >
            <span className="shrink-0 font-mono text-sm font-bold text-[var(--color-navy)]">
              {entry.time}
            </span>
            <span className="text-sm leading-snug text-[var(--color-navy)]/85">
              {entry.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-light-blue)] text-xs uppercase tracking-wide text-[var(--color-navy)]/60">
              <th className="py-2 pr-4 font-semibold">Time</th>
              <th className="py-2 font-semibold">What happens</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={`${entry.time}-${i}`}
                className="border-b border-[var(--color-light-blue)]/50 last:border-0"
              >
                <td className="py-2 pr-4 font-mono font-semibold text-[var(--color-navy)] whitespace-nowrap">
                  {entry.time}
                </td>
                <td className="py-2 text-[var(--color-navy)]/85">{entry.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
