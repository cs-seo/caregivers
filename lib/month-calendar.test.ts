import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addMonths,
  isPastDateKey,
  monthGrid,
  monthLabel,
  sydneyYearMonth,
} from "./month-calendar";

test("sydneyYearMonth reads the Sydney calendar month", () => {
  assert.deepEqual(sydneyYearMonth(new Date("2026-09-07T00:00:00+10:00")), { year: 2026, month: 9 });
  assert.deepEqual(sydneyYearMonth(new Date("2026-08-31T22:00:00.000Z")), { year: 2026, month: 9 });
});

test("monthGrid is Monday-first and pads September 2026", () => {
  const cells = monthGrid({ year: 2026, month: 9 });
  assert.equal(cells[0]?.key, "2026-08-31");
  assert.equal(cells[0]?.inMonth, false);
  assert.equal(cells[1]?.key, "2026-09-01");
  assert.equal(cells[1]?.inMonth, true);
  assert.equal(cells.filter((cell) => cell.inMonth).length, 30);
  assert.equal(cells.length % 7, 0);
  assert.equal(monthLabel({ year: 2026, month: 9 }), "September 2026");
  assert.deepEqual(addMonths({ year: 2026, month: 9 }, 1), { year: 2026, month: 10 });
});

test("isPastDateKey compares ISO calendar days", () => {
  assert.equal(isPastDateKey("2026-09-06", "2026-09-07"), true);
  assert.equal(isPastDateKey("2026-09-07", "2026-09-07"), false);
  assert.equal(isPastDateKey("2026-09-08", "2026-09-07"), false);
});
