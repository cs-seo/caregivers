import { NextResponse, type NextRequest } from 'next/server';
import {
  computeVerification,
  distanceKm,
  getCaregivers,
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Validated, optional proximity origin. Invalid values are ignored rather
  // than trusted, so a malformed query can never break sorting.
  const lat = parseCoordinate(searchParams.get('lat'), -90, 90);
  const lng = parseCoordinate(searchParams.get('lng'), -180, 180);
  const hasOrigin = lat !== null && lng !== null;

  const live = withLiveStatus(getCaregivers());

  let caregivers: CaregiverWithVerification[] = live.map((caregiver) => {
    const response: CaregiverWithVerification = {
      ...caregiver,
      verification: computeVerification(caregiver),
    };
    if (hasOrigin) {
      response.distanceKm = Number(
        distanceKm({ lat, lng }, caregiver.location).toFixed(1),
      );
    }
    return response;
  });

  // Favor local people: when an origin is supplied, surface nearest first.
  if (hasOrigin) {
    caregivers = caregivers.sort(
      (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
    );
  }

  return NextResponse.json(caregivers, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
