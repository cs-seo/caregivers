import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import { buildRoster } from "./roster";

test("buildRoster marks a held Sydney sit and leaves other days open", () => {
  const days = buildRoster(
    [
      {
        startAt: new Date("2026-09-11T07:00:00.000Z"),
        status: BOOKING_STATUS.ESCROW_HELD,
      },
      {
        startAt: new Date("2026-09-08T07:00:00.000Z"),
        status: BOOKING_STATUS.RELEASED,
      },
    ],
    14,
    new Date("2026-09-07T00:00:00.000Z"),
  );
  const booked = days.filter((day) => day.booking);
  assert.equal(booked.length, 1);
  assert.equal(booked[0]?.key, "2026-09-11");
  assert.equal(days.find((day) => day.key === "2026-09-08")?.booking, null);
  assert.equal(days.find((day) => day.key === "2026-09-13")?.blocked, false);
});

test("buildRoster marks a blocked day as away even without a booking", () => {
  const days = buildRoster([], 14, new Date("2026-09-07T00:00:00.000Z"), ["2026-09-13"]);
  const away = days.find((day) => day.key === "2026-09-13");
  assert.equal(away?.blocked, true);
  assert.equal(away?.booking, null);
});
