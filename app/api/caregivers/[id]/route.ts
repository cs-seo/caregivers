import { NextResponse, type NextRequest } from 'next/server';
import {
  computeVerification,
  getCaregiverById,
} from '@/app/lib/caregivers';
import { withLiveStatus } from '@/app/lib/presence';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Basic input validation: ids are short alphanumeric slugs only. This keeps
  // the handler from doing lookups on arbitrary attacker-controlled strings.
  if (!/^[a-z0-9-]{1,32}$/i.test(id)) {
    return NextResponse.json(
      { error: 'Invalid caregiver id' },
      { status: 400 },
    );
  }

  const caregiver = getCaregiverById(id);
  if (!caregiver) {
    return NextResponse.json(
      { error: 'Caregiver not found' },
      { status: 404 },
    );
  }

  const [live] = withLiveStatus([caregiver]);

  return NextResponse.json(
    { ...live, verification: computeVerification(caregiver) },
    {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    },
  );
}
