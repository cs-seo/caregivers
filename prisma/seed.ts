import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "CareProof123!";

const specialties = [
  {
    slug: "aged-care",
    name: "Aged care",
    pluralName: "Aged care carers",
    description:
      "In-home support for older Australians, including personal care, companionship and help around the house.",
    seoTitle: "Aged care carers across Australia",
    seoDescription:
      "Find verified aged care carers and home care workers in every Australian state and city. Compare experience, WWCC and rates.",
  },
  {
    slug: "nannies",
    name: "Nanny",
    pluralName: "Nannies",
    description: "Live-out and live-in nannies for ongoing childcare in your home.",
    seoTitle: "Nannies across Australia",
    seoDescription:
      "Hire verified nannies in Sydney, Melbourne, Brisbane and cities nationwide. Working with Children Checks and reviewed experience.",
  },
  {
    slug: "babysitters",
    name: "Babysitter",
    pluralName: "Babysitters",
    description: "Casual and after-hours babysitters for evenings, weekends and date nights.",
    seoTitle: "Babysitters across Australia",
    seoDescription:
      "Book babysitters with verified Working with Children Checks in cities and regional centres across Australia.",
  },
  {
    slug: "disability-support",
    name: "Disability support",
    pluralName: "Disability support workers",
    description: "NDIS support workers for community access, personal care and in-home support.",
    seoTitle: "NDIS disability support workers across Australia",
    seoDescription:
      "Find NDIS-screened disability support workers in every state. Compare verified work history and hourly rates.",
  },
  {
    slug: "special-needs",
    name: "Special needs care",
    pluralName: "Special needs carers",
    description: "Carers experienced with autism, complex behaviour support and additional needs.",
    seoTitle: "Special needs carers across Australia",
    seoDescription:
      "Book special needs carers with verified experience supporting children and adults with additional needs.",
  },
  {
    slug: "housekeeping",
    name: "Housekeeping",
    pluralName: "Housekeepers",
    description: "Domestic assistance, cleaning and home organisation for families and older adults.",
    seoTitle: "Housekeepers across Australia",
    seoDescription:
      "Hire housekeepers and domestic assistants with police checks and reviewed client experience.",
  },
  {
    slug: "companion-care",
    name: "Companion care",
    pluralName: "Companion carers",
    description: "Social support, outings and company for older adults living at home.",
    seoTitle: "Companion carers across Australia",
    seoDescription:
      "Find companion carers for social visits, appointments and everyday company across Australian cities.",
  },
  {
    slug: "nursing",
    name: "Nursing",
    pluralName: "Nurses",
    description: "AHPRA-registered nurses for clinical in-home care, medication and complex needs.",
    seoTitle: "In-home nurses across Australia",
    seoDescription:
      "Book AHPRA-registered nurses for in-home clinical care. Compare registrations, specialties and rates.",
  },
  {
    slug: "respite",
    name: "Respite",
    pluralName: "Respite carers",
    description: "Short-term relief care so family carers can take a break.",
    seoTitle: "Respite carers across Australia",
    seoDescription:
      "Find respite carers for in-home and overnight relief across Australia, with verified experience.",
  },
  {
    slug: "after-school-care",
    name: "After-school care",
    pluralName: "After-school carers",
    description: "Pick-up, homework help and afternoon care until parents finish work.",
    seoTitle: "After-school carers across Australia",
    seoDescription:
      "Hire after-school carers and nannies for school pick-up and homework help in Australian cities.",
  },
  {
    slug: "personal-care",
    name: "Personal care",
    pluralName: "Personal care assistants",
    description: "Showering, dressing, mobility and daily living support at home.",
    seoTitle: "Personal care assistants across Australia",
    seoDescription:
      "Find personal care assistants for daily living support, with aged care and NDIS screening where required.",
  },
];

const states = [
  { slug: "nsw", name: "New South Wales", abbrev: "NSW" },
  { slug: "vic", name: "Victoria", abbrev: "VIC" },
  { slug: "qld", name: "Queensland", abbrev: "QLD" },
  { slug: "wa", name: "Western Australia", abbrev: "WA" },
  { slug: "sa", name: "South Australia", abbrev: "SA" },
  { slug: "tas", name: "Tasmania", abbrev: "TAS" },
  { slug: "act", name: "Australian Capital Territory", abbrev: "ACT" },
  { slug: "nt", name: "Northern Territory", abbrev: "NT" },
];

const citiesByState: Record<string, { slug: string; name: string; lat: number; lng: number }[]> = {
  nsw: [
    { slug: "sydney", name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { slug: "newcastle", name: "Newcastle", lat: -32.9283, lng: 151.7817 },
    { slug: "wollongong", name: "Wollongong", lat: -34.4278, lng: 150.8931 },
    { slug: "central-coast", name: "Central Coast", lat: -33.4267, lng: 151.3417 },
    { slug: "coffs-harbour", name: "Coffs Harbour", lat: -30.2963, lng: 153.1135 },
    { slug: "wagga-wagga", name: "Wagga Wagga", lat: -35.1082, lng: 147.3598 },
    { slug: "albury", name: "Albury", lat: -36.0737, lng: 146.9135 },
    { slug: "tamworth", name: "Tamworth", lat: -31.0927, lng: 150.9271 },
    { slug: "port-macquarie", name: "Port Macquarie", lat: -31.4333, lng: 152.9 },
    { slug: "orange", name: "Orange", lat: -33.2833, lng: 149.1 },
    { slug: "dubbo", name: "Dubbo", lat: -32.2569, lng: 148.6011 },
    { slug: "bathurst", name: "Bathurst", lat: -33.419, lng: 149.577 },
    { slug: "lismore", name: "Lismore", lat: -28.809, lng: 153.278 },
    { slug: "nowra", name: "Nowra", lat: -34.873, lng: 150.603 },
  ],
  vic: [
    { slug: "melbourne", name: "Melbourne", lat: -37.8136, lng: 144.9631 },
    { slug: "geelong", name: "Geelong", lat: -38.1499, lng: 144.3617 },
    { slug: "ballarat", name: "Ballarat", lat: -37.5622, lng: 143.8503 },
    { slug: "bendigo", name: "Bendigo", lat: -36.757, lng: 144.279 },
    { slug: "shepparton", name: "Shepparton", lat: -36.3833, lng: 145.4 },
    { slug: "mildura", name: "Mildura", lat: -34.188, lng: 142.158 },
    { slug: "warrnambool", name: "Warrnambool", lat: -38.381, lng: 142.488 },
    { slug: "wodonga", name: "Wodonga", lat: -36.121, lng: 146.888 },
    { slug: "traralgon", name: "Traralgon", lat: -38.196, lng: 146.54 },
  ],
  qld: [
    { slug: "brisbane", name: "Brisbane", lat: -27.4698, lng: 153.0251 },
    { slug: "gold-coast", name: "Gold Coast", lat: -28.0167, lng: 153.4 },
    { slug: "sunshine-coast", name: "Sunshine Coast", lat: -26.65, lng: 153.0667 },
    { slug: "townsville", name: "Townsville", lat: -19.259, lng: 146.817 },
    { slug: "cairns", name: "Cairns", lat: -16.9186, lng: 145.7781 },
    { slug: "toowoomba", name: "Toowoomba", lat: -27.5598, lng: 151.9507 },
    { slug: "mackay", name: "Mackay", lat: -21.1411, lng: 149.186 },
    { slug: "rockhampton", name: "Rockhampton", lat: -23.378, lng: 150.51 },
    { slug: "bundaberg", name: "Bundaberg", lat: -24.866, lng: 152.349 },
    { slug: "hervey-bay", name: "Hervey Bay", lat: -25.288, lng: 152.838 },
  ],
  wa: [
    { slug: "perth", name: "Perth", lat: -31.9505, lng: 115.8605 },
    { slug: "mandurah", name: "Mandurah", lat: -32.5269, lng: 115.7217 },
    { slug: "bunbury", name: "Bunbury", lat: -33.327, lng: 115.641 },
    { slug: "geraldton", name: "Geraldton", lat: -28.774, lng: 114.609 },
    { slug: "albany", name: "Albany", lat: -35.027, lng: 117.884 },
    { slug: "kalgoorlie", name: "Kalgoorlie", lat: -30.749, lng: 121.466 },
    { slug: "broome", name: "Broome", lat: -17.961, lng: 122.236 },
    { slug: "busselton", name: "Busselton", lat: -33.653, lng: 115.345 },
  ],
  sa: [
    { slug: "adelaide", name: "Adelaide", lat: -34.9285, lng: 138.6007 },
    { slug: "mount-gambier", name: "Mount Gambier", lat: -37.828, lng: 140.782 },
    { slug: "whyalla", name: "Whyalla", lat: -33.034, lng: 137.584 },
    { slug: "murray-bridge", name: "Murray Bridge", lat: -35.12, lng: 139.267 },
    { slug: "port-lincoln", name: "Port Lincoln", lat: -34.727, lng: 135.856 },
    { slug: "victor-harbor", name: "Victor Harbor", lat: -35.55, lng: 138.617 },
  ],
  tas: [
    { slug: "hobart", name: "Hobart", lat: -42.8821, lng: 147.3272 },
    { slug: "launceston", name: "Launceston", lat: -41.433, lng: 147.144 },
    { slug: "devonport", name: "Devonport", lat: -41.18, lng: 146.35 },
    { slug: "burnie", name: "Burnie", lat: -41.055, lng: 145.907 },
  ],
  act: [{ slug: "canberra", name: "Canberra", lat: -35.2809, lng: 149.13 }],
  nt: [
    { slug: "darwin", name: "Darwin", lat: -12.4634, lng: 130.8456 },
    { slug: "alice-springs", name: "Alice Springs", lat: -23.698, lng: 133.881 },
    { slug: "palmerston", name: "Palmerston", lat: -12.481, lng: 130.983 },
  ],
};

type SeedCarer = {
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
  credentials: { type: string; issuingState?: string; number?: string; months: number }[];
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

const carers: SeedCarer[] = [
  {
    email: "carer@careproof.com.au",
    name: "Sarah Nguyen",
    slug: "sarah-nguyen-aged-care-sydney",
    headline: "AHPRA-registered nurse offering in-home aged care in Sydney's inner west",
    bio: "I have spent 11 years supporting older Australians at home — from daily personal care through to complex medication and dementia routines. Families book me when they want clinical judgement without a facility. I am calm, punctual and happy to coordinate with GPs and My Aged Care packages.",
    hourlyRateCents: 6800,
    yearsExperience: 11,
    suburb: "Marrickville",
    state: "nsw",
    city: "sydney",
    abn: "84 123 456 781",
    instantBook: true,
    availableNow: true,
    specialties: ["aged-care", "nursing", "personal-care", "respite"],
    credentials: [
      { type: "ahpra", number: "NMW0002184412", months: 18 },
      { type: "aged_care_screening", issuingState: "nsw", months: 24 },
      { type: "police_check", months: 12 },
      { type: "first_aid", months: 20 },
    ],
    work: [
      {
        employer: "Bupa Aged Care Petersham",
        title: "Registered nurse",
        start: "2018-03-01",
        end: "2023-11-30",
        duties: "Clinical lead for a 42-bed wing, medication rounds, family conferences and palliative support.",
        verification: "employer_confirmed",
        hours: 9200,
      },
      {
        employer: "Private family, Stanmore",
        title: "In-home aged care nurse",
        start: "2024-01-15",
        duties: "Overnight and day support for a client living with mixed dementia, including meal prep and mobility.",
        verification: "document",
        hours: 1400,
      },
    ],
    phone: "0412 880 114",
  },
  {
    email: "priya.nair@careproof.com.au",
    name: "Priya Nair",
    slug: "priya-nair-nanny-sydney",
    headline: "Live-out nanny and after-school carer in Sydney's east",
    bio: "I specialise in school-age children, homework routines and swimming pick-ups. Parents book me for term-time consistency and school holiday cover. I keep a shared daily note so you always know how the afternoon went.",
    hourlyRateCents: 4200,
    yearsExperience: 7,
    suburb: "Bondi",
    state: "nsw",
    city: "sydney",
    abn: "37 991 204 118",
    instantBook: true,
    availableNow: true,
    specialties: ["nannies", "after-school-care", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "nsw", number: "WWC1234567E", months: 30 },
      { type: "first_aid", months: 14 },
      { type: "police_check", months: 10 },
    ],
    work: [
      {
        employer: "The Chen family, Bondi",
        title: "Full-time nanny",
        start: "2021-02-01",
        end: "2025-12-15",
        duties: "Two children (now 6 and 9), school runs, meals, swimming and weekend sport.",
        verification: "employer_confirmed",
        hours: 6800,
      },
    ],
    phone: "0418 220 901",
  },
  {
    email: "james.okafor@careproof.com.au",
    name: "James Okafor",
    slug: "james-okafor-disability-support-sydney",
    headline: "NDIS support worker for community access across Greater Sydney",
    bio: "I support participants with community access, public transport training and weekend social goals. I am comfortable with complex behaviour support plans and keep detailed shift notes for plan managers.",
    hourlyRateCents: 5500,
    yearsExperience: 6,
    suburb: "Parramatta",
    state: "nsw",
    city: "sydney",
    abn: "51 204 883 019",
    instantBook: false,
    availableNow: true,
    specialties: ["disability-support", "special-needs", "personal-care"],
    credentials: [
      { type: "ndis_screening", issuingState: "nsw", months: 28 },
      { type: "wwcc", issuingState: "nsw", months: 20 },
      { type: "first_aid", months: 8 },
      { type: "police_check", months: 11 },
    ],
    work: [
      {
        employer: "Northcott",
        title: "Disability support worker",
        start: "2019-06-01",
        end: "2024-04-30",
        duties: "Community access, SIL shifts and goal-based skill building for adults 18–45.",
        verification: "employer_confirmed",
        hours: 7400,
      },
    ],
    phone: "0403 771 255",
  },
  {
    email: "elena.rossi@careproof.com.au",
    name: "Elena Rossi",
    slug: "elena-rossi-companion-care-sydney",
    headline: "Companion carer and housekeeper for inner Sydney apartments",
    bio: "I help older clients stay independent — shopping, light meals, appointments and a proper conversation. Italian and English spoken. Families often book me twice a week as a standing visit.",
    hourlyRateCents: 3900,
    yearsExperience: 9,
    suburb: "Leichhardt",
    state: "nsw",
    city: "sydney",
    instantBook: true,
    availableNow: false,
    specialties: ["companion-care", "housekeeping", "aged-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "nsw", months: 16 },
      { type: "police_check", months: 9 },
    ],
    work: [
      {
        employer: "Italian Forum Aged Care",
        title: "Lifestyle assistant",
        start: "2016-08-01",
        end: "2022-12-20",
        duties: "Group activities, one-to-one visits and family liaison for Italian-speaking residents.",
        verification: "employer_confirmed",
        hours: 8100,
      },
    ],
    phone: "0421 664 088",
  },
  {
    email: "liam.patel@careproof.com.au",
    name: "Liam Patel",
    slug: "liam-patel-aged-care-newcastle",
    headline: "Male aged care worker for personal care and overnight respite in Newcastle",
    bio: "I take the physically demanding shifts — transfers, showers and overnight sits — so families can sleep. Quiet, respectful and used to working with package providers.",
    hourlyRateCents: 4800,
    yearsExperience: 8,
    suburb: "Hamilton",
    state: "nsw",
    city: "newcastle",
    abn: "22 448 110 903",
    instantBook: true,
    availableNow: true,
    specialties: ["aged-care", "personal-care", "respite"],
    credentials: [
      { type: "aged_care_screening", issuingState: "nsw", months: 22 },
      { type: "police_check", months: 13 },
      { type: "first_aid", months: 17 },
    ],
    work: [
      {
        employer: "Hunter Nursing",
        title: "Personal care worker",
        start: "2017-01-10",
        end: "2024-06-30",
        duties: "In-home personal care, overnight sits and hospital discharge support across the Hunter.",
        verification: "employer_confirmed",
        hours: 8900,
      },
    ],
    phone: "0490 112 334",
  },
  {
    email: "maya.chen@careproof.com.au",
    name: "Maya Chen",
    slug: "maya-chen-nanny-melbourne",
    headline: "Bilingual Mandarin-English nanny in Melbourne's inner north",
    bio: "I look after infants through to early primary, with a focus on bilingual play and sleep routines. I am first-aid certified and happy to cook simple family meals.",
    hourlyRateCents: 4500,
    yearsExperience: 5,
    suburb: "Brunswick",
    state: "vic",
    city: "melbourne",
    instantBook: true,
    availableNow: true,
    specialties: ["nannies", "babysitters", "after-school-care"],
    credentials: [
      { type: "wwcc", issuingState: "vic", number: "0183-229-441", months: 26 },
      { type: "first_aid", months: 11 },
    ],
    work: [
      {
        employer: "The Walsh family, Fitzroy",
        title: "Nanny",
        start: "2022-03-01",
        duties: "Infant to toddler care, bilingual play, and two school-age siblings after 3pm.",
        verification: "employer_confirmed",
        hours: 3600,
      },
    ],
    phone: "0432 908 771",
  },
  {
    email: "tom.baker@careproof.com.au",
    name: "Tom Baker",
    slug: "tom-baker-disability-support-melbourne",
    headline: "NDIS support worker and community access specialist in Melbourne",
    bio: "Former sports coach now supporting participants with recreation goals, gym programs and independent living skills. I write clear shift notes and work well with support coordinators.",
    hourlyRateCents: 5200,
    yearsExperience: 4,
    suburb: "Footscray",
    state: "vic",
    city: "melbourne",
    abn: "65 330 118 442",
    instantBook: false,
    availableNow: true,
    specialties: ["disability-support", "special-needs"],
    credentials: [
      { type: "ndis_screening", issuingState: "vic", months: 20 },
      { type: "wwcc", issuingState: "vic", months: 18 },
      { type: "first_aid", months: 15 },
    ],
    work: [
      {
        employer: "Scope Australia",
        title: "Support worker",
        start: "2021-09-01",
        end: "2025-08-31",
        duties: "Community access, recreation and SIL overnight shifts.",
        verification: "employer_confirmed",
        hours: 4100,
      },
    ],
    phone: "0477 201 664",
  },
  {
    email: "hannah.lee@careproof.com.au",
    name: "Hannah Lee",
    slug: "hannah-lee-nursing-melbourne",
    headline: "Registered nurse for complex in-home care across Melbourne",
    bio: "Wound care, PEG feeds, insulin and palliative support in the home. I take a small caseload so families get continuity, not a rotating roster.",
    hourlyRateCents: 7900,
    yearsExperience: 14,
    suburb: "Camberwell",
    state: "vic",
    city: "melbourne",
    abn: "19 774 220 108",
    instantBook: false,
    availableNow: false,
    specialties: ["nursing", "aged-care", "personal-care"],
    credentials: [
      { type: "ahpra", number: "NMW0001944001", months: 12 },
      { type: "aged_care_screening", issuingState: "vic", months: 18 },
      { type: "police_check", months: 8 },
      { type: "first_aid", months: 22 },
    ],
    work: [
      {
        employer: "Alfred Health",
        title: "Clinical nurse specialist",
        start: "2014-02-01",
        end: "2023-05-31",
        duties: "Hospital-in-the-home and complex wound care.",
        verification: "employer_confirmed",
        hours: 15000,
      },
    ],
    phone: "0411 556 902",
  },
  {
    email: "sofia.martinez@careproof.com.au",
    name: "Sofia Martinez",
    slug: "sofia-martinez-housekeeping-melbourne",
    headline: "Housekeeper and domestic assistant for Melbourne families",
    bio: "Weekly cleans, laundry, fridge restock and end-of-week reset. Police checked, insured and used to households with kids and pets.",
    hourlyRateCents: 3800,
    yearsExperience: 10,
    suburb: "South Yarra",
    state: "vic",
    city: "melbourne",
    instantBook: true,
    availableNow: true,
    specialties: ["housekeeping"],
    credentials: [{ type: "police_check", months: 7 }],
    work: [
      {
        employer: "Private households, inner south",
        title: "Housekeeper",
        start: "2016-01-01",
        duties: "Recurring domestic assistance for four long-term families.",
        verification: "document",
        hours: 7200,
      },
    ],
    phone: "0408 331 229",
  },
  {
    email: "noah.williams@careproof.com.au",
    name: "Noah Williams",
    slug: "noah-williams-aged-care-geelong",
    headline: "Aged care and respite worker covering Geelong and the Bellarine",
    bio: "I support clients to stay at home after hospital discharge — meals, meds prompts and short walks. Available for overnight respite on weekends.",
    hourlyRateCents: 4600,
    yearsExperience: 6,
    suburb: "Belmont",
    state: "vic",
    city: "geelong",
    instantBook: true,
    availableNow: true,
    specialties: ["aged-care", "respite", "companion-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "vic", months: 14 },
      { type: "police_check", months: 10 },
      { type: "first_aid", months: 9 },
    ],
    work: [
      {
        employer: "Barwon Health",
        title: "Personal care attendant",
        start: "2019-04-01",
        end: "2024-01-15",
        duties: "Sub-acute ward and transition-care program.",
        verification: "employer_confirmed",
        hours: 6200,
      },
    ],
    phone: "0429 880 015",
  },
  {
    email: "aisha.rahman@careproof.com.au",
    name: "Aisha Rahman",
    slug: "aisha-rahman-nanny-brisbane",
    headline: "Nanny and babysitter for Brisbane's inner west",
    bio: "Gentle, structured care for toddlers and preschoolers. I plan outdoor mornings, rest time and simple cooking. Happy to cover date nights as well as weekdays.",
    hourlyRateCents: 4000,
    yearsExperience: 6,
    suburb: "Paddington",
    state: "qld",
    city: "brisbane",
    instantBook: true,
    availableNow: true,
    specialties: ["nannies", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "qld", number: "Blue Card 123456/1", months: 34 },
      { type: "first_aid", months: 16 },
    ],
    work: [
      {
        employer: "The Nguyen family, Paddington",
        title: "Nanny",
        start: "2020-07-01",
        end: "2025-11-30",
        duties: "Twins from 18 months through preschool, plus Friday night babysitting.",
        verification: "employer_confirmed",
        hours: 5100,
      },
    ],
    phone: "0433 119 870",
  },
  {
    email: "daniel.kemp@careproof.com.au",
    name: "Daniel Kemp",
    slug: "daniel-kemp-disability-support-brisbane",
    headline: "NDIS support worker for Brisbane and Moreton Bay",
    bio: "I support participants with community access, appointment attendance and weekend recreation. Yellow Card / NDIS screening current. Reliable car with comprehensive insurance.",
    hourlyRateCents: 5300,
    yearsExperience: 5,
    suburb: "Chermside",
    state: "qld",
    city: "brisbane",
    abn: "44 201 998 330",
    instantBook: true,
    availableNow: true,
    specialties: ["disability-support", "special-needs", "personal-care"],
    credentials: [
      { type: "ndis_screening", issuingState: "qld", months: 24 },
      { type: "wwcc", issuingState: "qld", months: 24 },
      { type: "first_aid", months: 12 },
    ],
    work: [
      {
        employer: "Endeavour Foundation",
        title: "Support worker",
        start: "2020-02-01",
        duties: "Community access and personal care for adults with intellectual disability.",
        verification: "employer_confirmed",
        hours: 5800,
      },
    ],
    phone: "0466 221 094",
  },
  {
    email: "grace.holloway@careproof.com.au",
    name: "Grace Holloway",
    slug: "grace-holloway-aged-care-gold-coast",
    headline: "Aged care and companion carer on the Gold Coast",
    bio: "Beach walks, medical appointments and evening meals for older clients from Southport to Palm Beach. I treat every home as if it were my own parents'.",
    hourlyRateCents: 4700,
    yearsExperience: 12,
    suburb: "Southport",
    state: "qld",
    city: "gold-coast",
    instantBook: true,
    availableNow: false,
    specialties: ["aged-care", "companion-care", "personal-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "qld", months: 19 },
      { type: "police_check", months: 11 },
      { type: "first_aid", months: 13 },
    ],
    work: [
      {
        employer: "Ozcare",
        title: "Community care worker",
        start: "2015-05-01",
        end: "2024-09-01",
        duties: "Home care packages, personal care and social support.",
        verification: "employer_confirmed",
        hours: 11000,
      },
    ],
    phone: "0417 663 201",
  },
  {
    email: "lucas.brown@careproof.com.au",
    name: "Lucas Brown",
    slug: "lucas-brown-nursing-perth",
    headline: "Enrolled nurse for in-home aged care across Perth's northern suburbs",
    bio: "Medication prompting, vitals, wound dressings and family updates. I work alongside GPs and Silver Chain when needed.",
    hourlyRateCents: 6200,
    yearsExperience: 9,
    suburb: "Joondalup",
    state: "wa",
    city: "perth",
    abn: "90 118 447 226",
    instantBook: false,
    availableNow: true,
    specialties: ["nursing", "aged-care", "personal-care"],
    credentials: [
      { type: "ahpra", number: "NMW0002081199", months: 15 },
      { type: "aged_care_screening", issuingState: "wa", months: 17 },
      { type: "police_check", months: 9 },
    ],
    work: [
      {
        employer: "Brightwater Care Group",
        title: "Enrolled nurse",
        start: "2017-08-01",
        end: "2025-03-31",
        duties: "Residential and community nursing across the northern corridor.",
        verification: "employer_confirmed",
        hours: 9800,
      },
    ],
    phone: "0402 778 341",
  },
  {
    email: "amelia.foster@careproof.com.au",
    name: "Amelia Foster",
    slug: "amelia-foster-nanny-perth",
    headline: "Nanny and after-school carer in Perth's western suburbs",
    bio: "School pick-ups from Christ Church, Scotch and local primaries. Homework, snacks and swimming lessons until 6.30pm.",
    hourlyRateCents: 4300,
    yearsExperience: 8,
    suburb: "Claremont",
    state: "wa",
    city: "perth",
    instantBook: true,
    availableNow: true,
    specialties: ["nannies", "after-school-care", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "wa", months: 22 },
      { type: "first_aid", months: 10 },
      { type: "police_check", months: 10 },
    ],
    work: [
      {
        employer: "The Ibrahim family, Nedlands",
        title: "After-school nanny",
        start: "2019-02-01",
        duties: "Three school-age children, sport runs and school holiday programs.",
        verification: "employer_confirmed",
        hours: 5400,
      },
    ],
    phone: "0455 019 228",
  },
  {
    email: "samuel.adebayo@careproof.com.au",
    name: "Samuel Adebayo",
    slug: "samuel-adebayo-disability-support-perth",
    headline: "NDIS support worker for Perth and Mandurah",
    bio: "Personal care, community access and weekend recreation. I am physically strong, patient and used to hoist transfers.",
    hourlyRateCents: 5100,
    yearsExperience: 7,
    suburb: "Cannington",
    state: "wa",
    city: "perth",
    abn: "12 889 304 551",
    instantBook: true,
    availableNow: true,
    specialties: ["disability-support", "personal-care"],
    credentials: [
      { type: "ndis_screening", issuingState: "wa", months: 21 },
      { type: "police_check", months: 12 },
      { type: "first_aid", months: 18 },
    ],
    work: [
      {
        employer: "Ability Centre",
        title: "Disability support worker",
        start: "2018-11-01",
        duties: "Personal care, community access and overnight SIL.",
        verification: "employer_confirmed",
        hours: 7000,
      },
    ],
    phone: "0488 201 773",
  },
  {
    email: "chloe.bennett@careproof.com.au",
    name: "Chloe Bennett",
    slug: "chloe-bennett-aged-care-adelaide",
    headline: "Aged care worker and companion in Adelaide's eastern suburbs",
    bio: "I support clients with dementia-friendly routines, meal prep and GP visits. Families tell me I bring calm to the house.",
    hourlyRateCents: 4400,
    yearsExperience: 10,
    suburb: "Norwood",
    state: "sa",
    city: "adelaide",
    instantBook: true,
    availableNow: true,
    specialties: ["aged-care", "companion-care", "respite"],
    credentials: [
      { type: "aged_care_screening", issuingState: "sa", months: 20 },
      { type: "police_check", months: 14 },
      { type: "first_aid", months: 11 },
    ],
    work: [
      {
        employer: "Resthaven",
        title: "Community support worker",
        start: "2016-03-01",
        end: "2025-01-31",
        duties: "Home care packages and social support across the eastern suburbs.",
        verification: "employer_confirmed",
        hours: 10200,
      },
    ],
    phone: "0413 990 226",
  },
  {
    email: "harry.ng@careproof.com.au",
    name: "Harry Ng",
    slug: "harry-ng-nanny-adelaide",
    headline: "Male nanny and after-school carer in Adelaide",
    bio: "Great with active kids, sport and homework. I hold a WWCC and drive a dual-cab for weekend sport runs.",
    hourlyRateCents: 3900,
    yearsExperience: 4,
    suburb: "Unley",
    state: "sa",
    city: "adelaide",
    instantBook: true,
    availableNow: false,
    specialties: ["nannies", "after-school-care", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "sa", months: 16 },
      { type: "first_aid", months: 8 },
    ],
    work: [
      {
        employer: "The Rossi family, Unley",
        title: "After-school carer",
        start: "2023-01-16",
        duties: "Two boys, 8 and 11, school pick-up, sport and dinner.",
        verification: "document",
        hours: 1800,
      },
    ],
    phone: "0422 667 109",
  },
  {
    email: "isla.macdonald@careproof.com.au",
    name: "Isla Macdonald",
    slug: "isla-macdonald-nursing-hobart",
    headline: "Registered nurse for in-home care in Hobart and the Eastern Shore",
    bio: "Palliative, post-surgical and aged care nursing in the home. Small caseload, thorough handover notes, AHPRA current.",
    hourlyRateCents: 7400,
    yearsExperience: 13,
    suburb: "Sandy Bay",
    state: "tas",
    city: "hobart",
    abn: "73 552 110 884",
    instantBook: false,
    availableNow: true,
    specialties: ["nursing", "aged-care", "respite"],
    credentials: [
      { type: "ahpra", number: "NMW0001766200", months: 10 },
      { type: "aged_care_screening", issuingState: "tas", months: 15 },
      { type: "police_check", months: 8 },
    ],
    work: [
      {
        employer: "Royal Hobart Hospital",
        title: "Registered nurse",
        start: "2012-01-09",
        end: "2024-07-31",
        duties: "Medical ward and Hospital in the Home.",
        verification: "employer_confirmed",
        hours: 18000,
      },
    ],
    phone: "0438 201 554",
  },
  {
    email: "ben.taylor@careproof.com.au",
    name: "Ben Taylor",
    slug: "ben-taylor-disability-support-hobart",
    headline: "Disability support worker covering Hobart and Kingston",
    bio: "Community access, hiking, cooking skills and SIL overnight. NDIS screening current.",
    hourlyRateCents: 4900,
    yearsExperience: 5,
    suburb: "Kingston",
    state: "tas",
    city: "hobart",
    instantBook: true,
    availableNow: true,
    specialties: ["disability-support", "special-needs"],
    credentials: [
      { type: "ndis_screening", issuingState: "tas", months: 18 },
      { type: "wwcc", issuingState: "tas", months: 18 },
      { type: "first_aid", months: 14 },
    ],
    work: [
      {
        employer: "Baptcare",
        title: "Support worker",
        start: "2021-04-01",
        duties: "Community participation and overnight SIL.",
        verification: "employer_confirmed",
        hours: 3900,
      },
    ],
    phone: "0499 334 118",
  },
  {
    email: "olivia.grant@careproof.com.au",
    name: "Olivia Grant",
    slug: "olivia-grant-nanny-canberra",
    headline: "Nanny and babysitter for Canberra families",
    bio: "I work around parliamentary and APS hours — early starts and late sittings included. WWCC ACT current, first aid current.",
    hourlyRateCents: 4600,
    yearsExperience: 7,
    suburb: "Griffith",
    state: "act",
    city: "canberra",
    instantBook: true,
    availableNow: true,
    specialties: ["nannies", "babysitters", "after-school-care"],
    credentials: [
      { type: "wwcc", issuingState: "act", months: 21 },
      { type: "first_aid", months: 9 },
      { type: "police_check", months: 9 },
    ],
    work: [
      {
        employer: "The Singh family, Griffith",
        title: "Nanny",
        start: "2020-01-13",
        end: "2025-12-20",
        duties: "Two children, flexible hours around sitting weeks.",
        verification: "employer_confirmed",
        hours: 6200,
      },
    ],
    phone: "0414 229 880",
  },
  {
    email: "marcus.hill@careproof.com.au",
    name: "Marcus Hill",
    slug: "marcus-hill-aged-care-canberra",
    headline: "Personal care and respite worker in Canberra and Queanbeyan",
    bio: "Transfers, showers, meal prep and overnight respite. I coordinate with My Aged Care providers and keep a simple daily log.",
    hourlyRateCents: 5000,
    yearsExperience: 8,
    suburb: "Belconnen",
    state: "act",
    city: "canberra",
    abn: "28 441 990 217",
    instantBook: false,
    availableNow: true,
    specialties: ["aged-care", "personal-care", "respite"],
    credentials: [
      { type: "aged_care_screening", issuingState: "act", months: 16 },
      { type: "police_check", months: 11 },
      { type: "first_aid", months: 12 },
    ],
    work: [
      {
        employer: "Community Services #1",
        title: "Care worker",
        start: "2018-06-01",
        duties: "In-home personal care across north Canberra.",
        verification: "employer_confirmed",
        hours: 7800,
      },
    ],
    phone: "0471 880 442",
  },
  {
    email: "fatima.yilmaz@careproof.com.au",
    name: "Fatima Yilmaz",
    slug: "fatima-yilmaz-disability-support-darwin",
    headline: "NDIS support worker in Darwin and Palmerston",
    bio: "Community access, cultural events and personal care. I speak English and Turkish and am used to the Top End climate and travel times.",
    hourlyRateCents: 5400,
    yearsExperience: 6,
    suburb: "Nightcliff",
    state: "nt",
    city: "darwin",
    instantBook: true,
    availableNow: true,
    specialties: ["disability-support", "personal-care", "special-needs"],
    credentials: [
      { type: "ndis_screening", issuingState: "nt", months: 19 },
      { type: "wwcc", issuingState: "nt", months: 19 },
      { type: "first_aid", months: 13 },
    ],
    work: [
      {
        employer: "Somerville Community Services",
        title: "Support worker",
        start: "2019-09-01",
        duties: "Community access and personal care in Darwin and Palmerston.",
        verification: "employer_confirmed",
        hours: 5600,
      },
    ],
    phone: "0401 228 773",
  },
  {
    email: "jack.murray@careproof.com.au",
    name: "Jack Murray",
    slug: "jack-murray-aged-care-darwin",
    headline: "Aged care worker for Darwin and rural Top End visits",
    bio: "Personal care, hospital transport and companion visits. 4WD and comfortable with longer drives when families need cover in Palmerston or rural blocks.",
    hourlyRateCents: 5100,
    yearsExperience: 9,
    suburb: "Stuart Park",
    state: "nt",
    city: "darwin",
    instantBook: false,
    availableNow: false,
    specialties: ["aged-care", "companion-care", "personal-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "nt", months: 14 },
      { type: "police_check", months: 10 },
    ],
    work: [
      {
        employer: "Frontier Services",
        title: "Community aged care worker",
        start: "2017-02-01",
        duties: "Remote and urban aged care visits across the Top End.",
        verification: "document",
        hours: 8000,
      },
    ],
    phone: "0427 119 005",
  },
  {
    email: "ruby.shaw@careproof.com.au",
    name: "Ruby Shaw",
    slug: "ruby-shaw-nanny-gold-coast",
    headline: "Casual babysitter and nanny from Broadbeach to Tweed",
    bio: "Evenings, weekends and school holidays. Great with multiple kids and beach days. Blue Card current.",
    hourlyRateCents: 3600,
    yearsExperience: 3,
    suburb: "Broadbeach",
    state: "qld",
    city: "gold-coast",
    instantBook: true,
    availableNow: true,
    specialties: ["babysitters", "nannies"],
    credentials: [
      { type: "wwcc", issuingState: "qld", months: 20 },
      { type: "first_aid", months: 7 },
    ],
    work: [
      {
        employer: "Local Gold Coast families",
        title: "Babysitter",
        start: "2023-06-01",
        duties: "Casual evenings and weekend care for four regular families.",
        verification: "document",
        hours: 900,
      },
    ],
    phone: "0450 882 119",
  },
  {
    email: "ethan.cole@careproof.com.au",
    name: "Ethan Cole",
    slug: "ethan-cole-special-needs-sydney",
    headline: "Special needs carer and after-school support in Sydney",
    bio: "I support autistic children and teens with after-school regulation, community access and sibling-inclusive play. Positive behaviour support trained.",
    hourlyRateCents: 5800,
    yearsExperience: 8,
    suburb: "Ryde",
    state: "nsw",
    city: "sydney",
    abn: "61 229 448 001",
    instantBook: false,
    availableNow: true,
    specialties: ["special-needs", "disability-support", "after-school-care"],
    credentials: [
      { type: "ndis_screening", issuingState: "nsw", months: 23 },
      { type: "wwcc", issuingState: "nsw", months: 23 },
      { type: "first_aid", months: 15 },
    ],
    work: [
      {
        employer: "Aspect (Autism Spectrum Australia)",
        title: "Educator / support worker",
        start: "2018-01-15",
        end: "2024-12-20",
        duties: "After-school and holiday programs for autistic children.",
        verification: "employer_confirmed",
        hours: 6900,
      },
    ],
    phone: "0419 334 770",
  },
  {
    email: "nina.kovac@careproof.com.au",
    name: "Nina Kovac",
    slug: "nina-kovac-housekeeping-sydney",
    headline: "Housekeeper for busy Sydney households",
    bio: "Weekly and fortnightly cleans, laundry and pantry organisation. Police checked. I bring my own products unless you prefer yours.",
    hourlyRateCents: 4000,
    yearsExperience: 11,
    suburb: "Surry Hills",
    state: "nsw",
    city: "sydney",
    instantBook: true,
    availableNow: true,
    specialties: ["housekeeping"],
    credentials: [{ type: "police_check", months: 6 }],
    work: [
      {
        employer: "Private clients, eastern suburbs",
        title: "Housekeeper",
        start: "2015-04-01",
        duties: "Recurring domestic work for six households.",
        verification: "document",
        hours: 9000,
      },
    ],
    phone: "0405 118 226",
  },
  {
    email: "william.park@careproof.com.au",
    name: "William Park",
    slug: "william-park-respite-melbourne",
    headline: "Overnight respite and companion care in Melbourne",
    bio: "I take the night shift so family carers can sleep. Quiet, experienced with dementia sundowning and continence care.",
    hourlyRateCents: 5600,
    yearsExperience: 15,
    suburb: "Preston",
    state: "vic",
    city: "melbourne",
    abn: "33 671 229 440",
    instantBook: true,
    availableNow: true,
    specialties: ["respite", "aged-care", "companion-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "vic", months: 25 },
      { type: "police_check", months: 12 },
      { type: "first_aid", months: 19 },
    ],
    work: [
      {
        employer: "Mecwacare",
        title: "Respite carer",
        start: "2011-07-01",
        duties: "In-home overnight and weekend respite.",
        verification: "employer_confirmed",
        hours: 16000,
      },
    ],
    phone: "0431 667 900",
  },
  {
    email: "zoe.anderson@careproof.com.au",
    name: "Zoe Anderson",
    slug: "zoe-anderson-nanny-brisbane",
    headline: "Newborn and infant nanny in Brisbane",
    bio: "Sleep settling, bottles, and the first 12 months. I have supported four families through maternity leave returns.",
    hourlyRateCents: 4800,
    yearsExperience: 9,
    suburb: "New Farm",
    state: "qld",
    city: "brisbane",
    instantBook: false,
    availableNow: true,
    specialties: ["nannies", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "qld", months: 28 },
      { type: "first_aid", months: 14 },
      { type: "police_check", months: 14 },
    ],
    work: [
      {
        employer: "The Hart family, New Farm",
        title: "Newborn nanny",
        start: "2023-08-01",
        duties: "Twins from 8 weeks, overnight and day support.",
        verification: "employer_confirmed",
        hours: 2200,
      },
      {
        employer: "The Ali family, Teneriffe",
        title: "Maternity nanny",
        start: "2021-01-10",
        end: "2023-06-30",
        duties: "Infant care and household reset after birth.",
        verification: "employer_confirmed",
        hours: 2800,
      },
    ],
    phone: "0467 229 118",
  },
  {
    email: "chris.owens@careproof.com.au",
    name: "Chris Owens",
    slug: "chris-owens-personal-care-wollongong",
    headline: "Personal care assistant for the Illawarra",
    bio: "Showers, dressing, meal prep and transport to Wollongong Hospital. Male carer available when families specifically request one.",
    hourlyRateCents: 4500,
    yearsExperience: 7,
    suburb: "Figtree",
    state: "nsw",
    city: "wollongong",
    instantBook: true,
    availableNow: true,
    specialties: ["personal-care", "aged-care"],
    credentials: [
      { type: "aged_care_screening", issuingState: "nsw", months: 13 },
      { type: "police_check", months: 8 },
      { type: "first_aid", months: 8 },
    ],
    work: [
      {
        employer: "Warrigal",
        title: "Care services employee",
        start: "2018-10-01",
        end: "2025-02-28",
        duties: "Residential and community personal care.",
        verification: "employer_confirmed",
        hours: 7600,
      },
    ],
    phone: "0428 554 003",
  },
  {
    email: "lara.schmidt@careproof.com.au",
    name: "Lara Schmidt",
    slug: "lara-schmidt-companion-care-adelaide",
    headline: "Companion carer for Adelaide's coastal suburbs",
    bio: "Coffee outings, garden time and help with correspondence. German and English. I am a good fit for socially isolated clients.",
    hourlyRateCents: 3700,
    yearsExperience: 6,
    suburb: "Glenelg",
    state: "sa",
    city: "adelaide",
    instantBook: true,
    availableNow: true,
    specialties: ["companion-care", "housekeeping"],
    credentials: [
      { type: "police_check", months: 9 },
      { type: "aged_care_screening", issuingState: "sa", months: 9 },
    ],
    work: [
      {
        employer: "Helping Hand",
        title: "Social support worker",
        start: "2020-05-01",
        duties: "Companion visits and domestic assistance.",
        verification: "employer_confirmed",
        hours: 4300,
      },
    ],
    phone: "0416 778 220",
  },
  {
    email: "owen.fraser@careproof.com.au",
    name: "Owen Fraser",
    slug: "owen-fraser-after-school-canberra",
    headline: "After-school carer and homework help in Canberra",
    bio: "Primary and high-school pick-ups, tutoring-lite and dinner. I used to teach relief in ACT public schools.",
    hourlyRateCents: 4100,
    yearsExperience: 5,
    suburb: "Lyneham",
    state: "act",
    city: "canberra",
    instantBook: true,
    availableNow: true,
    specialties: ["after-school-care", "nannies", "babysitters"],
    credentials: [
      { type: "wwcc", issuingState: "act", months: 17 },
      { type: "first_aid", months: 17 },
    ],
    work: [
      {
        employer: "ACT Education Directorate",
        title: "Relief teacher",
        start: "2019-02-01",
        end: "2023-12-15",
        duties: "Primary relief teaching across north Canberra.",
        verification: "employer_confirmed",
        hours: 4000,
      },
    ],
    phone: "0449 201 336",
  },
];

function addMonths(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.careRequest.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.workHistory.deleteMany();
  await prisma.caregiverSpecialty.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.specialty.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const specialtyRecords = [];
  for (const spec of specialties) {
    specialtyRecords.push(await prisma.specialty.create({ data: spec }));
  }
  const specBySlug = Object.fromEntries(specialtyRecords.map((s) => [s.slug, s]));

  const stateRecords = [];
  for (const state of states) {
    stateRecords.push(
      await prisma.state.create({
        data: {
          ...state,
          seoTitle: `Carers in ${state.name}`,
          seoDescription: `Find verified carers, nannies and support workers across ${state.name}. Compare experience, checks and rates on CareProof.`,
        },
      }),
    );
  }
  const stateBySlug = Object.fromEntries(stateRecords.map((s) => [s.slug, s]));

  const cityRecords: { key: string; id: string }[] = [];
  for (const [stateSlug, cities] of Object.entries(citiesByState)) {
    const state = stateBySlug[stateSlug];
    for (const city of cities) {
      const created = await prisma.city.create({
        data: {
          slug: city.slug,
          name: city.name,
          stateId: state.id,
          lat: city.lat,
          lng: city.lng,
          seoTitle: `Carers in ${city.name}, ${state.abbrev}`,
          seoDescription: `Verified carers in ${city.name}, ${state.name}. Browse aged care, nannies, NDIS support workers and more on CareProof.`,
        },
      });
      cityRecords.push({ key: `${stateSlug}:${city.slug}`, id: created.id });
    }
  }
  const cityId = (state: string, city: string) => {
    const found = cityRecords.find((c) => c.key === `${state}:${city}`);
    if (!found) throw new Error(`Missing city ${state}/${city}`);
    return found.id;
  };

  const familyUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "family@careproof.com.au",
        passwordHash,
        name: "Alex Martin",
        phone: "0400 111 222",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Marrickville",
            cityId: cityId("nsw", "sydney"),
            bio: "Looking after Mum at home in Marrickville. We need reliable weekday cover.",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "family2@careproof.com.au",
        passwordHash,
        name: "Jess and Sam Clarke",
        phone: "0400 333 444",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Brunswick",
            cityId: cityId("vic", "melbourne"),
            bio: "Two kids under 8. We need after-school and occasional Saturday nights.",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "family3@careproof.com.au",
        passwordHash,
        name: "David Okonkwo",
        phone: "0400 555 666",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Chermside",
            cityId: cityId("qld", "brisbane"),
            bio: "NDIS plan manager for my brother. Looking for weekend community access.",
          },
        },
      },
    }),
  ]);

  const carerProfiles = [];
  for (const carer of carers) {
    const verifiedHours = carer.work.reduce((sum, w) => sum + w.hours, 0);
    const created = await prisma.user.create({
      data: {
        email: carer.email,
        passwordHash,
        name: carer.name,
        phone: carer.phone,
        role: "CAREGIVER",
        caregiverProfile: {
          create: {
            slug: carer.slug,
            headline: carer.headline,
            bio: carer.bio,
            hourlyRateCents: carer.hourlyRateCents,
            yearsExperience: carer.yearsExperience,
            suburb: carer.suburb,
            cityId: cityId(carer.state, carer.city),
            abn: carer.abn,
            instantBook: carer.instantBook,
            availableNow: carer.availableNow,
            lastActiveAt: new Date(),
            verifiedHours,
            completedJobs: carer.work.some((w) => w.verification === "platform_completed") ? 2 : 0,
            specialties: {
              create: carer.specialties.map((slug) => ({
                specialtyId: specBySlug[slug].id,
              })),
            },
            credentials: {
              create: carer.credentials.map((c) => ({
                type: c.type,
                issuingState: c.issuingState,
                number: c.number,
                expiresAt: addMonths(c.months),
                verified: true,
                verifiedAt: new Date("2025-11-01"),
              })),
            },
            workHistory: {
              create: carer.work.map((w) => ({
                employer: w.employer,
                title: w.title,
                startDate: new Date(w.start),
                endDate: w.end ? new Date(w.end) : null,
                duties: w.duties,
                verification: w.verification,
                hours: w.hours,
              })),
            },
          },
        },
      },
      include: { caregiverProfile: true },
    });
    carerProfiles.push(created);
  }

  const sarah = carerProfiles.find((u) => u.email === "carer@careproof.com.au")!.caregiverProfile!;
  const priya = carerProfiles.find((u) => u.email === "priya.nair@careproof.com.au")!.caregiverProfile!;
  const maya = carerProfiles.find((u) => u.email === "maya.chen@careproof.com.au")!.caregiverProfile!;
  const daniel = carerProfiles.find((u) => u.email === "daniel.kemp@careproof.com.au")!.caregiverProfile!;
  const chloe = carerProfiles.find((u) => u.email === "chloe.bennett@careproof.com.au")!.caregiverProfile!;
  const william = carerProfiles.find((u) => u.email === "william.park@careproof.com.au")!.caregiverProfile!;

  const requests = await Promise.all([
    prisma.careRequest.create({
      data: {
        slug: "weekday-aged-care-marrickville",
        familyId: familyUsers[0].id,
        specialtyId: specBySlug["aged-care"].id,
        cityId: cityId("nsw", "sydney"),
        title: "Weekday aged care for Mum in Marrickville",
        description:
          "Looking for a verified carer 3 mornings a week (Mon/Wed/Fri, 8am–12pm) to help with showering, breakfast and a short walk. Mum is 82, mobile with a stick, and likes a quiet routine. WWCC not required; aged care screening and police check preferred.",
        budgetType: "hourly",
        budgetCents: 6500,
        startDate: new Date("2026-09-15"),
        hoursEstimate: 12,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "after-school-nanny-brunswick",
        familyId: familyUsers[1].id,
        specialtyId: specBySlug["after-school-care"].id,
        cityId: cityId("vic", "melbourne"),
        title: "After-school nanny in Brunswick, two children",
        description:
          "Pick-up from Brunswick South Primary at 3.20pm, homework, snacks and dinner by 6.30pm. Tuesday–Thursday. WWCC Victoria essential. Our kids are 6 and 8.",
        budgetType: "hourly",
        budgetCents: 4400,
        startDate: new Date("2026-09-22"),
        hoursEstimate: 10,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "ndis-weekend-community-access-brisbane",
        familyId: familyUsers[2].id,
        specialtyId: specBySlug["disability-support"].id,
        cityId: cityId("qld", "brisbane"),
        title: "NDIS weekend community access in north Brisbane",
        description:
          "Saturday community access for my brother (26, intellectual disability). Bowling, markets or a swim, then home. NDIS screening and Blue Card required. Own reliable car preferred.",
        budgetType: "hourly",
        budgetCents: 5400,
        startDate: new Date("2026-09-20"),
        hoursEstimate: 6,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "overnight-respite-adelaide",
        familyId: familyUsers[0].id,
        specialtyId: specBySlug["respite"].id,
        cityId: cityId("sa", "adelaide"),
        title: "Overnight respite in Norwood this month",
        description:
          "Need two overnight sits so I can stay with family interstate. Client is 79, lives alone, no overnight behaviours of concern. Must have aged care screening.",
        budgetType: "hourly",
        budgetCents: 4800,
        startDate: new Date("2026-09-18"),
        hoursEstimate: 16,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "saturday-babysitter-sydney",
        familyId: familyUsers[1].id,
        specialtyId: specBySlug["babysitters"].id,
        cityId: cityId("nsw", "sydney"),
        title: "Saturday night babysitter in Bondi",
        description:
          "Two children (4 and 7), 6pm–11pm most Saturdays. Dinner is leftover, bedtime 7.30/8. WWCC required.",
        budgetType: "hourly",
        budgetCents: 4000,
        startDate: new Date("2026-09-12"),
        hoursEstimate: 5,
        status: "open",
      },
    }),
  ]);

  await prisma.proposal.createMany({
    data: [
      {
        careRequestId: requests[0].id,
        caregiverId: sarah.id,
        coverLetter:
          "I live in Marrickville and already support a nearby client. I can do Mon/Wed/Fri mornings and I am an RN if Mum's needs change.",
        rateCents: 6800,
        status: "pending",
      },
      {
        careRequestId: requests[1].id,
        caregiverId: maya.id,
        coverLetter:
          "I pick up from nearby schools already and can start the week of 22 September. WWCC Victoria current.",
        rateCents: 4500,
        status: "pending",
      },
      {
        careRequestId: requests[2].id,
        caregiverId: daniel.id,
        coverLetter:
          "I have a car, NDIS screening and a Blue Card. Saturdays 9–3 are free. Happy to plan a simple community access routine.",
        rateCents: 5300,
        status: "pending",
      },
      {
        careRequestId: requests[4].id,
        caregiverId: priya.id,
        coverLetter:
          "I am five minutes from Bondi and do regular Saturday nights. WWCC NSW current.",
        rateCents: 4200,
        status: "pending",
      },
    ],
  });

  const releasedStart = new Date("2026-07-12T08:00:00+10:00");
  const releasedEnd = new Date("2026-07-12T16:00:00+10:00");
  const booking1 = await prisma.booking.create({
    data: {
      familyId: familyUsers[0].id,
      caregiverId: sarah.id,
      specialtyId: specBySlug["aged-care"].id,
      startAt: releasedStart,
      endAt: releasedEnd,
      hours: 8,
      rateCents: 6800,
      subtotalCents: 54400,
      platformFeeCents: 5440,
      gstCents: 4945,
      totalCents: 59840,
      notes: "First Saturday cover while we were interstate.",
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 59840,
          platformFeeCents: 5440,
          caregiverPayoutCents: 54400,
          status: "released",
          heldAt: releasedStart,
          releasedAt: new Date("2026-07-15T10:00:00+10:00"),
        },
      },
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      familyId: familyUsers[1].id,
      caregiverId: maya.id,
      specialtyId: specBySlug["nannies"].id,
      startAt: new Date("2026-06-04T15:00:00+10:00"),
      endAt: new Date("2026-06-04T19:00:00+10:00"),
      hours: 4,
      rateCents: 4500,
      subtotalCents: 18000,
      platformFeeCents: 1800,
      gstCents: 1636,
      totalCents: 19800,
      notes: "Thursday after-school trial.",
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 19800,
          platformFeeCents: 1800,
          caregiverPayoutCents: 18000,
          status: "released",
          heldAt: new Date("2026-06-03T12:00:00+10:00"),
          releasedAt: new Date("2026-06-07T09:00:00+10:00"),
        },
      },
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      familyId: familyUsers[0].id,
      caregiverId: chloe.id,
      specialtyId: specBySlug["aged-care"].id,
      startAt: new Date("2026-05-20T09:00:00+09:30"),
      endAt: new Date("2026-05-20T15:00:00+09:30"),
      hours: 6,
      rateCents: 4400,
      subtotalCents: 26400,
      platformFeeCents: 2640,
      gstCents: 2400,
      totalCents: 29040,
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 29040,
          platformFeeCents: 2640,
          caregiverPayoutCents: 26400,
          status: "released",
          heldAt: new Date("2026-05-19T10:00:00+09:30"),
          releasedAt: new Date("2026-05-23T10:00:00+09:30"),
        },
      },
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      familyId: familyUsers[1].id,
      caregiverId: william.id,
      specialtyId: specBySlug["respite"].id,
      startAt: new Date("2026-04-11T20:00:00+10:00"),
      endAt: new Date("2026-04-12T07:00:00+10:00"),
      hours: 11,
      rateCents: 5600,
      subtotalCents: 61600,
      platformFeeCents: 6160,
      gstCents: 5600,
      totalCents: 67760,
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 67760,
          platformFeeCents: 6160,
          caregiverPayoutCents: 61600,
          status: "released",
          heldAt: new Date("2026-04-10T12:00:00+10:00"),
          releasedAt: new Date("2026-04-15T09:00:00+10:00"),
        },
      },
    },
  });

  await prisma.review.createMany({
    data: [
      {
        bookingId: booking1.id,
        authorId: familyUsers[0].id,
        caregiverId: sarah.id,
        rating: 5,
        body: "Sarah was exactly what we needed — clinical, kind, and she left a clear note for the next morning. Mum asked when she was coming back.",
      },
      {
        bookingId: booking2.id,
        authorId: familyUsers[1].id,
        caregiverId: maya.id,
        rating: 5,
        body: "Kids were settled, homework done, and Maya messaged a photo from the park. Instant book again without thinking.",
      },
      {
        bookingId: booking3.id,
        authorId: familyUsers[0].id,
        caregiverId: chloe.id,
        rating: 5,
        body: "Thoughtful companion visit. Chloe noticed Mum hadn't been eating lunch and flagged it without fuss.",
      },
      {
        bookingId: booking4.id,
        authorId: familyUsers[1].id,
        caregiverId: william.id,
        rating: 4,
        body: "Overnight respite went smoothly. We actually slept. Would book again for long weekends.",
      },
    ],
  });

  async function refreshAggregates(caregiverId: string) {
    const reviews = await prisma.review.findMany({ where: { caregiverId } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.caregiverProfile.update({
      where: { id: caregiverId },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
        completedJobs: reviews.length,
      },
    });
  }

  await refreshAggregates(sarah.id);
  await refreshAggregates(maya.id);
  await refreshAggregates(chloe.id);
  await refreshAggregates(william.id);

  console.log(`Seeded ${carerProfiles.length} carers, ${familyUsers.length} families, ${requests.length} jobs.`);
  console.log("Demo logins: family@careproof.com.au / carer@careproof.com.au / CareProof123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
