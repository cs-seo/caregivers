import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { bookingsToIcs, shouldIncludeInCalendar, type IcsEventInput } from "@/lib/ics";

function toEvent(booking: {
  id: string;
  startAt: Date;
  endAt: Date;
  notes: string | null;
  recurringIndex: number;
  recurringTotal: number;
  specialty: { name: string };
  caregiver: { user: { name: string } };
  family: { name: string };
}): IcsEventInput {
  return {
    id: booking.id,
    startAt: booking.startAt,
    endAt: booking.endAt,
    specialtyName: booking.specialty.name,
    caregiverName: booking.caregiver.user.name,
    familyName: booking.family.name,
    notes: booking.notes,
    recurringIndex: booking.recurringIndex,
    recurringTotal: booking.recurringTotal,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"));
  }
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true } },
      specialty: true,
    },
  });
  if (!booking) return new NextResponse("Not found", { status: 404 });
  const allowed = booking.familyId === user.id || booking.caregiver.userId === user.id;
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  const wantSeries = new URL(request.url).searchParams.get("series") === "1";
  const weeks =
    wantSeries && booking.recurringGroupId
      ? await prisma.booking.findMany({
          where: { recurringGroupId: booking.recurringGroupId },
          include: {
            caregiver: { include: { user: true } },
            family: { select: { name: true } },
            specialty: true,
          },
          orderBy: { recurringIndex: "asc" },
        })
      : [booking];
  const events = weeks.filter((week) => shouldIncludeInCalendar(week.status)).map(toEvent);
  if (events.length === 0) return new NextResponse("No calendar weeks", { status: 404 });

  const calendarName =
    events.length > 1
      ? `CareProof · ${booking.specialty.name} with ${booking.caregiver.user.name}`
      : undefined;
  const ics = bookingsToIcs(events, new Date(), calendarName);
  const filename =
    events.length > 1 && booking.recurringGroupId
      ? `careproof-series-${booking.recurringGroupId}.ics`
      : `careproof-${booking.id}.ics`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
