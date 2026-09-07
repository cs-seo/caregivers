import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import { bookingsToIcs, escapeIcsText, icsDate, shouldIncludeInCalendar } from "./ics";

test("icsDate writes a UTC timestamp without milliseconds", () => {
  assert.equal(icsDate(new Date("2026-10-10T06:00:00.123Z")), "20261010T060000Z");
});

test("escapeIcsText escapes commas, semicolons and newlines", () => {
  assert.equal(escapeIcsText("Kids, keys; park\nGate B"), "Kids\\, keys\\; park\\nGate B");
});

test("bookingsToIcs writes one VEVENT per week in a series", () => {
  const ics = bookingsToIcs(
    [
      {
        id: "week-1",
        startAt: new Date("2026-10-10T06:00:00.000Z"),
        endAt: new Date("2026-10-10T10:00:00.000Z"),
        specialtyName: "Babysitters",
        caregiverName: "James Okafor",
        familyName: "Alex Martin",
        notes: "Saturday date night",
        recurringIndex: 1,
        recurringTotal: 3,
      },
      {
        id: "week-2",
        startAt: new Date("2026-10-17T06:00:00.000Z"),
        endAt: new Date("2026-10-17T10:00:00.000Z"),
        specialtyName: "Babysitters",
        caregiverName: "James Okafor",
        familyName: "Alex Martin",
        recurringIndex: 2,
        recurringTotal: 3,
      },
    ],
    new Date("2026-09-07T00:00:00.000Z"),
    "CareProof weekly series",
  );

  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /X-WR-CALNAME:CareProof weekly series/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  assert.match(ics, /UID:week-1@careproof.com.au/);
  assert.match(ics, /UID:week-2@careproof.com.au/);
  assert.match(ics, /SUMMARY:Babysitters with James Okafor \(week 1 of 3\)/);
  assert.match(ics, /DTSTART:20261010T060000Z/);
  assert.match(ics, /DTEND:20261017T100000Z/);
  assert.equal(shouldIncludeInCalendar(BOOKING_STATUS.ESCROW_HELD), true);
  assert.equal(shouldIncludeInCalendar(BOOKING_STATUS.CANCELLED), false);
});
