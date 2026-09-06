/**
 * Synthetic demo carers for local SEO and marketplace testing.
 * Do not treat these as real people. Import consented/owned data with
 * `npm run db:import-csv` instead of scraping other marketplaces.
 */
import { SUBURBS_BY_CITY, slugifySuburb } from "./suburbs";

const FIRST = [
  "Aisha", "Amelia", "Ava", "Bianca", "Caitlin", "Chloe", "Daisy", "Elena", "Emily", "Eva",
  "Freya", "Grace", "Hannah", "Imogen", "Isla", "Jade", "Jasmine", "Kate", "Lara", "Lily",
  "Lucy", "Maya", "Mia", "Nina", "Olivia", "Phoebe", "Priya", "Ruby", "Sienna", "Sofia",
  "Tara", "Zara", "Aaron", "Adam", "Ben", "Callum", "Daniel", "Ethan", "Finn", "Harry",
  "Jack", "James", "Liam", "Lucas", "Marcus", "Noah", "Oliver", "Owen", "Ryan", "Sam",
  "Tom", "Will", "Yusuf", "Chen", "Mei", "Hiro", "Kenji", "Fatima", "Hassan", "Noor",
  "Sanjay", "Anika", "Diego", "Lucia", "Mateo", "Freya", "Ingrid", "Soren",
];

const LAST = [
  "Nguyen", "Chen", "Patel", "Williams", "Brown", "Taylor", "Anderson", "Thomas", "White",
  "Martin", "Walker", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen",
  "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell",
  "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Parker", "Collins",
  "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Peterson",
  "Cooper", "Reed", "Bailey", "Bell", "Gupta", "Singh", "Kaur", "Rahman", "Ali", "Hassan",
  "Okafor", "Mensah", "Abebe", "Kim", "Park", "Sato", "Tanaka", "Rossi", "Bianchi", "Costa",
  "Silva", "Santos", "Kowalski", "Novak", "Horvat", "Papadopoulos", "Ibrahim", "Yilmaz",
];

const EMPLOYERS: Record<string, string[]> = {
  "aged-care": ["Bupa Aged Care", "HammondCare", "Ozcare", "Uniting", "Resthaven", "Brightwater", "Mecwacare", "Private family"],
  nannies: ["Private family", "The Walsh family", "The Chen family", "The Ibrahim family"],
  babysitters: ["Local families", "Private family"],
  "disability-support": ["Northcott", "Scope Australia", "Endeavour Foundation", "Ability Centre", "Baptcare"],
  "special-needs": ["Aspect", "Northcott", "Private family"],
  housekeeping: ["Private households", "Domestic agency"],
  "companion-care": ["Helping Hand", "Italian Forum", "Private family"],
  nursing: ["Silver Chain", "Hospital in the Home", "Alfred Health", "Royal Hobart Hospital"],
  respite: ["Mecwacare", "Carers Australia partner", "Private family"],
  "after-school-care": ["Private family", "OOSH program", "Local primary school"],
  "personal-care": ["Warrigal", "Community Services", "Private family"],
};

const RELATED: Record<string, string[]> = {
  "aged-care": ["personal-care", "companion-care", "respite"],
  nannies: ["babysitters", "after-school-care"],
  babysitters: ["nannies", "after-school-care"],
  "disability-support": ["special-needs", "personal-care"],
  "special-needs": ["disability-support", "after-school-care"],
  housekeeping: ["companion-care"],
  "companion-care": ["aged-care", "respite"],
  nursing: ["aged-care", "personal-care"],
  respite: ["aged-care", "companion-care"],
  "after-school-care": ["nannies", "babysitters"],
  "personal-care": ["aged-care", "disability-support"],
};

const RATES: Record<string, [number, number]> = {
  "aged-care": [4400, 6200],
  nannies: [3800, 5200],
  babysitters: [3200, 4400],
  "disability-support": [4800, 6200],
  "special-needs": [5000, 6400],
  housekeeping: [3400, 4400],
  "companion-care": [3600, 4800],
  nursing: [6400, 8600],
  respite: [4600, 6200],
  "after-school-care": [3600, 4800],
  "personal-care": [4200, 5600],
};

const PRIMARY_CYCLE = [
  "nannies",
  "aged-care",
  "disability-support",
  "babysitters",
  "after-school-care",
  "personal-care",
  "companion-care",
  "nannies",
  "aged-care",
  "housekeeping",
  "respite",
  "nursing",
  "special-needs",
];

export type GeneratedCarer = {
  email: string;
  name: string;
  slug: string;
  headline: string;
  bio: string;
  hourlyRateCents: number;
  yearsExperience: number;
  suburb: string;
  state: string;
  city: string;
  abn?: string;
  instantBook: boolean;
  availableNow: boolean;
  specialties: string[];
  credentials: { type: string; issuingState?: string; months: number }[];
  work: {
    employer: string;
    title: string;
    start: string;
    end?: string;
    duties: string;
    verification: string;
    hours: number;
  }[];
  phone: string;
};

function mulberry32(seed: number) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: T[]) {
  return list[Math.floor(rand() * list.length)];
}

function range(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1));
}

function locations() {
  const rows: { state: string; city: string; suburb: string }[] = [];
  const capitals = new Set([
    "sydney",
    "melbourne",
    "brisbane",
    "perth",
    "adelaide",
    "canberra",
    "hobart",
    "darwin",
    "gold-coast",
    "newcastle",
  ]);
  for (const [state, cities] of Object.entries(SUBURBS_BY_CITY)) {
    for (const [city, names] of Object.entries(cities)) {
      const unique = [...new Set(names)];
      const copies = capitals.has(city) ? 3 : 1;
      for (let i = 0; i < copies; i += 1) {
        for (const suburb of unique) {
          rows.push({ state, city, suburb });
        }
      }
    }
  }
  return rows;
}

function credentialsFor(specialty: string, state: string, rand: () => number) {
  const months = range(rand, 8, 30);
  if (specialty === "nursing") {
    return [
      { type: "ahpra", months },
      { type: "first_aid", months: range(rand, 8, 24) },
      { type: "aged_care_screening", issuingState: state, months },
    ];
  }
  if (["nannies", "babysitters", "after-school-care"].includes(specialty)) {
    return [
      { type: "wwcc", issuingState: state, months },
      { type: "first_aid", months: range(rand, 6, 20) },
    ];
  }
  if (["disability-support", "special-needs"].includes(specialty)) {
    return [
      { type: "ndis_screening", issuingState: state, months },
      { type: "wwcc", issuingState: state, months },
      { type: "first_aid", months: range(rand, 8, 18) },
    ];
  }
  if (specialty === "housekeeping") {
    return [{ type: "police_check", months }];
  }
  return [
    { type: "aged_care_screening", issuingState: state, months },
    { type: "police_check", months: range(rand, 6, 18) },
    { type: "first_aid", months: range(rand, 8, 22) },
  ];
}

function titleFor(specialty: string) {
  const titles: Record<string, string> = {
    "aged-care": "Aged care worker",
    nannies: "Nanny",
    babysitters: "Babysitter",
    "disability-support": "Disability support worker",
    "special-needs": "Special needs carer",
    housekeeping: "Housekeeper",
    "companion-care": "Companion carer",
    nursing: "Registered nurse",
    respite: "Respite carer",
    "after-school-care": "After-school carer",
    "personal-care": "Personal care assistant",
  };
  return titles[specialty] ?? "Carer";
}

export function generateCarers(count = 480): GeneratedCarer[] {
  const places = locations();
  const usedSlugs = new Set<string>();
  const usedEmails = new Set<string>();
  const carers: GeneratedCarer[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = mulberry32(10_000 + i * 97);
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    const place = places[(i * 11) % places.length];
    const primary = PRIMARY_CYCLE[i % PRIMARY_CYCLE.length];
    const extras = RELATED[primary] ?? [];
    const specialties = [primary];
    if (rand() > 0.35 && extras[0]) specialties.push(extras[0]);
    if (rand() > 0.75 && extras[1]) specialties.push(extras[1]);

    let slug = `${first}-${last}-${primary}-${slugifySuburb(place.suburb)}`.toLowerCase();
    if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);

    let email = `${first}.${last}.${i}@careproof.com.au`.toLowerCase().replace(/[^a-z0-9.@]/g, "");
    if (usedEmails.has(email)) email = `carer.${i}@careproof.com.au`;
    usedEmails.add(email);

    const years = range(rand, 2, 16);
    const [minRate, maxRate] = RATES[primary];
    const hourlyRateCents = range(rand, minRate, maxRate);
    const title = titleFor(primary);
    const employer = pick(rand, EMPLOYERS[primary] ?? ["Private family"]);
    const startYear = 2026 - years;
    const hours = years * range(rand, 600, 1100);
    const hasAbn = rand() > 0.45;

    carers.push({
      email,
      name: `${first} ${last}`,
      slug,
      headline: `${title} in ${place.suburb}, ${place.city.replace(/-/g, " ")}`,
      bio: `I have ${years} years’ experience as a ${title.toLowerCase()} and work with families around ${place.suburb}. I keep clear notes, arrive on time, and am happy to start with a trial booking on CareProof.`,
      hourlyRateCents,
      yearsExperience: years,
      suburb: place.suburb,
      state: place.state,
      city: place.city,
      abn: hasAbn ? `${range(rand, 11, 99)} ${range(rand, 100, 999)} ${range(rand, 100, 999)} ${range(rand, 100, 999)}` : undefined,
      instantBook: rand() > 0.35,
      availableNow: rand() > 0.4,
      specialties,
      credentials: credentialsFor(primary, place.state, rand),
      work: [
        {
          employer: employer.includes("family") || employer.includes("household")
            ? `${employer} in ${place.suburb}`
            : employer,
          title,
          start: `${startYear}-03-01`,
          end: rand() > 0.55 ? `${2025}-11-30` : undefined,
          duties: `Ongoing ${title.toLowerCase()} support for local clients, including weekday and weekend cover.`,
          verification: rand() > 0.3 ? "employer_confirmed" : "document",
          hours,
        },
      ],
      phone: `04${String(range(rand, 10, 99))}${String(range(rand, 100, 999))}${String(range(rand, 100, 999))}`,
    });
  }

  return carers;
}
