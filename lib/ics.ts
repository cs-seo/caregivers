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
};

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
  const summary = escapeIcsText(`${event.specialtyName} with ${event.caregiverName}${week}`);
  const description = escapeIcsText(
    ["CareProof escrow booking", event.notes ?? "", `Family: ${event.familyName}`].filter(Boolean).join("\n"),
  );
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@careproof.com.au`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(event.startAt)}`,
    `DTEND:${icsDate(event.endAt)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
  ];
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
