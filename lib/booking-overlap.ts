import { BOOKING_STATUS } from "./constants";
import { prisma } from "./prisma";

export const BUSY_BOOKING_STATUSES = [
  BOOKING_STATUS.PENDING_ACCEPTANCE,
  BOOKING_STATUS.AWAITING_PAYMENT,
  BOOKING_STATUS.ESCROW_HELD,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.PENDING_RELEASE,
  BOOKING_STATUS.DISPUTED,
];

export async function findBusyOverlap(caregiverId: string, startAt: Date, endAt: Date) {
  return prisma.booking.findFirst({
    where: {
      caregiverId,
      status: { in: BUSY_BOOKING_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true, startAt: true, endAt: true },
  });
}

export async function findSeriesOverlap(
  caregiverId: string,
  windows: { startAt: Date; endAt: Date }[],
) {
  for (const window of windows) {
    const hit = await findBusyOverlap(caregiverId, window.startAt, window.endAt);
    if (hit) return hit;
  }
  return null;
}
