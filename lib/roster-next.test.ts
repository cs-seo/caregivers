import assert from "node:assert/strict";
import { test } from "node:test";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { escrowHeldNextLinks, escrowHeldNextNotice } from "./escrow-held";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { footerBoardLink } from "./footer-board";
import { postJobNextLinks, postJobNextNotice } from "./post-job-next";
import { rosterNextLinks, rosterNextNotice, rosterNextPlace } from "./roster-next";

test("rosterNextNotice names a free day without a count or Instant Book CTA", () => {
  assert.match(rosterNextNotice(), /free day/);
  assert.match(rosterNextNotice(), /Needed-on/);
  assert.match(rosterNextNotice(), /board/);
  assert.doesNotMatch(rosterNextNotice(), /\d+ open/);
  assert.doesNotMatch(rosterNextNotice(), /Instant Book/);
  assert.doesNotMatch(rosterNextNotice(), /Subscribe/);
  assert.doesNotMatch(rosterNextNotice(), /job=/);
  assert.notEqual(rosterNextNotice(), comingUpNextNotice());
  assert.notEqual(rosterNextNotice(), familyStartNotice());
  assert.notEqual(rosterNextNotice(), postJobNextNotice());
  assert.notEqual(rosterNextNotice(), escrowHeldNextNotice());
});

test("rosterNextPlace picks the first empty day and rosterNextLinks go there plus the board", () => {
  const place = rosterNextPlace([
    { key: "2026-09-12", booking: { id: "sit-1" } },
    { key: "2026-09-13" },
  ]);
  assert.deepEqual(place, { href: "/caregivers?availableOn=2026-09-13", dateKey: "2026-09-13" });
  assert.equal(rosterNextPlace([{ key: "2026-09-12", booking: { id: "sit-1" } }]), null);
  assert.equal(rosterNextPlace([{ key: "not-a-date" }]), null);
  assert.deepEqual(rosterNextLinks(place), [
    { href: "/caregivers?availableOn=2026-09-13", label: "Find a carer on a free day" },
    footerBoardLink(),
  ]);
  assert.deepEqual(rosterNextLinks(), [footerBoardLink()]);
  assert.notDeepEqual(rosterNextLinks(place), comingUpNextLinks());
  assert.notDeepEqual(rosterNextLinks(place), familyStartLinks());
  assert.notDeepEqual(rosterNextLinks(place), postJobNextLinks());
  assert.notDeepEqual(rosterNextLinks(place), escrowHeldNextLinks({ bookingId: "sit-1" }));
  assert.ok(!rosterNextLinks(place).some((link) => link.href === "/post-a-job"));
  assert.ok(!rosterNextLinks(place).some((link) => link.href === "/dashboard/shortlist"));
  assert.ok(!rosterNextLinks(place).some((link) => link.href === "/dashboard/calendar"));
  assert.ok(!rosterNextLinks(place).some((link) => link.href.includes("job=")));
});
