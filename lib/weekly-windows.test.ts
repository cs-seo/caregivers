import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultWeeklyHours, WEEKLY_HOUR_PRESETS } from "./availability";
import {
  firstSitOutsideHours,
  formatWeeklyHours,
  isDateClosed,
  isOpenAtMinutes,
  parseTimeParam,
  parseWeeklyHours,
  sitStartsInUsualHours,
  suggestedStartLocal,
  weekdayFromDateKey,
  WEEKLY_WINDOW_PRESETS,
  weeklyOpenAtWhere,
  windowsFromForm,
} from "./weekly-windows";

test("weekdayFromDateKey is Monday-first", () => {
  assert.equal(weekdayFromDateKey("2026-09-07"), 0);
  assert.equal(weekdayFromDateKey("2026-09-12"), 5);
  assert.equal(weekdayFromDateKey("2026-09-13"), 6);
});

test("parseWeeklyHours reads weekday ranges and overnight ends", () => {
  assert.deepEqual(parseWeeklyHours("Mon–Fri 7am–1pm"), [
    { weekday: 0, startMin: 420, endMin: 780 },
    { weekday: 1, startMin: 420, endMin: 780 },
    { weekday: 2, startMin: 420, endMin: 780 },
    { weekday: 3, startMin: 420, endMin: 780 },
    { weekday: 4, startMin: 420, endMin: 780 },
  ]);
  assert.deepEqual(parseWeeklyHours("Thu–Sun 5pm–midnight").map((row) => row.weekday), [3, 4, 5, 6]);
  assert.equal(parseWeeklyHours("Thu–Sun 5pm–midnight")[0]?.endMin, 1440);
  assert.equal(parseWeeklyHours("Mon–Fri 7pm–7am")[0]?.endMin, 19 * 60 + 12 * 60);
});

test("parseWeeklyHours keeps extra phrases as extra windows or skips notes", () => {
  const priya = parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings");
  assert.equal(priya.length, 6);
  assert.deepEqual(priya[5], { weekday: 5, startMin: 480, endMin: 720 });
  assert.deepEqual(parseWeeklyHours("Mon–Fri 7am–1pm · overnight by arrangement").map((row) => row.weekday), [0, 1, 2, 3, 4]);
  const respite = parseWeeklyHours("Fri–Mon, overnight by arrangement");
  assert.deepEqual(respite.map((row) => row.weekday), [0, 4, 5, 6]);
  const nights = parseWeeklyHours("Fri–Sat overnight · Sun mornings");
  assert.equal(nights[0]?.startMin, 19 * 60);
  assert.equal(nights[0]?.endMin, 7 * 60 + 1440);
  assert.deepEqual(nights[2], { weekday: 6, startMin: 480, endMin: 720 });
});

test("formatWeeklyHours groups consecutive days", () => {
  assert.equal(formatWeeklyHours(parseWeeklyHours("Mon–Fri 7am–1pm")), "Mon–Fri 7am–1pm");
  assert.equal(formatWeeklyHours(parseWeeklyHours("Thu–Sun 5pm–midnight")), "Thu–Sun 5pm–midnight");
  assert.equal(formatWeeklyHours(parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings")), "Mon–Fri 3pm–7pm · Sat 8am–12pm");
});

test("presets round-trip through the parser", () => {
  assert.equal(WEEKLY_HOUR_PRESETS.length, WEEKLY_WINDOW_PRESETS.length);
  for (const preset of WEEKLY_WINDOW_PRESETS) {
    assert.deepEqual(parseWeeklyHours(preset.label), [...preset.windows]);
  }
});

test("default specialty hours parse into windows", () => {
  assert.ok(parseWeeklyHours(defaultWeeklyHours(["babysitters"])).length >= 4);
  assert.ok(parseWeeklyHours(defaultWeeklyHours(["nursing"])).length === 5);
});

test("closed days ignore carers without windows", () => {
  assert.equal(isDateClosed([], "2026-09-07"), false);
  const sarah = parseWeeklyHours("Mon–Fri 7am–1pm");
  assert.equal(isDateClosed(sarah, "2026-09-07"), false);
  assert.equal(isDateClosed(sarah, "2026-09-12"), true);
});

test("overnight Friday covers Saturday morning", () => {
  const windows = parseWeeklyHours("Fri 7pm–7am");
  assert.equal(isDateClosed(windows, "2026-09-11"), false);
  assert.equal(isDateClosed(windows, "2026-09-12"), false);
  assert.equal(isDateClosed(windows, "2026-09-13"), true);
  const start = new Date("2026-09-12T06:00:00+10:00");
  const end = new Date("2026-09-12T07:00:00+10:00");
  assert.equal(sitStartsInUsualHours(windows, start, end), true);
  assert.equal(sitStartsInUsualHours(windows, new Date("2026-09-12T08:00:00+10:00"), new Date("2026-09-12T12:00:00+10:00")), false);
});

test("sit start must fall in usual hours when windows exist", () => {
  const priya = parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings");
  const friday = {
    startAt: new Date("2026-09-11T17:00:00+10:00"),
    endAt: new Date("2026-09-11T21:00:00+10:00"),
  };
  assert.equal(sitStartsInUsualHours(priya, friday.startAt, friday.endAt), true);
  assert.equal(
    sitStartsInUsualHours(priya, new Date("2026-09-11T09:00:00+10:00"), new Date("2026-09-11T13:00:00+10:00")),
    false,
  );
  assert.equal(firstSitOutsideHours([], [friday]), null);
  assert.ok(firstSitOutsideHours(priya, [{ startAt: new Date("2026-09-13T10:00:00+10:00"), endAt: new Date("2026-09-13T14:00:00+10:00") }]));
});

test("suggestedStartLocal uses the first window that day", () => {
  const priya = parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings");
  assert.equal(suggestedStartLocal("2026-09-11", priya), "2026-09-11T15:00");
  assert.equal(suggestedStartLocal("2026-09-12", priya), "2026-09-12T08:00");
  assert.equal(suggestedStartLocal("2026-09-13", priya), "2026-09-13T17:00");
});

test("featured hour strings all parse into at least one window", () => {
  const samples = [
    "Mon–Fri 7am–1pm · overnight by arrangement",
    "Mon–Fri 3pm–7pm · Sat mornings",
    "Wed–Sun 9am–5pm",
    "Mon–Thu 9am–2pm",
    "Mon–Fri 7pm–7am · weekend days",
    "Mon–Fri 2:30pm–7pm",
    "Mon–Wed 9am–4pm · overnight Fri–Sat",
    "Fri–Sat 5pm–midnight · school-holiday days",
    "Mon–Fri 3pm–7pm · evenings if booked by 4pm",
    "Fri–Sat overnight · Sun mornings",
    "Fri–Sun 4pm–11pm",
  ];
  for (const sample of samples) {
    assert.ok(parseWeeklyHours(sample).length > 0, sample);
  }
});

test("windowsFromForm rejects broken tokens", () => {
  assert.deepEqual(windowsFromForm(["0:420:780", "1:420:780"]).windows.length, 2);
  assert.equal(windowsFromForm(["nope"]).ok, false);
  assert.equal(windowsFromForm([]).ok, true);
});

test("parseTimeParam only accepts HH:MM clock values", () => {
  assert.equal(parseTimeParam("08:00"), 480);
  assert.equal(parseTimeParam("16:00"), 960);
  assert.equal(parseTimeParam("7am"), null);
  assert.equal(parseTimeParam("24:00"), null);
  assert.equal(parseTimeParam(""), null);
});

test("isOpenAtMinutes matches a start inside a window or overnight spill", () => {
  const sarah = parseWeeklyHours("Mon–Fri 7am–1pm");
  assert.equal(isOpenAtMinutes(sarah, "2026-09-15", 8 * 60), true);
  assert.equal(isOpenAtMinutes(sarah, "2026-09-15", 16 * 60), false);
  assert.equal(isOpenAtMinutes(sarah, "2026-09-12", 10 * 60), false);
  assert.equal(isOpenAtMinutes([], "2026-09-12", 10 * 60), true);
  const overnight = parseWeeklyHours("Fri 10pm–2am");
  assert.equal(isOpenAtMinutes(overnight, "2026-09-12", 60), true);
  assert.equal(isOpenAtMinutes(overnight, "2026-09-12", 8 * 60), false);
});

test("weeklyOpenAtWhere keeps carers with no windows or a covering slot", () => {
  const where = weeklyOpenAtWhere("2026-09-15", 8 * 60);
  assert.equal(where.OR.length, 3);
  assert.deepEqual(where.OR[0], { weeklyWindows: { none: {} } });
  assert.deepEqual(where.OR[1], {
    weeklyWindows: { some: { weekday: 1, startMin: { lte: 480 }, endMin: { gt: 480 } } },
  });
});
