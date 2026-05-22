import type {
  AutomationStatus,
  County,
  Weekday,
} from "@/types/watering-calculator";

export const UTAH_WEEKLY_LAWN_GUIDE_URL =
  "https://conservewater.utah.gov/weekly-lawn-watering-guide/";

export const SALT_LAKE_COUNTY_RESTRICTIONS_URL =
  "https://www.saltlakecounty.gov/regional-development/Environmental-Sustainability/water/";

/** Primary Salt Lake County cities in the calculator dropdown. */
export const SALT_LAKE_COUNTY_CITY_IDS = [
  "salt-lake-city",
  "west-valley-city",
  "west-jordan",
  "south-jordan",
  "sandy",
  "draper",
  "herriman",
  "riverton",
  "bluffdale",
  "midvale",
  "murray",
  "taylorsville",
  "holladay",
  "cottonwood-heights",
  "millcreek",
  "south-salt-lake",
  "magna",
  "kearns",
] as const;

export interface CityWateringRule {
  id: string;
  county: County;
  city: string;
  ruleStatus: AutomationStatus;
  automationStatus: AutomationStatus;
  sourceUrl: string;
  sourceLabel: string;
  maxDaysPerWeek?: number;
  noWateringStart?: string;
  noWateringEnd?: string;
  oddAddressDays?: Weekday[];
  evenAddressDays?: Weekday[];
  generalAllowedDays?: Weekday[];
  noWateringBeforeDate?: string;
  requiresProviderLookup?: boolean;
  noConsecutiveDays?: boolean;
  waterDaysToUse?: number;
  subtractOneDayFromNormal?: boolean;
  oncePerWeekCap?: boolean;
  everyThirdDayGuidance?: boolean;
  minHoursBetweenCycles?: number;
  recommendationText: string;
  restrictionText: string;
  providerNote?: string;
  paysonPdfReview?: boolean;
}

const NO_10 = "10:00";
const NO_18 = "18:00";

const MWF: Weekday[] = ["monday", "wednesday", "friday"];
const TTS: Weekday[] = ["tuesday", "thursday", "saturday"];
const TTSun: Weekday[] = ["tuesday", "thursday", "sunday"];

function r(
  partial: Omit<CityWateringRule, "ruleStatus" | "automationStatus"> & {
    ruleStatus?: AutomationStatus;
    automationStatus?: AutomationStatus;
  },
): CityWateringRule {
  const status = partial.ruleStatus ?? partial.automationStatus ?? "state-guide-fallback";
  return {
    ...partial,
    ruleStatus: status,
    automationStatus: partial.automationStatus ?? status,
  };
}

const stateFallback = (
  id: string,
  city: string,
  county: County,
  sourceLabel: string,
  sourceUrl: string,
  restrictionText: string,
  extra?: Partial<CityWateringRule>,
): CityWateringRule =>
  r({
    id,
    county,
    city,
    ruleStatus: "state-guide-fallback",
    sourceLabel,
    sourceUrl,
    generalAllowedDays: MWF,
    maxDaysPerWeek: 3,
    restrictionText,
    recommendationText:
      "Follow the Utah Weekly Lawn Watering Guide for watering frequency this week.",
    ...extra,
  });

export const cityWateringRules: CityWateringRule[] = [
  // Utah County
  stateFallback(
    "provo",
    "Provo",
    "utah",
    "Provo Water Efficiency Programs",
    "https://www.provo.gov/407/Water-Efficiency-Programs",
    "No specific enforceable watering schedule verified. Use Utah Weekly Lawn Watering Guide as default schedule source.",
  ),
  stateFallback(
    "orem",
    "Orem",
    "utah",
    "Orem H2Orem Water",
    "https://orem.gov/h2orem/",
    "No specific enforceable watering schedule verified. Orem's page focuses on water supply, storage, reservoirs, and long-term water planning.",
    {
      recommendationText:
        "Use the state weekly guide. Confirm culinary vs pressurized irrigation rules on the city site.",
    },
  ),
  r({
    id: "lehi",
    county: "utah",
    city: "Lehi",
    ruleStatus: "auto-update",
    sourceLabel: "Lehi Pressurized Irrigation",
    sourceUrl:
      "https://www.lehi-ut.gov/departments/public-works/water-and-sewer/pressurized-irrigation/",
    maxDaysPerWeek: 2,
    noConsecutiveDays: true,
    minHoursBetweenCycles: 48,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: ["monday", "thursday"],
    restrictionText:
      "Phase 2 Water Shortage Management Plan: no consecutive-day sprinkler irrigation; max 2 days/week with at least 48 hours between irrigation cycles.",
    recommendationText:
      "Water at most 2 non-consecutive days per week. Wait 48+ hours between irrigation cycles on the same zone.",
  }),
  r({
    id: "american-fork",
    county: "utah",
    city: "American Fork",
    ruleStatus: "auto-update",
    sourceLabel: "American Fork Water Conservation",
    sourceUrl: "https://americanfork.gov/water",
    maxDaysPerWeek: 2,
    waterDaysToUse: 2,
    noWateringBeforeDate: "May 1",
    oddAddressDays: MWF,
    evenAddressDays: TTS,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    restrictionText:
      "Recommended: delay PI watering until May 1, then water only 2 of the 3 assigned days based on address.",
    recommendationText:
      "After May 1, pick 2 of your 3 assigned address-based watering days each week.",
  }),
  r({
    id: "pleasant-grove",
    county: "utah",
    city: "Pleasant Grove",
    ruleStatus: "auto-update",
    sourceLabel: "Pleasant Grove Secondary Water",
    sourceUrl:
      "https://www.pgcityutah.gov/departments/public_works/secondary_water.php",
    maxDaysPerWeek: 3,
    oddAddressDays: MWF,
    evenAddressDays: TTSun,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    restrictionText:
      "Odd addresses: Monday, Wednesday, Friday. Even addresses: Tuesday, Thursday, Sunday. No watering 10 AM–6 PM.",
    recommendationText: "Water only on your assigned address days outside restricted hours.",
  }),
  r({
    id: "lindon",
    county: "utah",
    city: "Lindon",
    ruleStatus: "auto-update",
    sourceLabel: "Lindon Water Division",
    sourceUrl: "https://lindon.gov/342/Water",
    maxDaysPerWeek: 2,
    everyThirdDayGuidance: true,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: ["monday", "thursday"],
    restrictionText:
      "No outdoor watering between 10 AM and 6 PM. Every-third-day watering is generally adequate for established lawns.",
    recommendationText:
      "Use an every-third-day pattern for established turf when possible.",
  }),
  stateFallback(
    "vineyard",
    "Vineyard",
    "utah",
    "Vineyard Water Conservation",
    "https://www.vineyardutah.gov/government/water_conservation.php",
    "No specific city restriction verified. Use Utah Weekly Lawn Watering Guide.",
  ),
  r({
    id: "highland",
    county: "utah",
    city: "Highland",
    ruleStatus: "auto-update",
    sourceLabel: "Highland Pressurized Irrigation",
    sourceUrl: "https://highlandut.gov/197/Pressurized-Irrigation",
    maxDaysPerWeek: 3,
    oddAddressDays: TTS,
    evenAddressDays: MWF,
    noWateringStart: "18:00",
    noWateringEnd: "10:00",
    restrictionText:
      "Even addresses: Monday, Wednesday, Friday. Odd addresses: Tuesday, Thursday, Saturday. No Sunday residential watering. Watering hours generally 6 PM–10 AM.",
    recommendationText: "Do not water on Sunday. Water during evening and early morning hours only.",
  }),
  r({
    id: "alpine",
    county: "utah",
    city: "Alpine",
    ruleStatus: "auto-update",
    sourceLabel: "Alpine Water Conservation",
    sourceUrl: "https://www.alpineut.gov/196/Water-Conservation",
    maxDaysPerWeek: 3,
    oddAddressDays: MWF,
    evenAddressDays: TTS,
    noWateringStart: "19:00",
    noWateringEnd: "07:00",
    restrictionText:
      "Odd addresses: Monday, Wednesday, Friday (7 PM–7 AM). Even addresses: Tuesday, Thursday, Saturday (7 PM–7 AM).",
    recommendationText: "Water only between 7:00 PM and 7:00 AM on assigned days.",
  }),
  r({
    id: "cedar-hills",
    county: "utah",
    city: "Cedar Hills",
    ruleStatus: "manual-review",
    sourceLabel: "Cedar Hills Pressurized Irrigation",
    sourceUrl: "https://www.cedarhills.org/page/pressurized-irrigation-calculator",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "No exact recurring day/time restriction verified. Page references shortened watering season and PI conservation infrastructure.",
    recommendationText:
      "Manual review recommended. Confirm PI rules on the city page; use state guide until verified.",
  }),
  r({
    id: "saratoga-springs",
    county: "utah",
    city: "Saratoga Springs",
    ruleStatus: "auto-update",
    sourceLabel: "Saratoga Springs Water Conservation",
    sourceUrl: "https://www.saratogasprings-ut.gov/369/Water-Conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    restrictionText:
      "Avoid watering between 10 AM and 6 PM; do not irrigate during the heat of the day.",
    recommendationText: "Schedule irrigation before 10 AM or after 6 PM.",
  }),
  stateFallback(
    "eagle-mountain",
    "Eagle Mountain",
    "utah",
    "Eagle Mountain Water Conservation",
    "https://eaglemountain.gov/priorities-plans/water-conservation/",
    "Current enforceable rule not clearly extractable from official text. Use Weekly Lawn Watering Guide unless city posts stricter notice.",
    { recommendationText: "Monitor city page for stricter seasonal notices." },
  ),
  stateFallback(
    "spanish-fork",
    "Spanish Fork",
    "utah",
    "Spanish Fork Water Conservation",
    "https://www.spanishfork.gov/departments/public_works/water/conservation/",
    "No special restriction verified from prior official lookup. Use city conservation/PI pages plus state guide.",
  ),
  r({
    id: "springville",
    county: "utah",
    city: "Springville",
    ruleStatus: "auto-update",
    sourceLabel: "Springville Conserve Water",
    sourceUrl:
      "https://www.springvilleutah.gov/public-works/water/culinary-water/conserve-water/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    restrictionText: "Avoid watering lawns between 10 AM and 6 PM.",
    recommendationText: "Recommendation — confirm any seasonal PI notices on the city site.",
  }),
  r({
    id: "mapleton",
    county: "utah",
    city: "Mapleton",
    ruleStatus: "manual-review",
    sourceLabel: "Mapleton PI Responsibilities",
    sourceUrl:
      "https://www.mapleton.org/departments/public_works/pressurized_irrigation/index.php",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "No current restriction verified. Monitor PI/responsibilities page and use state guide fallback.",
    recommendationText: "Monitor Mapleton PI page for updates.",
  }),
  r({
    id: "payson",
    county: "utah",
    city: "Payson",
    ruleStatus: "manual-review",
    sourceLabel: "Payson PI Watering Schedule PDF",
    sourceUrl: "https://www.paysonutah.gov/472/Pressurized-Irrigation-Zones",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    paysonPdfReview: true,
    restrictionText:
      "Official PI schedule asks residents to avoid watering between 10 AM and 6 PM; PDF parsing needed for full schedule.",
    recommendationText:
      "Download the official Payson PI watering schedule PDF for exact assigned days.",
  }),
  r({
    id: "salem",
    county: "utah",
    city: "Salem",
    ruleStatus: "auto-update",
    sourceLabel: "Salem Mayor's Message",
    sourceUrl: "https://www.salemutah.gov/",
    maxDaysPerWeek: 3,
    oddAddressDays: MWF,
    evenAddressDays: TTS,
    generalAllowedDays: MWF,
    restrictionText:
      "Mayor's message: at minimum, odd addresses water Monday, Wednesday, Friday; also follow Utah Weekly Lawn Watering Guide.",
    recommendationText:
      "Odd addresses: at minimum Mon/Wed/Fri. Even addresses: confirm on city site; follow state guide.",
  }),
  r({
    id: "santaquin",
    county: "utah",
    city: "Santaquin",
    ruleStatus: "manual-review",
    sourceLabel: "Santaquin Pressurized Irrigation",
    sourceUrl: "https://www.santaquin.gov/utilities/page/pressurized-irrigation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "No specific current day/time restriction verified. PI page gives startup/shutdown timing — monitor for updates.",
    recommendationText: "Monitor Santaquin PI page for seasonal open/close dates.",
  }),
  r({
    id: "elk-ridge",
    county: "utah",
    city: "Elk Ridge",
    ruleStatus: "manual-review",
    sourceLabel: "Elk Ridge Water Conservation Plan (PDF)",
    sourceUrl: "https://www.elkridgeutah.gov/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "No current live restriction page verified. Conservation plan has drought-response framework, but not live current rules.",
    recommendationText: "Refer to Elk Ridge water conservation plan for drought stages.",
  }),
  stateFallback(
    "woodland-hills",
    "Woodland Hills",
    "utah",
    "Utah Weekly Lawn Watering Guide",
    UTAH_WEEKLY_LAWN_GUIDE_URL,
    "No current city-specific restriction verified. Use state guide fallback.",
  ),
  stateFallback(
    "genola",
    "Genola",
    "utah",
    "Utah Weekly Lawn Watering Guide",
    UTAH_WEEKLY_LAWN_GUIDE_URL,
    "No current city-specific restriction verified. Use state guide fallback.",
  ),
  stateFallback(
    "goshen",
    "Goshen",
    "utah",
    "Utah Weekly Lawn Watering Guide",
    UTAH_WEEKLY_LAWN_GUIDE_URL,
    "No current city-specific restriction verified. Use state guide fallback.",
  ),
  // Salt Lake County
  r({
    id: "salt-lake-city",
    county: "salt-lake",
    city: "Salt Lake City",
    ruleStatus: "provider-aware",
    sourceLabel: "SLC Drought Information",
    sourceUrl:
      "https://www.slc.gov/utilities/conservation/drought-information/",
    maxDaysPerWeek: 3,
    subtractOneDayFromNormal: true,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: MWF,
    restrictionText:
      "Stage 2 Water Shortage Advisory. Voluntary indoor/outdoor reductions requested; target reduction of 10 million gallons/day across service area.",
    recommendationText: "Water one day less than normal this week when possible.",
  }),
  r({
    id: "west-valley-city",
    county: "salt-lake",
    city: "West Valley City",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "GHID Water Conservation",
    sourceUrl: "https://www.ghid.gov/water-conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote:
      "Large areas served by Granger-Hunter Improvement District. GHID selected Drought Level II on April 21, 2026; voluntary conservation measures apply.",
    restrictionText:
      "Provider lookup required. GHID Drought Level II voluntary conservation in large areas.",
    recommendationText: "Confirm whether your address is GHID or another provider.",
  }),
  r({
    id: "west-jordan",
    county: "salt-lake",
    city: "West Jordan",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "West Jordan Water Conservation FAQ",
    sourceUrl:
      "https://www.westjordan.utah.gov/save-water-in-west-jordan/water-conservation-faq/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote:
      "Follow the Utah Weekly Lawn Watering Guide; test soil moisture before starting seasonal irrigation.",
    restrictionText:
      "No mandatory day-of-week schedule. City promotes weather-based watering via the state weekly guide and soil-moisture checks.",
    recommendationText:
      "Use the weekly lawn guide and dig down ~6 inches — water only when soil is dry.",
  }),
  r({
    id: "south-jordan",
    county: "salt-lake",
    city: "South Jordan",
    ruleStatus: "auto-update",
    sourceLabel: "South Jordan Water Smart SoJo",
    sourceUrl: "https://www.sjc.utah.gov/531/Water-Smart-SoJo",
    maxDaysPerWeek: 1,
    oncePerWeekCap: true,
    noWateringBeforeDate: "May 15",
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: ["saturday"],
    restrictionText:
      "Level 2 water availability response: do not water until May 15, then water only once per week; 10% reduction goal.",
    recommendationText: "After May 15, limit to one watering day per week.",
  }),
  r({
    id: "sandy",
    county: "salt-lake",
    city: "Sandy",
    ruleStatus: "auto-update",
    sourceLabel: "Sandy Water Conservation",
    sourceUrl: "https://www.sandy.utah.gov/255/Water-Conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    restrictionText:
      "Permanent ordinance restricts outdoor watering between 10 AM and 6 PM, except landscape establishment and repairs.",
    recommendationText:
      "Exceptions for new landscape establishment and repairs per city ordinance.",
  }),
  r({
    id: "draper",
    county: "salt-lake",
    city: "Draper",
    ruleStatus: "auto-update",
    sourceLabel: "Draper Reduction in Water Use Needed",
    sourceUrl:
      "https://www.draperutah.gov/news/news-post/reduction-in-water-use-needed/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "Commercial properties must water only between 6 PM and 10 AM. No current restricted residential hours; conservation is encouraged.",
    recommendationText:
      "Residential: follow state guide. Commercial: water only 6 PM–10 AM.",
  }),
  r({
    id: "herriman",
    county: "salt-lake",
    city: "Herriman",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Herriman Water Conservation",
    sourceUrl: "https://www.herriman.gov/water-conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "Identify your water provider before setting watering days.",
    restrictionText:
      "No strict citywide watering schedule verified. Use provider lookup and state/JVWCD guide.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
  r({
    id: "riverton",
    county: "salt-lake",
    city: "Riverton",
    ruleStatus: "recommendation-only",
    sourceLabel: "Riverton Secondary Water",
    sourceUrl: "https://www.rivertonutah.gov/water/secondary.php",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    restrictionText:
      "No current water restrictions. City encourages reducing sprinkler system output by 10–20%.",
    recommendationText: "Voluntary: reduce sprinkler system output by 10–20%.",
  }),
  r({
    id: "bluffdale",
    county: "salt-lake",
    city: "Bluffdale",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Bluffdale Water Conservation",
    sourceUrl: "https://bluffdale.gov/326/Water-Conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "Confirm provider (Jordan Valley, culinary district, etc.).",
    restrictionText:
      "No strict current watering schedule verified. Use provider lookup and state/JVWCD guide.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
  r({
    id: "midvale",
    county: "salt-lake",
    city: "Midvale",
    ruleStatus: "auto-update",
    sourceLabel: "Midvale Drought Response",
    sourceUrl:
      "https://www.midvale.utah.gov/government/departments/public_works/public_utilities_divisions/drought.php",
    maxDaysPerWeek: 2,
    noWateringBeforeDate: "May 15",
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: ["monday", "thursday"],
    restrictionText:
      "Not enforcing mandatory restrictions right now, but strongly encourages reduced use; delay watering until May 15 and no more than 2 days/week. Drought surcharge active.",
    recommendationText:
      "Strong recommendation: after May 15, water no more than 2 days per week.",
  }),
  r({
    id: "murray",
    county: "salt-lake",
    city: "Murray",
    ruleStatus: "provider-aware",
    sourceLabel: "Murray Water Conservation",
    sourceUrl: "https://www.murray.utah.gov/255/Water-Conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    providerNote:
      "Some areas may also fall under SLC Public Utilities — SLC Stage 2 may apply.",
    restrictionText:
      "Prior official source: no pressurized landscape irrigation between 10 AM and 6 PM.",
    recommendationText: "Water outside 10 AM–6 PM. Confirm if SLC utilities serves your address.",
  }),
  r({
    id: "taylorsville",
    county: "salt-lake",
    city: "Taylorsville",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Taylorsville-Bennion Improvement District",
    sourceUrl: "https://www.tbid.gov/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "TBID serves much of Taylorsville — verify your district.",
    restrictionText:
      "No strict citywide schedule verified. Check TBID and state guide.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
  r({
    id: "holladay",
    county: "salt-lake",
    city: "Holladay",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Holliday Water Company",
    sourceUrl: "https://www.hollidaywatercompany.com/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote:
      "Provider-specific. SLC Public Utilities and Holliday Water Company serve parts of the area.",
    restrictionText: "Provider-specific watering rules may apply by address.",
    recommendationText: "Identify your provider before finalizing watering days.",
  }),
  r({
    id: "cottonwood-heights",
    county: "salt-lake",
    city: "Cottonwood Heights",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "SLC Public Utilities Drought (Cottonwood Heights)",
    sourceUrl:
      "https://www.slc.gov/utilities/conservation/drought-information/",
    maxDaysPerWeek: 3,
    subtractOneDayFromNormal: true,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    providerNote:
      "SLC Public Utilities serves most Cottonwood Heights addresses. City also has water-wise landscaping rules.",
    restrictionText:
      "Provider-specific. SLC Stage 2 voluntary reductions may apply for SLC Public Utilities customers.",
    recommendationText:
      "If served by SLC Public Utilities, follow SLC Stage 2 drought guidance.",
  }),
  r({
    id: "millcreek",
    county: "salt-lake",
    city: "Millcreek",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "SLC Public Utilities Drought (Millcreek)",
    sourceUrl:
      "https://www.slc.gov/utilities/conservation/drought-information/",
    maxDaysPerWeek: 3,
    subtractOneDayFromNormal: true,
    generalAllowedDays: MWF,
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    providerNote:
      "SLC Public Utilities serves portions of Millcreek — verify your provider.",
    restrictionText:
      "Provider-specific. SLC Stage 2 voluntary reductions may apply for SLC Public Utilities customers.",
    recommendationText:
      "If served by SLC Public Utilities, follow SLC Stage 2 drought guidance.",
  }),
  r({
    id: "south-salt-lake",
    county: "salt-lake",
    city: "South Salt Lake",
    ruleStatus: "provider-aware",
    sourceLabel: "South Salt Lake Water Conservation",
    sourceUrl: "https://www.sslc.gov/water",
    maxDaysPerWeek: 1,
    oncePerWeekCap: true,
    noWateringBeforeDate: "May 15",
    noWateringStart: NO_10,
    noWateringEnd: NO_18,
    generalAllowedDays: ["wednesday"],
    restrictionText:
      "JVWCD Level 2 guidance: delay watering until May 15, then once per week.",
    recommendationText: "After May 15, one watering day per week.",
  }),
  r({
    id: "magna",
    county: "salt-lake",
    city: "Magna",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Magna Water Conservation & Drought Info",
    sourceUrl: "https://magnawaterut.gov/",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "Magna Water District serves most of Magna township.",
    restrictionText:
      "No strict current watering schedule verified. Use Magna Water District and state guide.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
  r({
    id: "kearns",
    county: "salt-lake",
    city: "Kearns",
    ruleStatus: "provider-aware",
    sourceLabel: "Kearns Improvement District Conservation",
    sourceUrl: "https://www.kidwater4ut.gov/conservation",
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote:
      "Kearns Improvement District (KID) serves Kearns Metro Township — follow the Utah Weekly Lawn Watering Guide.",
    restrictionText:
      "No district day-of-week irrigation schedule published. Tiered rates and conservation programs encourage efficient use.",
    recommendationText:
      "Follow the Utah Weekly Lawn Watering Guide and KID conservation resources.",
  }),
  r({
    id: "white-city",
    county: "salt-lake",
    city: "White City",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Salt Lake County Water Restrictions Resource",
    sourceUrl: SALT_LAKE_COUNTY_RESTRICTIONS_URL,
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "Use county resource to find your water provider.",
    restrictionText:
      "No city-specific restriction verified. Use Salt Lake County utility/provider lookup.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
  r({
    id: "copperton",
    county: "salt-lake",
    city: "Copperton",
    ruleStatus: "provider-lookup",
    requiresProviderLookup: true,
    sourceLabel: "Salt Lake County Water Restrictions Resource",
    sourceUrl: SALT_LAKE_COUNTY_RESTRICTIONS_URL,
    maxDaysPerWeek: 3,
    generalAllowedDays: MWF,
    providerNote: "Use county resource to find your water provider.",
    restrictionText:
      "No city-specific restriction verified. Use Salt Lake County utility/provider lookup.",
    recommendationText: "Use state guide until provider rules are confirmed.",
  }),
];

export function getCityRule(cityId: string): CityWateringRule | undefined {
  return cityWateringRules.find((c) => c.id === cityId);
}

export function getCitiesByCounty(county: County): CityWateringRule[] {
  const inCounty = cityWateringRules.filter((c) => c.county === county);
  if (county !== "salt-lake") return inCounty;

  const byId = new Map(inCounty.map((c) => [c.id, c]));
  const primary = SALT_LAKE_COUNTY_CITY_IDS.map((id) => byId.get(id)).filter(
    (c): c is CityWateringRule => c !== undefined,
  );
  const extra = inCounty.filter(
    (c) => !(SALT_LAKE_COUNTY_CITY_IDS as readonly string[]).includes(c.id),
  );
  return [...primary, ...extra];
}

export const weekdayLabels: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
