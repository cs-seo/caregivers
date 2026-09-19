import assert from "node:assert/strict";
import { test } from "node:test";
import { gladstoneNextLinks, gladstoneNextNotice, gladstoneNextShows } from "./gladstone-next";
import { ipswichNextLinks, ipswichNextNotice, ipswichNextShows } from "./ipswich-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { nanniesVicNextLinks, nanniesVicNextNotice } from "./nannies-vic-next";

test("gladstoneNextNotice names unused Traralgon and Horsham paths without a count or Instant Book", () => {
  assert.match(gladstoneNextNotice(), /Gladstone/);
  assert.match(gladstoneNextNotice(), /Traralgon/);
  assert.match(gladstoneNextNotice(), /Horsham/);
  assert.doesNotMatch(gladstoneNextNotice(), /\d+ open/);
  assert.doesNotMatch(gladstoneNextNotice(), /Instant Book/);
  assert.doesNotMatch(gladstoneNextNotice(), /Hire/);
  assert.doesNotMatch(gladstoneNextNotice(), /job=/);
  assert.doesNotMatch(gladstoneNextNotice(), /Broken Hill/);
  assert.doesNotMatch(gladstoneNextNotice(), /Queanbeyan/);
  assert.doesNotMatch(gladstoneNextNotice(), /Ipswich/);
  assert.doesNotMatch(gladstoneNextNotice(), /Kalgoorlie/);
  assert.doesNotMatch(gladstoneNextNotice(), /Esperance/);
  assert.notEqual(gladstoneNextNotice(), nanniesVicNextNotice());
  assert.notEqual(gladstoneNextNotice(), ipswichNextNotice());
  assert.notEqual(gladstoneNextNotice(), locationBoardNotice("Gladstone"));
});

test("gladstoneNextShows is a signed-in family on Gladstone only", () => {
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gladstone" }), true);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "ipswich" }), false);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "vic", citySlug: "traralgon" }), false);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "vic", citySlug: "horsham" }), false);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "broken-hill" }), false);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "queanbeyan" }), false);
  assert.equal(gladstoneNextShows({ isFamily: false, stateSlug: "qld", citySlug: "gladstone" }), false);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gladstone" }), false);
});

test("gladstoneNextLinks go to Traralgon and Horsham, not Broken Hill or Ipswich", () => {
  assert.deepEqual(gladstoneNextLinks(), [
    { href: "/locations/vic/traralgon", label: "Open Traralgon locations" },
    { href: "/locations/vic/horsham", label: "Open Horsham locations" },
  ]);
  assert.notDeepEqual(gladstoneNextLinks(), nanniesVicNextLinks());
  assert.notDeepEqual(gladstoneNextLinks(), ipswichNextLinks());
  assert.notDeepEqual(gladstoneNextLinks(), [locationBoardLink({ city: "gladstone", cityName: "Gladstone" })]);
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/caregivers/nannies/vic"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/locations/nsw/broken-hill"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/locations/nsw/queanbeyan"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/locations/qld/ipswich"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/locations/wa/kalgoorlie"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/locations/wa/esperance"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!gladstoneNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!gladstoneNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
