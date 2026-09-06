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

export interface CaregiverLocation {
  /** Neighborhood / district within the city. */
  area: string;
  city: string;
  region: string;
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

/** Shape returned by the caregivers API and consumed by the client UI. */
export interface CaregiverWithVerification extends LiveCaregiver {
  verification: VerificationSummary;
  /** Straight-line distance (km) from a requested origin, when provided. */
  distanceKm?: number;
}

// Stable mock data. Deliberately spans the full verification spectrum and
// several distinct localities so proximity sorting/filtering is meaningful.
const caregivers: Caregiver[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    bio: 'Experienced elder-care specialist focused on dementia and post-operative recovery support.',
    location: {
      area: 'Mission District',
      city: 'San Francisco',
      region: 'CA',
      lat: 37.7599,
      lng: -122.4148,
    },
    yearsExperience: 12,
    rating: 4.9,
    reviewsCount: 187,
    referencesCount: 5,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-06-14' },
    certifications: [
      {
        name: 'Certified Nursing Assistant (CNA)',
        issuer: 'California Department of Public Health',
        issuedYear: 2015,
        expiresYear: 2028,
      },
      {
        name: 'CPR & First Aid',
        issuer: 'American Red Cross',
        issuedYear: 2024,
        expiresYear: 2026,
      },
    ],
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    bio: 'Home health aide supporting mobility, medication reminders, and daily living activities.',
    location: {
      area: 'SoMa',
      city: 'San Francisco',
      region: 'CA',
      lat: 37.7785,
      lng: -122.4056,
    },
    yearsExperience: 6,
    rating: 4.6,
    reviewsCount: 74,
    referencesCount: 3,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-04-02' },
    certifications: [
      {
        name: 'Home Health Aide (HHA)',
        issuer: 'National Association for Home Care',
        issuedYear: 2020,
      },
    ],
  },
  {
    id: 'c3',
    name: 'Emma Williams',
    bio: 'Companion caregiver newly onboarded to the platform; references pending review.',
    location: {
      area: 'Berkeley Hills',
      city: 'Berkeley',
      region: 'CA',
      lat: 37.8801,
      lng: -122.2578,
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
    name: 'David Martinez',
    bio: 'Certified caregiver specializing in physical therapy support and fall-risk management.',
    location: {
      area: 'Downtown',
      city: 'Oakland',
      region: 'CA',
      lat: 37.8044,
      lng: -122.2712,
    },
    yearsExperience: 9,
    rating: 4.8,
    reviewsCount: 132,
    referencesCount: 4,
    identityVerified: true,
    backgroundCheck: { status: 'passed', date: '2026-05-21' },
    certifications: [
      {
        name: 'Certified Nursing Assistant (CNA)',
        issuer: 'California Department of Public Health',
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
      area: 'Palo Alto',
      city: 'Palo Alto',
      region: 'CA',
      lat: 37.4419,
      lng: -122.143,
    },
    yearsExperience: 4,
    rating: 3.9,
    reviewsCount: 21,
    referencesCount: 2,
    identityVerified: true,
    backgroundCheck: { status: 'failed', date: '2026-03-10' },
    certifications: [
      {
        name: 'CPR & First Aid',
        issuer: 'American Heart Association',
        issuedYear: 2023,
        expiresYear: 2025,
      },
    ],
  },
  {
    id: 'c6',
    name: 'James Okafor',
    bio: 'Prospective caregiver awaiting identity and background verification.',
    location: {
      area: 'North San Jose',
      city: 'San Jose',
      region: 'CA',
      lat: 37.4064,
      lng: -121.9447,
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
 * Great-circle distance in kilometers between two coordinates (haversine).
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
