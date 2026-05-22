/** Display label for a controller zone, e.g. "Zone 1 — Front lawn" */
export function formatZoneDisplayName(zoneNumber: number, name: string): string {
  const trimmed = name.trim() || `Zone ${zoneNumber}`;
  if (/^zone\s*\d+/i.test(trimmed)) {
    return trimmed.replace(/\s*-\s*/, " — ");
  }
  return `Zone ${zoneNumber} — ${trimmed}`;
}
