/**
 * Rebuild directory fill from the handmade featured profiles.
 * Each generated carer is a relocated variation of an existing profile —
 * same specialties, checks, work-history shape and voice, new person/place.
 */
import type { FeaturedCarer } from "./featured-carers";
import { featuredCarers } from "./featured-carers";
import { SUBURBS_BY_CITY, slugifySuburb } from "./suburbs";

export type GeneratedCarer = FeaturedCarer;

const FIRST = [
  "Aisha", "Amelia", "Ava", "Bianca", "Caitlin", "Chloe", "Daisy", "Elena", "Emily", "Eva",
  "Freya", "Grace", "Hannah", "Imogen", "Isla", "Jade", "Jasmine", "Kate", "Lara", "Lily",
  "Lucy", "Maya", "Mia", "Nina", "Olivia", "Phoebe", "Priya", "Ruby", "Sienna", "Sofia",
  "Tara", "Zara", "Aaron", "Adam", "Ben", "Callum", "Daniel", "Ethan", "Finn", "Harry",
  "Jack", "James", "Liam", "Lucas", "Marcus", "Noah", "Oliver", "Owen", "Ryan", "Sam",
  "Tom", "Will", "Yusuf", "Chen", "Mei", "Hiro", "Kenji", "Fatima", "Hassan", "Noor",
  "Sanjay", "Anika", "Diego", "Lucia", "Mateo", "Ingrid", "Soren",
];

const LAST = [
  "Nguyen", "Chen", "Patel", "Williams", "Brown", "Taylor", "Anderson", "Thomas", "White",
  "Martin", "Walker", "Harris", "Clark", "Lewis", "Robinson", "Young", "Allen",
  "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell",
  "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Parker", "Collins",
  "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Peterson",
  "Cooper", "Reed", "Bailey", "Bell", "Gupta", "Singh", "Kaur", "Rahman", "Ali", "Hassan",
  "Okafor", "Mensah", "Abebe", "Kim", "Park", "Sato", "Tanaka", "Rossi", "Bianchi", "Costa",
  "Silva", "Santos", "Kowalski", "Novak", "Horvat", "Papadopoulos", "Ibrahim", "Yilmaz",
];

function mulberry32(seed: number) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function range(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1));
}

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function defaultAvailabilityNote(
  template: FeaturedCarer,
  place: { suburb: string; city: string },
  availableNow: boolean,
) {
  if (template.availabilityNote) {
    return relocate(template.availabilityNote, template, place.suburb, place.city);
  }
  return availableNow
    ? `Weekday afternoons and most weekends around ${place.suburb}.`
    : `Book a few days ahead — usually free mid-week around ${place.suburb}.`;
}

function relocate(text: string, from: FeaturedCarer, toSuburb: string, toCity: string) {
  const fromCity = titleCaseSlug(from.city);
  const toCityName = titleCaseSlug(toCity);
  let out = text;
  if (from.suburb) {
    out = out.replace(new RegExp(from.suburb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), toSuburb);
  }
  out = out.replace(new RegExp(`${fromCity}'s [^.,]+`, "gi"), toSuburb);
  out = out.replace(new RegExp(`Greater ${fromCity}`, "gi"), toCityName);
  out = out.replace(new RegExp(fromCity, "gi"), toCityName);
  return out;
}

function credentialNumber(type: string, rand: () => number) {
  if (type === "ahpra") return `NMW000${range(rand, 2000000, 2999999)}`;
  if (type === "wwcc") return `WWC${range(rand, 1000000, 9999999)}E`;
  if (type === "ndis_screening") return `NDIS${range(rand, 100000, 999999)}`;
  if (type === "police_check") return `NPC${range(rand, 10000000, 99999999)}`;
  return undefined;
}

function placesNearTemplate(
  places: { state: string; city: string; suburb: string }[],
  template: FeaturedCarer,
) {
  const sameCity = places.filter((place) => place.state === template.state && place.city === template.city);
  const unique = [...new Map(sameCity.map((place) => [place.suburb, place])).values()];
  const home = unique.find((place) => place.suburb === template.suburb);
  const clustered = unique.filter(
    (place) =>
      place.suburb === template.suburb ||
      place.suburb.startsWith(`${template.suburb} `),
  );
  const rest = unique.filter((place) => !clustered.includes(place));
  const lead = home ? [home, home, home, ...clustered.filter((place) => place !== home)] : clustered;
  return [...lead, ...rest];
}

export function generateCarers(count = 480, templates: FeaturedCarer[] = featuredCarers): GeneratedCarer[] {
  const places = locations();
  const usedSlugs = new Set<string>();
  const usedEmails = new Set(templates.map((item) => item.email));
  const carers: GeneratedCarer[] = [];
  const assignments: { template: FeaturedCarer; place: { state: string; city: string; suburb: string } }[] = [];

  for (const template of templates) {
    const nearby = placesNearTemplate(places, template).slice(0, 8);
    for (const place of nearby) assignments.push({ template, place });
  }
  let extra = 0;
  while (assignments.length < count) {
    const template = templates[extra % templates.length];
    assignments.push({
      template,
      place: places[(extra * 13 + 7) % places.length],
    });
    extra += 1;
  }

  for (let i = 0; i < count; i += 1) {
    const rand = mulberry32(20_000 + i * 97);
    const { template, place } = assignments[i];
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 11) % LAST.length];
    const name = `${first} ${last}`;
    const primary = template.specialties[0] ?? "companion-care";

    let slug = `${slugifySuburb(name)}-${primary}-${slugifySuburb(place.suburb)}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);

    let email = `${first}.${last}.${i}@careproof.com.au`.toLowerCase().replace(/[^a-z0-9.@]/g, "");
    if (usedEmails.has(email)) email = `carer.${i}@careproof.com.au`;
    usedEmails.add(email);

    const jitter = range(rand, -200, 300);
    const yearsJitter = range(rand, -1, 2);
    const availableNow = rand() > 0.25;

    carers.push({
      email,
      name,
      slug,
      headline: relocate(template.headline, template, place.suburb, place.city),
      bio: relocate(template.bio, template, place.suburb, place.city),
      hourlyRateCents: Math.max(3200, template.hourlyRateCents + jitter),
      yearsExperience: Math.max(2, template.yearsExperience + yearsJitter),
      suburb: place.suburb,
      state: place.state,
      city: place.city,
      abn: template.abn
        ? `${range(rand, 11, 99)} ${range(rand, 100, 999)} ${range(rand, 100, 999)} ${range(rand, 100, 999)}`
        : undefined,
      instantBook: template.instantBook,
      availableNow,
      availabilityNote: defaultAvailabilityNote(template, place, availableNow),
      specialties: [...template.specialties],
      credentials: template.credentials.map((credential) => ({
        type: credential.type,
        issuingState: credential.issuingState ? place.state : undefined,
        number: credentialNumber(credential.type, rand) ?? credential.number,
        months: credential.months,
      })),
      work: template.work.map((role) => ({
        ...role,
        employer: relocate(role.employer, template, place.suburb, place.city),
        duties: relocate(role.duties, template, place.suburb, place.city),
      })),
      phone: `04${String(range(rand, 10, 99))} ${String(range(rand, 100, 999))} ${String(range(rand, 100, 999))}`,
    });
  }

  return carers;
}
