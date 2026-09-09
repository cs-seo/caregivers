import { sydneyDateKey, sydneyDayBounds } from "./format";
import { awayToIcsEvent, bookingToIcsEvent, shouldIncludeInCalendar, usualHoursToIcsEvents, type IcsEventInput } from "./ics";
import { prisma } from "./prisma";

export async function rosterCalendarForUser(user: {
  id: string;
  name: string;
  role: string;
  caregiverProfile?: { id: string } | null;
}) {
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
  const events: IcsEventInput[] = bookings
    .filter((booking) => shouldIncludeInCalendar(booking.status))
    .map(bookingToIcsEvent);

  if (!isFamily && user.caregiverProfile) {
    const [away, windows] = await Promise.all([
      prisma.caregiverBlockedDate.findMany({
        where: { caregiverId: user.caregiverProfile.id, dateKey: { gte: todayKey } },
        orderBy: { dateKey: "asc" },
      }),
      prisma.caregiverWeeklyWindow.findMany({
        where: { caregiverId: user.caregiverProfile.id },
        select: { weekday: true, startMin: true, endMin: true },
      }),
    ]);
    events.push(
      ...away.map((row) => awayToIcsEvent(user.caregiverProfile!.id, row.dateKey, user.name, row.note)),
    );
    events.push(
      ...usualHoursToIcsEvents(
        windows,
        user.caregiverProfile.id,
        user.name,
        start,
        4,
        away.map((row) => row.dateKey),
      ),
    );
  }

  return {
    events,
    calendarName: isFamily ? "CareProof · upcoming sits" : "CareProof · roster",
  };
}
