import { BOOKING_STATUS } from "./constants";

export const ICS_SKIP_STATUSES = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REFUNDED] as const;

export type IcsEventInput = {
  id: string;
  startAt: Date;
  endAt: Date;
  specialtyName: string;
  caregiverName: string;
  familyName: string;
  notes?: string | null;
  recurringIndex?: number;
  recurringTotal?: number;
  allDayDateKey?: string;
  summary?: string;
};

export function nextDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

export function icsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function shouldIncludeInCalendar(status: string) {
  return !(ICS_SKIP_STATUSES as readonly string[]).includes(status);
}

function vevent(event: IcsEventInput, now: Date) {
  const week =
    (event.recurringTotal ?? 1) > 1 ? ` (week ${event.recurringIndex} of ${event.recurringTotal})` : "";
  const summary = escapeIcsText(
    event.summary ?? `${event.specialtyName} with ${event.caregiverName}${week}`,
  );
  const description = escapeIcsText(
    [
      event.allDayDateKey ? "CareProof day off" : "CareProof escrow booking",
      event.notes ?? "",
      event.allDayDateKey ? "" : `Family: ${event.familyName}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const startEnd = event.allDayDateKey
    ? [
        `DTSTART;VALUE=DATE:${event.allDayDateKey.replace(/-/g, "")}`,
        `DTEND;VALUE=DATE:${nextDateKey(event.allDayDateKey).replace(/-/g, "")}`,
      ]
    : [`DTSTART:${icsDate(event.startAt)}`, `DTEND:${icsDate(event.endAt)}`];
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@careproof.com.au`,
    `DTSTAMP:${icsDate(now)}`,
    ...startEnd,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
  ];
}

export function bookingToIcsEvent(booking: {
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

export function awayToIcsEvent(
  caregiverId: string,
  dateKey: string,
  caregiverName: string,
  note?: string | null,
): IcsEventInput {
  return {
    id: `away-${caregiverId}-${dateKey}`,
    startAt: new Date(`${dateKey}T00:00:00.000Z`),
    endAt: new Date(`${nextDateKey(dateKey)}T00:00:00.000Z`),
    allDayDateKey: dateKey,
    specialtyName: "Away",
    caregiverName,
    familyName: caregiverName,
    notes: note ?? "Marked as a day off on CareProof",
    summary: `Away · ${caregiverName}`,
  };
}

export function bookingsToIcs(events: IcsEventInput[], now = new Date(), calendarName?: string) {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CareProof//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  if (calendarName) {
    header.push(`X-WR-CALNAME:${escapeIcsText(calendarName)}`);
  }
  return [...header, ...events.flatMap((event) => vevent(event, now)), "END:VCALENDAR", ""].join("\r\n");
}
