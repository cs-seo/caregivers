import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";

test("familyStartNotice names browse and post without a count", () => {
  assert.match(familyStartNotice(), /Browse verified carers/);
  assert.match(familyStartNotice(), /post a request/);
  assert.match(familyStartNotice(), /escrow/);
  assert.doesNotMatch(familyStartNotice(), /\d+ open/);
  assert.doesNotMatch(familyStartNotice(), /Keep 100%/);
});

test("familyStartLinks go to the directory and post-a-job", () => {
  assert.deepEqual(familyStartLinks(), [
    { href: "/caregivers", label: "Find verified carers" },
    { href: "/post-a-job", label: "Post a care request" },
  ]);
});
