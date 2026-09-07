import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "./constants";

export const ACTION_STATUSES = new Set<string>([
  BOOKING_STATUS.PENDING_ACCEPTANCE,
  BOOKING_STATUS.AWAITING_PAYMENT,
  BOOKING_STATUS.PENDING_RELEASE,
  BOOKING_STATUS.DISPUTED,
]);
export const ACTIVE_STATUSES = new Set<string>([BOOKING_STATUS.ESCROW_HELD, BOOKING_STATUS.IN_PROGRESS]);

export const BOOKING_STATUS_SHORT: Record<string, string> = {
  pending_acceptance: "waiting",
  awaiting_payment: "unpaid",
  escrow_held: "escrow",
  in_progress: "in progress",
  pending_release: "release",
  released: "paid",
  disputed: "dispute",
  cancelled: "cancelled",
  refunded: "refunded",
};

const HREF_PRIORITY = [
  BOOKING_STATUS.DISPUTED,
  BOOKING_STATUS.PENDING_RELEASE,
  BOOKING_STATUS.AWAITING_PAYMENT,
  BOOKING_STATUS.PENDING_ACCEPTANCE,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.ESCROW_HELD,
] as const;

export type GroupableBooking = {
  id: string;
  status: string;
  startAt: Date;
  totalCents: number;
  subtotalCents: number;
  recurringIndex: number;
  recurringTotal: number;
  recurringGroupId: string | null;
  specialty: { name: string };
  caregiver: { user: { name: string } };
  family: { name: string };
  payment: { status: string } | null;
  messages: { body: string }[];
  _count: { messages: number };
};

export type DashboardBookingGroup = {
  key: string;
  href: string;
  specialtyName: string;
  caregiverName: string;
  familyName: string;
  nextAt: Date;
  statusLabel: string;
  seriesLabel: string | null;
  messageCount: number;
  latestMessage: string | null;
  weeks: GroupableBooking[];
  liveCents: { total: number; payout: number };
};

export type DashboardBuckets = {
  action: DashboardBookingGroup[];
  active: DashboardBookingGroup[];
  history: DashboardBookingGroup[];
};

export function isClosedStatus(status: string) {
  return status === BOOKING_STATUS.CANCELLED || status === BOOKING_STATUS.REFUNDED;
}

export function groupKey(booking: Pick<GroupableBooking, "id" | "recurringGroupId" | "recurringTotal">) {
  if (booking.recurringGroupId && booking.recurringTotal > 1) return booking.recurringGroupId;
  return booking.id;
}

export function pickGroupHref(weeks: Pick<GroupableBooking, "id" | "status" | "recurringIndex">[]) {
  for (const status of HREF_PRIORITY) {
    const hit = weeks.find((week) => week.status === status);
    if (hit) return `/dashboard/bookings/${hit.id}`;
  }
  const live = weeks
    .filter((week) => !isClosedStatus(week.status))
    .sort((a, b) => a.recurringIndex - b.recurringIndex);
  return `/dashboard/bookings/${(live[0] ?? weeks[0]).id}`;
}

export function seriesStatusLabel(weeks: Pick<GroupableBooking, "status">[]) {
  const live = weeks.filter((week) => !isClosedStatus(week.status));
  const cancelled = weeks.length - live.length;
  if (live.length === 0) {
    return weeks.every((week) => week.status === BOOKING_STATUS.REFUNDED) ? "Refunded" : "Cancelled";
  }
  const counts = new Map<string, number>();
  for (const week of live) {
    counts.set(week.status, (counts.get(week.status) ?? 0) + 1);
  }
  const parts: string[] = [];
  const order = [
    BOOKING_STATUS.DISPUTED,
    BOOKING_STATUS.PENDING_RELEASE,
    BOOKING_STATUS.AWAITING_PAYMENT,
    BOOKING_STATUS.PENDING_ACCEPTANCE,
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.ESCROW_HELD,
    BOOKING_STATUS.RELEASED,
  ];
  for (const status of order) {
    const count = counts.get(status);
    if (!count) continue;
    const label = BOOKING_STATUS_LABELS[status] ?? status;
    parts.push(live.length === 1 || counts.size === 1 ? label : `${count} ${label.toLowerCase()}`);
  }
  if (cancelled) parts.push(`${cancelled} cancelled`);
  return parts.join(" · ");
}

export function groupBucket(weeks: Pick<GroupableBooking, "status">[]): keyof DashboardBuckets {
  if (weeks.some((week) => ACTION_STATUSES.has(week.status))) return "action";
  if (weeks.some((week) => ACTIVE_STATUSES.has(week.status))) return "active";
  return "history";
}

export function nextSit(weeks: GroupableBooking[]) {
  return (
    [...weeks]
      .filter((week) => !isClosedStatus(week.status))
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? weeks[0]
  );
}

function sortStamp(weeks: GroupableBooking[], bucket: keyof DashboardBuckets) {
  if (bucket === "history") {
    return Math.max(...weeks.map((week) => week.startAt.getTime()));
  }
  return nextSit(weeks).startAt.getTime();
}

function latestMessage(weeks: GroupableBooking[]) {
  for (const week of weeks) {
    if (week.messages[0]?.body) return week.messages[0].body;
  }
  return null;
}

export function groupDashboardBookings(bookings: GroupableBooking[]): DashboardBuckets {
  const clustered = new Map<string, GroupableBooking[]>();
  for (const booking of bookings) {
    const key = groupKey(booking);
    const list = clustered.get(key) ?? [];
    list.push(booking);
    clustered.set(key, list);
  }

  const buckets: DashboardBuckets = { action: [], active: [], history: [] };
  for (const [key, weeks] of clustered) {
    weeks.sort((a, b) => a.recurringIndex - b.recurringIndex || a.startAt.getTime() - b.startAt.getTime());
    const first = weeks[0];
    const live = weeks.filter((week) => !isClosedStatus(week.status));
    const sit = nextSit(weeks);
    const bucket = groupBucket(weeks);
    buckets[bucket].push({
      key,
      href: pickGroupHref(weeks),
      specialtyName: first.specialty.name,
      caregiverName: first.caregiver.user.name,
      familyName: first.family.name,
      nextAt: sit.startAt,
      statusLabel: seriesStatusLabel(weeks),
      seriesLabel: first.recurringTotal > 1 ? `${first.recurringTotal}-week series` : null,
      messageCount: weeks.reduce((sum, week) => sum + week._count.messages, 0),
      latestMessage: latestMessage(weeks),
      weeks,
      liveCents: {
        total: live.reduce((sum, week) => sum + week.totalCents, 0),
        payout: live.reduce((sum, week) => sum + week.subtotalCents, 0),
      },
    });
  }

  for (const bucket of ["action", "active", "history"] as const) {
    buckets[bucket].sort((a, b) => {
      const delta = sortStamp(a.weeks, bucket) - sortStamp(b.weeks, bucket);
      return bucket === "history" ? -delta : delta;
    });
  }
  return buckets;
}
