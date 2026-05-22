import type { TimelineEntry } from "@/types/watering-calculator";

export function RunTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (!entries.length) return null;

  return (
    <div className="overflow-x-auto">
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
  );
}
