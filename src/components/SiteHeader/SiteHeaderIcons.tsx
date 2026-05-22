/** SVG icons from stormsprinklers.com SiteHeader */

export function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

export function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      fill="currentColor"
      aria-hidden
    >
      <path d="M25.2 11.3C22.1 8.2 17 8.2 13.9 11.3L8.7 16.5C4.8 20.4 3.6 26.2 5.9 31.2C11.6 43.8 19.7 55.1 30.2 64.7C39.9 75.2 51.2 83.3 63.8 89C68.8 91.3 74.6 90.1 78.5 86.2L83.7 81C86.8 77.9 86.8 72.8 83.7 69.7L69.2 55.2C66.3 52.3 61.7 52.1 58.5 54.7L51.8 60.1C49.9 61.6 47.2 61.7 45.2 60.2C39.7 56.1 34.9 51.3 30.8 45.8C29.3 43.8 29.4 41.1 30.9 39.2L36.3 32.5C38.9 29.3 38.7 24.7 35.8 21.8L25.2 11.3Z" />
    </svg>
  );
}

export function CalendarBookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8 28A10 10 0 0118 18h56a10 10 0 0110 10v44a10 10 0 01-10 10H18a10 10 0 01-10-10V28zm10 4h56v40H18V32z"
      />
      <rect x="24" y="6" width="12" height="18" rx="6" />
      <rect x="56" y="6" width="12" height="18" rx="6" />
      <path
        d="M30 52l12 12 22-24"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function MenuIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

export function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
