import { NextResponse } from "next/server";
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
    },
    orderBy: { startAt: "asc" },
  });
  const fy = australianFinancialYear();
  const rows = toStatementRows(bookings);
  const csv = statementCsv(rows, isFamily);
  const who = isFamily ? "family" : "carer";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="careproof-${who}-fy${fy.startYear}.csv"`,
    },
  });
}
