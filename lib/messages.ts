import { jobMessageUnreadWhere } from "./job-messages";
import { prisma } from "./prisma";

export function isUnreadFor(message: { senderId: string; readAt?: Date | null }, userId: string) {
  return message.senderId !== userId && !message.readAt;
}

export function unreadCountFor(messages: { senderId: string; readAt?: Date | null }[], userId: string) {
  return messages.filter((message) => isUnreadFor(message, userId)).length;
}

export function unreadWhere(userId: string) {
  return {
    senderId: { not: userId },
    readAt: null,
    booking: {
      OR: [{ familyId: userId }, { caregiver: { userId } }],
    },
  };
}

export async function countUnreadMessages(userId: string) {
  const [booking, job] = await Promise.all([
    prisma.message.count({ where: unreadWhere(userId) }),
    prisma.careRequestMessage.count({ where: jobMessageUnreadWhere(userId) }),
  ]);
  return booking + job;
}

export async function unreadCountsByBooking(userId: string) {
  const rows = await prisma.message.groupBy({
    by: ["bookingId"],
    where: unreadWhere(userId),
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.bookingId, row._count._all]));
}

export async function markThreadRead(bookingId: string, userId: string) {
  const result = await prisma.message.updateMany({
    where: { bookingId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}
