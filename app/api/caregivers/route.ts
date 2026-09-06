import { NextResponse, type NextRequest } from 'next/server';
import {
  AUSTRALIAN_REGIONS,
  classifyLocality,
  computeVerification,
  distanceKm,
  getCaregivers,
  LOCALITY_TIER_RANK,
  type AustralianRegion,
  type CaregiverWithVerification,
} from '@/app/lib/caregivers';
import { withLiveStatus } from '@/app/lib/presence';

export const dynamic = 'force-dynamic';

/** Parses a latitude/longitude query param, rejecting anything out of range. */
function parseCoordinate(
  raw: string | null,
  min: number,
  max: number,
): number | null {
  if (raw === null || raw.trim() === '') {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    return null;
  }
  return value;
}

/** Validates an Australian 4-digit postcode. */
function parsePostcode(raw: string | null): string | null {
  if (raw === null || !/^\d{4}$/.test(raw)) {
    return null;
  }
  return raw;
}

/** Validates a state/territory abbreviation against the known set. */
function parseRegion(raw: string | null): AustralianRegion | null {
  if (raw === null) return null;
  const upper = raw.toUpperCase();
  return (AUSTRALIAN_REGIONS as readonly string[]).includes(upper)
    ? (upper as AustralianRegion)
    : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // All origin inputs are validated; anything malformed is ignored rather than
  // trusted, so a bad query can never break sorting.
  const lat = parseCoordinate(searchParams.get('lat'), -90, 90);
  const lng = parseCoordinate(searchParams.get('lng'), -180, 180);
  const postcode = parsePostcode(searchParams.get('postcode'));
  const region = parseRegion(searchParams.get('region'));

  const hasCoords = lat !== null && lng !== null;
  const hasLocality = postcode !== null || region !== null;

  const live = withLiveStatus(getCaregivers());

  let caregivers: CaregiverWithVerification[] = live.map((caregiver) => {
    const response: CaregiverWithVerification = {
      ...caregiver,
      verification: computeVerification(caregiver),
    };
    if (hasCoords) {
      response.distanceKm = Number(
        distanceKm({ lat, lng }, caregiver.location).toFixed(1),
      );
    }
    if (hasLocality) {
      response.localityTier = classifyLocality(
        { postcode: postcode ?? undefined, region: region ?? undefined },
        caregiver.location,
      );
    }
    return response;
  });

  // Locals like to deal with locals: order by local-to-local tier first (same
  // suburb → same area → same state → other), then by straight-line distance
  // within each tier.
  if (hasLocality || hasCoords) {
    caregivers = caregivers.sort((a, b) => {
      if (hasLocality) {
        const tierDelta =
          LOCALITY_TIER_RANK[a.localityTier ?? 'other'] -
          LOCALITY_TIER_RANK[b.localityTier ?? 'other'];
        if (tierDelta !== 0) return tierDelta;
      }
      if (hasCoords) {
        return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
      }
      return 0;
    });
  }

  return NextResponse.json(caregivers, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
