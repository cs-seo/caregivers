import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartNotice } from "./family-start";
import { guestBrowseLinks, guestBrowseNotice } from "./guest-browse";

test("guestBrowseNotice is browse-first and has no count", () => {
  assert.match(guestBrowseNotice(), /before you sign in/);
  assert.match(guestBrowseNotice(), /verified carers/);
  assert.doesNotMatch(guestBrowseNotice(), /\d+ open/);
  assert.doesNotMatch(guestBrowseNotice(), /post a request/);
  assert.notEqual(guestBrowseNotice(), familyStartNotice());
});

test("guestBrowseLinks go to the directory and locations hub", () => {
  assert.deepEqual(guestBrowseLinks(), [
    { href: "/caregivers", label: "Browse verified carers" },
    { href: "/locations", label: "Explore cities and suburbs" },
  ]);
});
