import { brand } from "./brand";

const base = brand.siteUrl;

export type NavLink = { label: string; href: string };

/** Verified against stormsprinklers.com homepage HTML (May 2026) */
export const headerNav: NavLink[] = [
  { label: "Contact", href: `${base}/contact` },
  { label: "Pricing", href: `${base}/pricing` },
  { label: "About Us", href: `${base}/about` },
  { label: "Maintenance Plans", href: `${base}/sprinkler-maintenance-plans` },
];

/** Services dropdown — matches main site header menu */
export const servicesNav: NavLink[] = [
  { label: "Sprinkler Repair", href: `${base}/sprinkler-repair` },
  {
    label: "Sprinkler System Installation",
    href: `${base}/sprinkler-system-installation`,
  },
  {
    label: "Stop and Waste Valve Repair",
    href: `${base}/stop-and-waste-valve-repair`,
  },
  { label: "Commercial Irrigation", href: `${base}/commercial-irrigation` },
  {
    label: "Sprinkler System Tune-up",
    href: `${base}/sprinkler-system-tune-up`,
  },
  { label: "Drip Irrigation", href: `${base}/drip-irrigation` },
  { label: "Sprinkler Winterization", href: `${base}/sprinkler-winterization` },
];

export const bookNowUrl = `${base}/booking`;

export const footerSections: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: servicesNav,
  },
  {
    title: "Resources",
    links: [
      { label: "Maintenance Plans", href: `${base}/sprinkler-maintenance-plans` },
      { label: "Accessibility Statement", href: `${base}/accessibility` },
      { label: "Partners", href: `${base}/partners` },
      { label: "Guides", href: `${base}/guides` },
      { label: "Pricing", href: `${base}/pricing` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", href: base },
      { label: "Contact Us", href: `${base}/contact` },
      { label: "About Us", href: `${base}/about` },
      { label: "Reviews", href: `${base}/testimonials` },
      { label: "Careers", href: `${base}/careers` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Warranties", href: `${base}/warranty-conditions` },
      { label: "Privacy Policy", href: `${base}/privacy-policy` },
      { label: "Terms of Service", href: `${base}/terms-of-service` },
    ],
  },
];
