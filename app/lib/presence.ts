import type { Caregiver, CaregiverStatus, LiveCaregiver } from './caregivers';

// Live presence layer.
//
// The original mock re-randomized every caregiver's status on *every* request,
// which made the 2s-polling UI jitter and made the stable vetting/locality
// data hard to read. Instead we derive a status deterministically from the
// caregiver id and a coarse time window, so a caregiver's status stays stable
// for ~STATUS_WINDOW_MS and only occasionally changes — preserving a "live"
// feel without flicker.
//
// PRODUCTION NOTE: Real presence would come from heartbeats / websocket
// connections persisted in a store (e.g. Redis), not a derived clock function.

const STATUS_WINDOW_MS = 15_000;

const STATUSES: CaregiverStatus[] = ['online', 'busy', 'offline'];

/** Small deterministic string hash (FNV-1a style). */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function statusFor(caregiver: Caregiver, windowIndex: number): CaregiverStatus {
  const seed = hashString(`${caregiver.id}:${windowIndex}`);
  return STATUSES[seed % STATUSES.length];
}

function lastSeenFor(status: CaregiverStatus): string {
  switch (status) {
    case 'online':
      return 'just now';
    case 'busy':
      return 'active now';
    case 'offline':
      return 'earlier today';
  }
}

/** Attaches a stable-yet-live status to each caregiver. */
export function withLiveStatus(
  caregivers: Caregiver[],
  now: number = Date.now(),
): LiveCaregiver[] {
  const windowIndex = Math.floor(now / STATUS_WINDOW_MS);
  return caregivers.map((caregiver) => {
    const status = statusFor(caregiver, windowIndex);
    return { ...caregiver, status, lastSeen: lastSeenFor(status) };
  });
}
