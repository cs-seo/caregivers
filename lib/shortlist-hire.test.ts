import assert from "node:assert/strict";
import { test } from "node:test";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";

test("shortlistHireNotice names book or post without a count", () => {
  assert.match(shortlistHireNotice(), /Book someone from this roster/);
  assert.match(shortlistHireNotice(), /post a request/);
  assert.doesNotMatch(shortlistHireNotice(), /\d+ open/);
  assert.doesNotMatch(shortlistHireNotice(), /Fits this start/);
});

test("shortlistHireLinks go to post-a-job and the directory", () => {
  assert.deepEqual(shortlistHireLinks(), [
    { href: "/post-a-job", label: "Post a care request" },
    { href: "/caregivers", label: "Find more carers to save" },
  ]);
});
