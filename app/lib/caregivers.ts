// Shared caregiver domain model + mock data source.
//
// PRODUCTION NOTE: In a real system this module would be replaced by a
// database access layer. Identity/background-check/credential fields would be
// populated by integrations with real providers (e.g. an ID-verification
// vendor, a background-check provider such as Checkr/Sterling, and a
// credentials registry), never hard-coded. Coordinates would come from a
// geocoding service rather than being stored inline.

export type CaregiverStatus = 'online' | 'busy' | 'offline';

export type BackgroundCheckStatus =
  | 'passed'
  | 'pending'
  | 'failed'
  | 'not_started';

export type VerificationLevel =
  | 'Unverified'
  | 'Basic'
  | 'Verified'
  | 'Fully vetted';

export interface Certification {
  /** Human-readable credential name, e.g. "Certified Nursing Assistant". */
  name: string;
  /** Issuing authority, e.g. "State Board of Nursing". */
  issuer: string;
  /** Year the credential was issued. */
  issuedYear: number;
  /** Year the credential expires, when applicable. */
  expiresYear?: number;
}

/** Australian state / territory abbreviation. */
export type AustralianRegion =
  | 'NSW'
  | 'VIC'
  | 'QLD'
  | 'WA'
  | 'SA'
  | 'TAS'
  | 'ACT'
  | 'NT';

export const AUSTRALIAN_REGIONS: readonly AustralianRegion[] = [
  'NSW',
  'VIC',
  'QLD',
  'WA',
  'SA',
  'TAS',
  'ACT',
  'NT',
];

export interface CaregiverLocation {
  /** Suburb / neighbourhood within the city. */
  area: string;
  city: string;
  /** State / territory abbreviation. */
  region: AustralianRegion;
  /** Australian 4-digit postcode. */
  postcode: string;
  /** WGS84 latitude in decimal degrees. */
  lat: number;
  /** WGS84 longitude in decimal degrees. */
  lng: number;
}

export interface BackgroundCheck {
  status: BackgroundCheckStatus;
  /** ISO-8601 date the check most recently completed, when available. */
  date?: string;
}

/** Stable core profile. Everything here is deterministic per caregiver. */
export interface Caregiver {
  id: string;
  name: string;
  bio: string;
  location: CaregiverLocation;
  yearsExperience: number;
  /** Average review rating, 0–5. */
  rating: number;
  reviewsCount: number;
  referencesCount: number;
  identityVerified: boolean;
  backgroundCheck: BackgroundCheck;
  certifications: Certification[];
}

/** A caregiver with a live, per-request presence status attached. */
export interface LiveCaregiver extends Caregiver {
  status: CaregiverStatus;
  lastSeen: string;
}

/**
 * Individual vetting checks that make up a caregiver's overall verification
 * level. Surfaced in the UI so end users can see exactly what was verified.
 */
export interface VerificationChecks {
  identityVerified: boolean;
  backgroundCheckPassed: boolean;
  hasCredentials: boolean;
  hasReferences: boolean;
}

export interface VerificationSummary {
  level: VerificationLevel;
  /** Number of passed checks, 0–4. */
  score: number;
  checks: VerificationChecks;
}

/**
 * How local a caregiver is relative to a chosen origin, in precedence order.
 * The guiding principle is "locals like to deal with locals": we prefer a
 * shared suburb, then a shared postcode district, then a shared state.
 */
export type LocalityTier = 'same-suburb' | 'same-area' | 'same-state' | 'other';

/** Lower rank sorts first (more local). */
export const LOCALITY_TIER_RANK: Record<LocalityTier, number> = {
  'same-suburb': 0,
  'same-area': 1,
  'same-state': 2,
  other: 3,
};

/** Shape returned by the caregivers API and consumed by the client UI. */
export interface CaregiverWithVerification extends LiveCaregiver {
  verification: VerificationSummary;
  /** Straight-line distance (km) from a requested origin, when provided. */
  distanceKm?: number;
  /** Local-to-local tier relative to the chosen origin, when provided. */
  localityTier?: LocalityTier;
}

// Stable mock data. Deliberately spans the full verification spectrum and
// several distinct Australian localities across NSW, VIC and QLD so the
// local-vs-distant distinction is meaningful.
//
// PRODUCTION NOTE: Suburb coordinates and postcodes would come from a geocoding
// / address-validation service (e.g. against the Australia Post PAF), not be
// hard-coded here.
const caregivers: Caregiver[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    bio: 'Experienced elder-care specialist focused on dementia and post-operative recovery support.',
    location: {
      area: 'Bondi',
      city: 'Sydney',
      region: 'NSW',
      postcode: '2026',
      lat: -33.8915,
      lng: 151.2767,
    },
    yearsExperience: 12,
    rating: 4.9,
    reviewsCount: 187,
    referencesCount: 5,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-06-14' },
    certifications: [
      {
        name: 'Certificate III in Individual Support (Ageing)',
        issuer: 'TAFE NSW',
        issuedYear: 2015,
        expiresYear: 2028,
      },
      {
        name: 'Provide First Aid (HLTAID011)',
        issuer: 'St John Ambulance Australia',
        issuedYear: 2024,
        expiresYear: 2027,
      },
    ],
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    bio: 'Home care worker supporting mobility, medication reminders, and daily living activities.',
    location: {
      area: 'Newtown',
      city: 'Sydney',
      region: 'NSW',
      postcode: '2042',
      lat: -33.8983,
      lng: 151.1794,
    },
    yearsExperience: 6,
    rating: 4.6,
    reviewsCount: 74,
    referencesCount: 3,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-04-02' },
    certifications: [
      {
        name: 'Certificate IV in Ageing Support',
        issuer: 'TAFE NSW',
        issuedYear: 2020,
      },
    ],
  },
  {
    id: 'c3',
    name: 'Emma Williams',
    bio: 'Companion carer newly onboarded to the platform; references pending review.',
    location: {
      area: 'Parramatta',
      city: 'Sydney',
      region: 'NSW',
      postcode: '2150',
      lat: -33.8136,
      lng: 151.0034,
    },
    yearsExperience: 2,
    rating: 4.1,
    reviewsCount: 9,
    referencesCount: 1,
    identityVerified: true,
    backgroundCheck: { status: 'pending' },
    certifications: [],
  },
  {
    id: 'c4',
    name: 'David Nguyen',
    bio: 'Certified carer specialising in physiotherapy support and fall-risk management.',
    location: {
      area: 'Fitzroy',
      city: 'Melbourne',
      region: 'VIC',
      postcode: '3065',
      lat: -37.7963,
      lng: 144.9789,
    },
    yearsExperience: 9,
    rating: 4.8,
    reviewsCount: 132,
    referencesCount: 4,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-05-21' },
    certifications: [
      {
        name: 'Certificate III in Individual Support (Ageing)',
        issuer: 'TAFE Victoria',
        issuedYear: 2017,
        expiresYear: 2027,
      },
    ],
  },
  {
    id: 'c5',
    name: 'Lisa Anderson',
    bio: 'Overnight care provider. Identity confirmed; background check did not clear on last run.',
    location: {
      area: 'St Kilda',
      city: 'Melbourne',
      region: 'VIC',
      postcode: '3182',
      lat: -37.8676,
      lng: 144.981,
    },
    yearsExperience: 4,
    rating: 3.9,
    reviewsCount: 21,
    referencesCount: 2,
    identityVerified: true,
    backgroundCheck: { status: 'failed', date: '2026-03-10' },
    certifications: [
      {
        name: 'Provide First Aid (HLTAID011)',
        issuer: 'Australian Red Cross',
        issuedYear: 2023,
        expiresYear: 2026,
      },
    ],
  },
  {
    id: 'c6',
    name: 'James Okafor',
    bio: 'Prospective carer awaiting identity and background verification.',
    location: {
      area: 'Fortitude Valley',
      city: 'Brisbane',
      region: 'QLD',
      postcode: '4006',
      lat: -27.457,
      lng: 153.035,
    },
    yearsExperience: 1,
    rating: 0,
    reviewsCount: 0,
    referencesCount: 0,
    identityVerified: false,
    backgroundCheck: { status: 'not_started' },
    certifications: [],
  },
];

/** Returns the full stable roster (no live status attached). */
export function getCaregivers(): Caregiver[] {
  return caregivers;
}

/** Looks up a single caregiver by id, or `undefined` if not found. */
export function getCaregiverById(id: string): Caregiver | undefined {
  return caregivers.find((c) => c.id === id);
}

/** A pickable locality, derived from the distinct suburbs in the roster. */
export interface Locality {
  /** Postcode, used as the stable id for the picker. */
  id: string;
  area: string;
  city: string;
  region: AustralianRegion;
  postcode: string;
  lat: number;
  lng: number;
}

/**
 * Builds the list of suburbs offered by the locality picker directly from the
 * caregiver data, so the two never drift apart. One entry per distinct
 * postcode, sorted by state then suburb for a tidy dropdown.
 */
export function getLocalities(): Locality[] {
  const byPostcode = new Map<string, Locality>();
  for (const { location } of caregivers) {
    if (byPostcode.has(location.postcode)) continue;
    byPostcode.set(location.postcode, {
      id: location.postcode,
      area: location.area,
      city: location.city,
      region: location.region,
      postcode: location.postcode,
      lat: location.lat,
      lng: location.lng,
    });
  }
  return [...byPostcode.values()].sort(
    (a, b) => a.region.localeCompare(b.region) || a.area.localeCompare(b.area),
  );
}

/** The postcode "district" is the first two digits (e.g. 2026 → "20"). */
function postcodeDistrict(postcode: string): string {
  return postcode.slice(0, 2);
}

export interface LocalityMatch {
  postcode?: string;
  region?: AustralianRegion;
}

/**
 * Classifies how local a caregiver is relative to a chosen origin, honouring
 * the "locals like to deal with locals" precedence: same suburb (postcode)
 * first, then same postcode district / adjacent suburbs, then same state,
 * then everything else.
 */
export function classifyLocality(
  origin: LocalityMatch,
  location: CaregiverLocation,
): LocalityTier {
  if (origin.postcode && location.postcode === origin.postcode) {
    return 'same-suburb';
  }
  if (
    origin.postcode &&
    postcodeDistrict(location.postcode) === postcodeDistrict(origin.postcode) &&
    (origin.region === undefined || location.region === origin.region)
  ) {
    return 'same-area';
  }
  if (origin.region && location.region === origin.region) {
    return 'same-state';
  }
  return 'other';
}

/**
 * Computes which vetting checks passed and derives an overall verification
 * level. This is intentionally transparent: the level is a pure function of
 * the individual checks so the UI can explain exactly why a badge was awarded.
 */
export function computeVerification(caregiver: Caregiver): VerificationSummary {
  const checks: VerificationChecks = {
    identityVerified: caregiver.identityVerified,
    backgroundCheckPassed: caregiver.backgroundCheck.status === 'passed',
    hasCredentials: caregiver.certifications.length > 0,
    hasReferences: caregiver.referencesCount >= 2,
  };

  const score =
    (checks.identityVerified ? 1 : 0) +
    (checks.backgroundCheckPassed ? 1 : 0) +
    (checks.hasCredentials ? 1 : 0) +
    (checks.hasReferences ? 1 : 0);

  // A background-check failure caps a caregiver at "Unverified" regardless of
  // other signals, since safety is the priority for end users.
  let level: VerificationLevel;
  if (caregiver.backgroundCheck.status === 'failed' || score === 0) {
    level = 'Unverified';
  } else if (score >= 4) {
    level = 'Fully vetted';
  } else if (checks.identityVerified && checks.backgroundCheckPassed) {
    level = 'Verified';
  } else {
    level = 'Basic';
  }

  return { level, score, checks };
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance in kilometres between two coordinates (haversine).
 *
 * PRODUCTION NOTE: A real system would geocode a user's typed address via a
 * geocoding provider and likely use routing/travel-time distance rather than
 * straight-line distance.
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
