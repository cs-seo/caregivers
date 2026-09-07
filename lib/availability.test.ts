import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultWeeklyHours, weeklyHourChips } from "./availability";

test("defaultWeeklyHours prefers babysitting evenings", () => {
  assert.equal(defaultWeeklyHours(["babysitters", "nannies"]), "Thu–Sun 5pm–midnight");
});

test("weeklyHourChips splits usual hours on a middle dot", () => {
  assert.deepEqual(weeklyHourChips("Mon–Fri 3pm–7pm · Sat mornings"), ["Mon–Fri 3pm–7pm", "Sat mornings"]);
});
