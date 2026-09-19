import { prisma } from "./prisma";

export const JOB_MESSAGE_LIMIT = 1000;

export function sanitizeJobMessage(raw: string) {
  return raw.trim().slice(0, JOB_MESSAGE_LIMIT);
}

export function canViewJobThread(args: {
  job: { familyId: string } | null;
  viewerId: string;
  viewerCaregiverId?: string | null;
  threadCaregiverId: string;
  involved: boolean;
}) {
  if (!args.job || !args.involved || !args.threadCaregiverId) return false;
  if (args.viewerId === args.job.familyId) return true;
  return args.viewerCaregiverId === args.threadCaregiverId;
}

export function canSendJobMessage(args: {
  job: { familyId: string; status: string } | null;
  viewerId: string;
  viewerCaregiverId?: string | null;
  threadCaregiverId: string;
  involved: boolean;
}) {
  if (!args.job || args.job.status !== "open") return false;
  return canViewJobThread(args);
}

export function isCarerInvolvedInJob(args: {
  caregiverId: string;
  invited?: boolean;
  proposed?: boolean;
  hiredCaregiverId?: string | null;
}) {
  return Boolean(args.invited || args.proposed || args.hiredCaregiverId === args.caregiverId);
}

export function jobMessageUnreadWhere(userId: string) {
  return {
    senderId: { not: userId },
    readAt: null,
    OR: [{ request: { familyId: userId } }, { caregiver: { userId } }],
  };
}

export async function countUnreadJobMessages(userId: string) {
  return prisma.careRequestMessage.count({ where: jobMessageUnreadWhere(userId) });
}

export async function unreadJobThreadsFor(userId: string) {
  const rows = await prisma.careRequestMessage.groupBy({
    by: ["requestId", "caregiverId"],
    where: jobMessageUnreadWhere(userId),
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [`${row.requestId}:${row.caregiverId}`, row._count._all]));
}

export async function unreadJobCountsByRequest(userId: string) {
  const rows = await prisma.careRequestMessage.groupBy({
    by: ["requestId"],
    where: jobMessageUnreadWhere(userId),
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.requestId, row._count._all]));
}

export async function markJobThreadRead(requestId: string, caregiverId: string, userId: string) {
  const result = await prisma.careRequestMessage.updateMany({
    where: { requestId, caregiverId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

export function groupJobMessages<T extends { caregiverId: string }>(messages: T[]) {
  const groups = new Map<string, T[]>();
  for (const message of messages) {
    const list = groups.get(message.caregiverId) ?? [];
    list.push(message);
    groups.set(message.caregiverId, list);
  }
  return groups;
}
