import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSchoolVicNextLinks, afterSchoolVicNextNotice } from "./after-school-vic-next";
import { herveyBayNextLinks, herveyBayNextNotice, herveyBayNextShows } from "./hervey-bay-next";
import { ipswichNextLinks, ipswichNextNotice, ipswichNextShows } from "./ipswich-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";

test("ipswichNextNotice names unused Kalgoorlie and Esperance paths without a count or Instant Book", () => {
  assert.match(ipswichNextNotice(), /Ipswich/);
  assert.match(ipswichNextNotice(), /Kalgoorlie/);
  assert.match(ipswichNextNotice(), /Esperance/);
  assert.doesNotMatch(ipswichNextNotice(), /\d+ open/);
  assert.doesNotMatch(ipswichNextNotice(), /Instant Book/);
  assert.doesNotMatch(ipswichNextNotice(), /Hire/);
  assert.doesNotMatch(ipswichNextNotice(), /job=/);
  assert.doesNotMatch(ipswichNextNotice(), /Geraldton/);
  assert.doesNotMatch(ipswichNextNotice(), /Albany/);
  assert.doesNotMatch(ipswichNextNotice(), /Hervey Bay/);
  assert.doesNotMatch(ipswichNextNotice(), /Bunbury/);
  assert.doesNotMatch(ipswichNextNotice(), /Ulverstone/);
  assert.notEqual(ipswichNextNotice(), afterSchoolVicNextNotice());
  assert.notEqual(ipswichNextNotice(), herveyBayNextNotice());
  assert.notEqual(ipswichNextNotice(), locationBoardNotice("Ipswich"));
});

test("ipswichNextShows is a signed-in family on Ipswich only", () => {
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "qld", citySlug: "ipswich" }), true);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "qld", citySlug: "hervey-bay" }), false);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "wa", citySlug: "kalgoorlie" }), false);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "wa", citySlug: "esperance" }), false);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "wa", citySlug: "geraldton" }), false);
  assert.equal(ipswichNextShows({ isFamily: true, stateSlug: "wa", citySlug: "albany" }), false);
  assert.equal(ipswichNextShows({ isFamily: false, stateSlug: "qld", citySlug: "ipswich" }), false);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "ipswich" }), false);
});

test("ipswichNextLinks go to Kalgoorlie and Esperance, not Geraldton or Hervey Bay", () => {
  assert.deepEqual(ipswichNextLinks(), [
    { href: "/locations/wa/kalgoorlie", label: "Open Kalgoorlie locations" },
    { href: "/locations/wa/esperance", label: "Open Esperance locations" },
  ]);
  assert.notDeepEqual(ipswichNextLinks(), afterSchoolVicNextLinks());
  assert.notDeepEqual(ipswichNextLinks(), herveyBayNextLinks());
  assert.notDeepEqual(ipswichNextLinks(), [locationBoardLink({ city: "ipswich", cityName: "Ipswich" })]);
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/caregivers/after-school-care/vic"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/locations/wa/geraldton"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/locations/wa/albany"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/locations/qld/hervey-bay"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/locations/wa/bunbury"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/locations/tas/ulverstone"));
  assert.ok(!ipswichNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!ipswichNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!ipswichNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
