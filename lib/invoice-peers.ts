import { prisma } from "./prisma";
import { australianFinancialYear, STATEMENT_STATUSES } from "./statement";

export async function fundedInvoicePeers(now = new Date()) {
  const fy = australianFinancialYear(now);
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: [...STATEMENT_STATUSES] },
      startAt: { gte: fy.startAt, lt: fy.endAt },
      payment: { isNot: null },
    },
    select: {
      id: true,
      startAt: true,
      status: true,
      payment: { select: { heldAt: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    startAt: row.startAt,
    status: row.status,
    heldAt: row.payment?.heldAt ?? null,
  }));
}
