import type { AutomationStatus } from "@/types/watering-calculator";

const styles: Record<
  AutomationStatus,
  { bg: string; border: string; label: string }
> = {
  "auto-update": {
    bg: "color-mix(in srgb, var(--color-medium-blue) 18%, white)",
    border: "var(--color-medium-blue)",
    label: "Active restriction",
  },
  "recommendation-only": {
    bg: "var(--color-light-grey)",
    border: "var(--color-medium-blue)",
    label: "Recommendation only",
  },
  "provider-lookup": {
    bg: "color-mix(in srgb, var(--color-pink) 14%, white)",
    border: "var(--color-pink)",
    label: "Provider lookup required",
  },
  "state-guide-fallback": {
    bg: "color-mix(in srgb, var(--color-light-blue) 55%, white)",
    border: "var(--color-medium-blue)",
    label: "State guide fallback",
  },
  "manual-review": {
    bg: "color-mix(in srgb, var(--color-pink) 18%, white)",
    border: "var(--color-pink)",
    label: "Manual review",
  },
  "provider-aware": {
    bg: "color-mix(in srgb, var(--color-pink) 12%, white)",
    border: "var(--color-pink)",
    label: "Provider-aware",
  },
};

export function RestrictionBadge({
  status,
  label,
}: {
  status: AutomationStatus;
  label?: string;
}) {
  const s = styles[status];
  return (
    <span
      className="inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-bold leading-snug text-[var(--color-navy)]"
      style={{ borderColor: s.border, background: s.bg }}
    >
      {label ?? s.label}
    </span>
  );
}
