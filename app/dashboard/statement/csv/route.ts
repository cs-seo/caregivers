import { NextResponse } from "next/server";
import { fundedInvoicePeers } from "@/lib/invoice-peers";
import { australianFinancialYear, statementCsv, toStatementRows } from "@/lib/statement";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"));
  }
  const isFamily = user.role === "FAMILY";
  const bookings = await prisma.booking.findMany({
    where: isFamily ? { familyId: user.id } : { caregiver: { userId: user.id } },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true, familyProfile: true } },
      specialty: true,
      payment: { select: { heldAt: true } },
    },
    orderBy: { startAt: "asc" },
  });
  const fy = australianFinancialYear();
  const peers = await fundedInvoicePeers();
  const rows = toStatementRows(
    bookings.map((booking) => ({ ...booking, heldAt: booking.payment?.heldAt })),
    new Date(),
    peers,
  );
  const csv = statementCsv(rows, isFamily);
  const who = isFamily ? "family" : "carer";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="careproof-${who}-fy${fy.startYear}.csv"`,
    },
  });
}
