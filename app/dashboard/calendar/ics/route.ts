import { NextResponse } from "next/server";
import { bookingsToIcs } from "@/lib/ics";
import { rosterCalendarForUser } from "@/lib/roster-calendar";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"));
  }

  const { events, calendarName } = await rosterCalendarForUser(user);
  const ics = bookingsToIcs(events, new Date(), calendarName);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="careproof-roster.ics"`,
    },
  });
}
