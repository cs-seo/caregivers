import { prisma } from "./prisma";
import { australianFinancialYear, invoiceNumberMap, STATEMENT_STATUSES } from "./statement";

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
      payment: { select: { heldAt: true, invoiceNumber: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    startAt: row.startAt,
    status: row.status,
    heldAt: row.payment?.heldAt ?? null,
    invoiceNumber: row.payment?.invoiceNumber ?? null,
  }));
}

export async function persistMissingInvoiceNumbers(now = new Date()) {
  const peers = await fundedInvoicePeers(now);
  const numbers = invoiceNumberMap(peers, now);
  for (const peer of peers) {
    const invoiceNumber = numbers.get(peer.id);
    if (!invoiceNumber || peer.invoiceNumber) continue;
    await prisma.payment.updateMany({
      where: { bookingId: peer.id, invoiceNumber: null },
      data: { invoiceNumber },
    });
  }
  return invoiceNumberMap(
    peers.map((peer) => ({
      ...peer,
      invoiceNumber: peer.invoiceNumber ?? numbers.get(peer.id) ?? null,
    })),
    now,
  );
}
