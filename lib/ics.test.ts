import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import { awayToIcsEvent, bookingsToIcs, escapeIcsText, icsDate, nextDateKey, shouldIncludeInCalendar, usualHoursToIcsEvents } from "./ics";
import { parseWeeklyHours } from "./weekly-windows";

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

test("nextDateKey steps one calendar day for all-day DTEND", () => {
  assert.equal(nextDateKey("2026-09-13"), "2026-09-14");
  assert.equal(nextDateKey("2026-09-30"), "2026-10-01");
});

test("bookingsToIcs writes all-day away events as DATE values", () => {
  const ics = bookingsToIcs(
    [awayToIcsEvent("carer-1", "2026-09-13", "Sarah Nguyen", "Weekend off")],
    new Date("2026-09-07T00:00:00.000Z"),
    "CareProof roster",
  );
  assert.match(ics, /X-WR-CALNAME:CareProof roster/);
  assert.match(ics, /UID:away-carer-1-2026-09-13@careproof.com.au/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260913/);
  assert.match(ics, /DTEND;VALUE=DATE:20260914/);
  assert.match(ics, /SUMMARY:Away · Sarah Nguyen/);
  assert.match(ics, /DESCRIPTION:CareProof day off\\nWeekend off/);
});

test("bookingsToIcs can advertise an hourly refresh", () => {
  const ics = bookingsToIcs([], new Date("2026-09-07T00:00:00.000Z"), "CareProof roster", 1);
  assert.match(ics, /X-PUBLISHED-TTL:PT1H/);
  assert.match(ics, /REFRESH-INTERVAL;VALUE=DURATION:PT1H/);
});

test("usualHoursToIcsEvents writes weekday windows and skips away days", () => {
  const events = usualHoursToIcsEvents(
    parseWeeklyHours("Mon–Fri 7am–1pm"),
    "sarah",
    "Sarah Nguyen",
    new Date("2026-09-07T00:00:00.000Z"),
    1,
    ["2026-09-07"],
  );
  assert.equal(events.length, 4);
  assert.equal(events[0]?.id, "hours-sarah-2026-09-08-420");
  assert.match(events[0]?.summary ?? "", /Usual hours/);
  const ics = bookingsToIcs(events, new Date("2026-09-07T00:00:00.000Z"), "CareProof roster");
  assert.match(ics, /SUMMARY:Usual hours · Sarah Nguyen/);
  assert.equal(events.some((event) => event.id.includes("2026-09-07")), false);
});
