import { formatAud } from "./money";

export type SeoSpecialty = {
  slug: string;
  name: string;
  pluralName: string;
  description: string;
};

export type SeoPlace = {
  specialty: SeoSpecialty;
  state?: { slug: string; name: string; abbrev: string };
  city?: { slug: string; name: string };
  suburb?: { slug: string; name: string };
};

export const CHILD_CHECK: Record<string, string> = {
  nsw: "Working with Children Check (WWCC)",
  vic: "Working with Children Check (WWC)",
  qld: "Blue Card",
  wa: "Working with Children Check",
  sa: "Working with Children Check",
  tas: "Working with Vulnerable People (WWVP) registration",
  act: "Working with Vulnerable People (WWVP) registration",
  nt: "Ochre Card (Working with Children Clearance)",
};

export const GENERIC_KEYWORDS: Record<string, string[]> = {
  "aged-care": [
    "aged care worker",
    "in-home aged care",
    "home care worker",
    "aged care at home",
    "personal care aged care",
  ],
  nannies: ["nanny", "hire a nanny", "nanny Australia", "live-out nanny", "full time nanny"],
  babysitters: ["babysitter", "babysitter near me", "evening babysitter", "casual babysitter"],
  "disability-support": [
    "NDIS support worker",
    "disability support worker",
    "NDIS carer",
    "support worker near me",
  ],
  "special-needs": ["special needs carer", "autism support worker", "additional needs carer"],
  housekeeping: ["housekeeper", "domestic assistance", "cleaner for families"],
  "companion-care": ["companion carer", "elderly companion", "social support worker"],
  nursing: ["in-home nurse", "registered nurse at home", "AHPRA nurse", "enrolled nurse home care"],
  respite: ["respite carer", "overnight respite", "in-home respite"],
  "after-school-care": ["after school nanny", "school pickup nanny", "after school care"],
  "personal-care": ["personal care assistant", "PCA", "daily living support"],
};

const SPECIALTY_GUIDE: Record<string, { hire: string; checks: string; typical: string }> = {
  "aged-care": {
    hire: "Most families start with weekday mornings or overnight sits, then lock a standing roster once the match feels right.",
    checks: "Ask for Aged Care Worker Screening and a current National Police Check. Clinical tasks should sit with an AHPRA-registered nurse.",
    typical: "Weekday personal care, meal prep, medication prompts and companion visits after hospital discharge.",
  },
  nannies: {
    hire: "Share school hours, number of children and whether you need live-out, casual or a standing term-time roster.",
    checks: "A current state Working with Children Check and first aid are the baseline. Ask how they handle illness days and school holidays.",
    typical: "School runs, meals, homework and a written handover so you know how the afternoon went.",
  },
  babysitters: {
    hire: "Date-night bookings work best with Instant Book. Recurring Saturday nights should be a standing request.",
    checks: "WWCC (or the local equivalent) plus first aid. Meet in the home before the first evening if the children are young.",
    typical: "Dinner, bedtime and a text when everyone is down — usually 4–6 hours.",
  },
  "disability-support": {
    hire: "Share the NDIS plan goal, shift length and whether you need community access, personal care or SIL cover.",
    checks: "NDIS Worker Screening is required for most risk-assessed roles. Many families also ask for a WWCC and first aid.",
    typical: "Community access, appointments, weekend recreation and personal care with shift notes for the plan manager.",
  },
  "special-needs": {
    hire: "Describe regulation needs, school pickup and whether siblings will be home. Ask about positive behaviour support experience.",
    checks: "WWCC plus NDIS screening when the work is funded. First aid and a calm handover matter more than a long bio.",
    typical: "After-school regulation, community access and sibling-inclusive play.",
  },
  housekeeping: {
    hire: "Weekly or fortnightly resets are the usual start. List pets, products and whether laundry is included.",
    checks: "A National Police Check is the usual baseline for unsupervised home access.",
    typical: "Cleans, laundry, fridge restock and an end-of-week reset.",
  },
  "companion-care": {
    hire: "Say whether you want outings, appointments or a sitting visit. Language and cultural fit are fair to ask about.",
    checks: "Police check and aged care screening when the client is older. WWCC if children are in the home.",
    typical: "Coffee outings, GP visits and company so family carers can work or rest.",
  },
  nursing: {
    hire: "List clinical tasks — insulin, PEG, wound care, palliative support — so only AHPRA-registered nurses apply.",
    checks: "AHPRA registration is non-negotiable. Pair it with aged care screening when the client is older.",
    typical: "Hospital-in-the-home style visits, medication and family updates to the GP.",
  },
  respite: {
    hire: "Overnight and weekend blocks are the usual ask. Say if sundowning or transfers are involved.",
    checks: "Aged care screening, police check and first aid. Male or female carer preference can be stated up front.",
    typical: "Night sits so family carers can sleep, plus weekend cover for travel.",
  },
  "after-school-care": {
    hire: "Name the school, pickup time and whether sport runs are included. Term-time rosters fill first.",
    checks: "WWCC and first aid. A reliable car matters if you need multi-school pickups.",
    typical: "Gate pickup, homework, snacks and dinner before parents finish work.",
  },
  "personal-care": {
    hire: "Be specific about showers, hoists and preferred gender of carer. Morning slots book out first.",
    checks: "Aged care or NDIS screening depending on the client, plus a police check.",
    typical: "Showering, dressing, mobility and meal support at home.",
  },
};

export function childCheckLabel(stateSlug?: string) {
  if (!stateSlug) return "Working with Children Check (or the local equivalent)";
  return CHILD_CHECK[stateSlug] ?? "Working with Children Check";
}

export function placeLabel(place: SeoPlace) {
  if (place.suburb && place.city && place.state) {
    return `${place.suburb.name}, ${place.city.name} ${place.state.abbrev}`;
  }
  if (place.city && place.state) return `${place.city.name}, ${place.state.abbrev}`;
  if (place.state) return place.state.name;
  return "Australia";
}

export function locationPreposition(place: SeoPlace) {
  return `in ${placeLabel(place)}`;
}

export function landingH1(place: SeoPlace) {
  return `${place.specialty.pluralName} ${locationPreposition(place)}`;
}

export function landingTitle(place: SeoPlace) {
  const spec = place.specialty;
  const head = GENERIC_KEYWORDS[spec.slug]?.[0] ?? spec.name.toLowerCase();
  if (place.suburb && place.city && place.state) {
    return `${spec.pluralName} in ${place.suburb.name}, ${place.city.name} ${place.state.abbrev}`;
  }
  if (place.city && place.state) {
    return `Hire a ${head} in ${place.city.name}, ${place.state.abbrev}`;
  }
  if (place.state) {
    return `${spec.pluralName} in ${place.state.abbrev} | Hire a ${head}`;
  }
  return `Hire a ${head} in Australia`;
}

export function landingDescription(place: SeoPlace) {
  const spec = place.specialty;
  const loc = placeLabel(place);
  const check = childCheckLabel(place.state?.slug);
  const keys = (GENERIC_KEYWORDS[spec.slug] ?? [spec.name]).slice(0, 3).join(", ");
  return `Find verified ${spec.pluralName.toLowerCase()} in ${loc}. Compare ${keys}, ${check}, rates and Instant Book. Pay into CareProof escrow.`;
}

export function landingIntro(
  place: SeoPlace,
  stats: { count: number; avgRateCents: number },
) {
  const spec = place.specialty;
  const guide = SPECIALTY_GUIDE[spec.slug];
  const check = childCheckLabel(place.state?.slug);
  const rate = stats.avgRateCents ? formatAud(stats.avgRateCents) : "competitive local";
  const countLine =
    stats.count > 0
      ? `There ${stats.count === 1 ? "is" : "are"} ${stats.count} verified ${spec.pluralName.toLowerCase()} listed ${locationPreposition(place)} right now, with a typical rate around ${rate}/hr inc GST.`
      : `Families ${locationPreposition(place)} use CareProof to hire ${spec.pluralName.toLowerCase()} from the wider area when a local match is still filling.`;

  const where =
    place.suburb && place.city
      ? `${place.suburb.name} sits inside ${place.city.name}, so most carers will travel from neighbouring suburbs as well as ${place.suburb.name} itself.`
      : place.city
        ? `${place.city.name} families usually shortlist on Instant Book, screening and a verified work history — not a bio alone.`
        : place.state
          ? `${place.state.name} has its own screening rules. ${check} is the usual child-related clearance here.`
          : `CareProof lists ${spec.pluralName.toLowerCase()} in every Australian state and territory, with suburb-level pages for local search.`;

  return [
    `Looking to hire ${spec.pluralName.toLowerCase()} ${locationPreposition(place)}? ${countLine} ${spec.description}`,
    where,
    guide
      ? `${guide.hire} ${guide.checks} Payment is collected by CareProof and released only after the booking is complete.`
      : `Book with Instant Book or post a care request. Payment is held in escrow until you confirm the work.`,
  ].join(" ");
}

export function landingFaqs(place: SeoPlace) {
  const spec = place.specialty;
  const loc = placeLabel(place);
  const guide = SPECIALTY_GUIDE[spec.slug];
  const check = childCheckLabel(place.state?.slug);
  const head = GENERIC_KEYWORDS[spec.slug]?.[0] ?? spec.name.toLowerCase();

  return [
    {
      q: `How do I hire a ${head} in ${loc}?`,
      a: `Open a verified profile, use Instant Book, or post a care request for ${loc}. CareProof holds your payment in escrow and releases it after the booking.`,
    },
    {
      q: `What checks should a ${head} have in ${place.state?.name ?? "Australia"}?`,
      a: guide?.checks ?? `Ask for ${check}, a National Police Check, and verified work history — not just a written reference.`,
    },
    {
      q: `How much does a ${head} cost in ${loc}?`,
      a: `Rates are set by each carer and shown inc GST. The directory on this page lists live hourly prices so you can compare before you book.`,
    },
    {
      q: `Can I book ${spec.pluralName.toLowerCase()} near ${place.suburb?.name ?? place.city?.name ?? loc}?`,
      a: `Yes. Filter for Instant Book and Available now, or browse neighbouring suburbs from the links below. Carers often cover a whole city, not a single postcode.`,
    },
    {
      q: `When is the ${head} paid?`,
      a: `Never up front. Funds stay in CareProof escrow until you confirm the booking, or automatically 72 hours after the scheduled end if there is no dispute.`,
    },
  ];
}

export function relatedSpecialtySlugs(slug: string) {
  const map: Record<string, string[]> = {
    "aged-care": ["personal-care", "companion-care", "respite", "nursing"],
    nannies: ["babysitters", "after-school-care", "special-needs"],
    babysitters: ["nannies", "after-school-care"],
    "disability-support": ["special-needs", "personal-care"],
    "special-needs": ["disability-support", "after-school-care", "nannies"],
    housekeeping: ["companion-care", "aged-care"],
    "companion-care": ["aged-care", "respite", "housekeeping"],
    nursing: ["aged-care", "personal-care", "respite"],
    respite: ["aged-care", "companion-care", "nursing"],
    "after-school-care": ["nannies", "babysitters"],
    "personal-care": ["aged-care", "disability-support", "nursing"],
  };
  return map[slug] ?? [];
}

export const HIRE_GUIDES = [
  {
    slug: "hire-a-nanny-australia",
    specialty: "nannies",
    title: "How to hire a nanny in Australia",
    description:
      "WWCC rules by state, typical nanny rates, and how to book a verified nanny with escrow on CareProof.",
    h1: "How to hire a nanny in Australia",
    keywords: ["hire a nanny", "nanny Australia", "WWCC nanny", "nanny rates"],
  },
  {
    slug: "hire-a-babysitter",
    specialty: "babysitters",
    title: "How to find a babysitter near you",
    description:
      "Book a WWCC babysitter for date nights, last-minute sits and overnight care. Compare rates and Instant Book in Australian suburbs.",
    h1: "How to find a babysitter near you",
    keywords: ["babysitter near me", "date night babysitter", "last minute babysitter", "WWCC babysitter"],
  },
  {
    slug: "in-home-aged-care",
    specialty: "aged-care",
    title: "In-home aged care: how to hire a carer",
    description:
      "A practical guide to hiring an aged care worker at home in Australia, including screening and escrow.",
    h1: "In-home aged care: how to hire a carer in Australia",
    keywords: ["in-home aged care", "aged care worker", "home care"],
  },
  {
    slug: "ndis-support-worker",
    specialty: "disability-support",
    title: "How to hire an NDIS support worker",
    description:
      "NDIS Worker Screening, shift notes and escrow when you hire a disability support worker in Australia.",
    h1: "How to hire an NDIS support worker",
    keywords: ["NDIS support worker", "disability support worker", "NDIS carer"],
  },
  {
    slug: "hire-an-in-home-nurse",
    specialty: "nursing",
    title: "How to hire an in-home nurse",
    description: "AHPRA checks, clinical scope and booking an in-home registered or enrolled nurse.",
    h1: "How to hire an in-home nurse in Australia",
    keywords: ["in-home nurse", "AHPRA", "registered nurse at home"],
  },
  {
    slug: "overnight-respite-care",
    specialty: "respite",
    title: "Overnight respite care at home",
    description: "How overnight respite works, what to ask a respite carer, and how escrow protects both sides.",
    h1: "Overnight respite care at home",
    keywords: ["overnight respite", "respite carer", "in-home respite"],
  },
  {
    slug: "after-school-nanny",
    specialty: "after-school-care",
    title: "How to hire an after-school nanny",
    description: "School pickup, homework help and after-school care across Australian cities and suburbs.",
    h1: "How to hire an after-school nanny",
    keywords: ["after school nanny", "school pickup", "after school care"],
  },
  {
    slug: "personal-care-assistant",
    specialty: "personal-care",
    title: "Hiring a personal care assistant at home",
    description: "PCA duties, screening and how to book personal care support with escrow.",
    h1: "Hiring a personal care assistant at home",
    keywords: ["personal care assistant", "PCA", "daily living support"],
  },
] as const;
