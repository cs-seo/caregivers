import { NextResponse } from "next/server";
import { sydneyDateKey, sydneyDayBounds } from "@/lib/format";
import { awayToIcsEvent, bookingToIcsEvent, bookingsToIcs, shouldIncludeInCalendar } from "@/lib/ics";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"));
  }

  const isFamily = user.role === "FAMILY";
  const todayKey = sydneyDateKey(new Date());
  const start = sydneyDayBounds(todayKey)?.startAt ?? new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      ...(isFamily ? { familyId: user.id } : { caregiver: { userId: user.id } }),
      endAt: { gte: start },
    },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true } },
      specialty: true,
    },
    orderBy: { startAt: "asc" },
  });
  const events = bookings.filter((booking) => shouldIncludeInCalendar(booking.status)).map(bookingToIcsEvent);

  if (!isFamily && user.caregiverProfile) {
    const away = await prisma.caregiverBlockedDate.findMany({
      where: { caregiverId: user.caregiverProfile.id, dateKey: { gte: todayKey } },
      orderBy: { dateKey: "asc" },
    });
    events.push(
      ...away.map((row) =>
        awayToIcsEvent(user.caregiverProfile!.id, row.dateKey, user.name, row.note),
      ),
    );
  }

  const calendarName = isFamily ? "CareProof · upcoming sits" : "CareProof · roster";
  const ics = bookingsToIcs(events, new Date(), calendarName);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="careproof-roster.ics"`,
    },
  });
}
