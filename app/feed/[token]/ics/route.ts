import { NextResponse } from "next/server";
import { isCalendarToken } from "@/lib/calendar-feed";
import { bookingsToIcs } from "@/lib/ics";
import { prisma } from "@/lib/prisma";
import { rosterCalendarForUser } from "@/lib/roster-calendar";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isCalendarToken(token)) return new NextResponse("Not found", { status: 404 });

  const feed = await prisma.calendarFeed.findUnique({
    where: { token },
    include: { user: { include: { caregiverProfile: { select: { id: true } } } } },
  });
  if (!feed) return new NextResponse("Not found", { status: 404 });

  const { events, calendarName } = await rosterCalendarForUser(feed.user);
  const ics = bookingsToIcs(events, new Date(), calendarName, 1);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="careproof-roster.ics"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
