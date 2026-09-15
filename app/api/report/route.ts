import { NextResponse, type NextRequest } from 'next/server';
import { getCaregiverById } from '@/app/lib/caregivers';

export const dynamic = 'force-dynamic';

const REASONS = ['safety', 'conduct', 'inaccurate-profile', 'other'] as const;
type Reason = (typeof REASONS)[number];

const MAX_DETAILS_LENGTH = 2000;

interface ReportPayload {
  caregiverId: string;
  reason: Reason;
  details: string;
}

function isReason(value: unknown): value is Reason {
  return typeof value === 'string' && (REASONS as readonly string[]).includes(value);
}

/**
 * Validates and normalizes an incoming report. Returns a typed payload or an
 * error message. All fields are treated as untrusted input.
 */
function parseReport(body: unknown):
  | { ok: true; value: ReportPayload }
  | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const record = body as Record<string, unknown>;

  const caregiverId = record.caregiverId;
  if (typeof caregiverId !== 'string' || !/^[a-z0-9-]{1,32}$/i.test(caregiverId)) {
    return { ok: false, error: 'Invalid caregiverId' };
  }

  if (!isReason(record.reason)) {
    return { ok: false, error: 'Invalid reason' };
  }

  const rawDetails = typeof record.details === 'string' ? record.details : '';
  const details = rawDetails.trim().slice(0, MAX_DETAILS_LENGTH);

  return {
    ok: true,
    value: { caregiverId, reason: record.reason, details },
  };
}

export async function POST(request: NextRequest) {
  // Reject non-JSON payloads up front.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const parsed = parseReport(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!getCaregiverById(parsed.value.caregiverId)) {
    return NextResponse.json(
      { error: 'Caregiver not found' },
      { status: 404 },
    );
  }

  // PRODUCTION NOTE: A real system would persist this report to a trust-&-safety
  // queue, notify a moderation team, apply rate limiting per user/IP, and never
  // echo untrusted input back without escaping. Here we only acknowledge it.
  console.info(
    `[report] caregiver=${parsed.value.caregiverId} reason=${parsed.value.reason} detailsLength=${parsed.value.details.length}`,
  );

  return NextResponse.json({ status: 'received' }, { status: 201 });
}
