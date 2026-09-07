import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function icsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const week =
    booking.recurringTotal > 1 ? ` (week ${booking.recurringIndex} of ${booking.recurringTotal})` : "";
  const summary = escapeText(`${booking.specialty.name} with ${booking.caregiver.user.name}${week}`);
  const description = escapeText(
    [`CareProof escrow booking`, booking.notes ?? "", `Family: ${booking.family.name}`].filter(Boolean).join("\n"),
  );
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CareProof//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@careproof.com.au`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(booking.startAt)}`,
    `DTEND:${icsDate(booking.endAt)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="careproof-${booking.id}.ics"`,
    },
  });
}
