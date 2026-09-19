import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersVicNextLinks, babysittersVicNextNotice } from "./babysitters-vic-next";
import { gladstoneNextLinks, gladstoneNextNotice, gladstoneNextShows } from "./gladstone-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { maryboroughNextLinks, maryboroughNextNotice, maryboroughNextShows } from "./maryborough-next";

test("maryboroughNextNotice names unused Sale and Busselton paths without a count or Instant Book", () => {
  assert.match(maryboroughNextNotice(), /Maryborough/);
  assert.match(maryboroughNextNotice(), /Sale/);
  assert.match(maryboroughNextNotice(), /Busselton/);
  assert.doesNotMatch(maryboroughNextNotice(), /\d+ open/);
  assert.doesNotMatch(maryboroughNextNotice(), /Instant Book/);
  assert.doesNotMatch(maryboroughNextNotice(), /Hire/);
  assert.doesNotMatch(maryboroughNextNotice(), /job=/);
  assert.doesNotMatch(maryboroughNextNotice(), /Grafton/);
  assert.doesNotMatch(maryboroughNextNotice(), /Wodonga/);
  assert.doesNotMatch(maryboroughNextNotice(), /Gladstone/);
  assert.doesNotMatch(maryboroughNextNotice(), /Traralgon/);
  assert.doesNotMatch(maryboroughNextNotice(), /Horsham/);
  assert.notEqual(maryboroughNextNotice(), babysittersVicNextNotice());
  assert.notEqual(maryboroughNextNotice(), gladstoneNextNotice());
  assert.notEqual(maryboroughNextNotice(), locationBoardNotice("Maryborough"));
});

test("maryboroughNextShows is a signed-in family on Maryborough only", () => {
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "qld", citySlug: "maryborough" }), true);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gladstone" }), false);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "vic", citySlug: "sale" }), false);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "wa", citySlug: "busselton" }), false);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "grafton" }), false);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "vic", citySlug: "wodonga" }), false);
  assert.equal(maryboroughNextShows({ isFamily: false, stateSlug: "qld", citySlug: "maryborough" }), false);
  assert.equal(gladstoneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "maryborough" }), false);
});

test("maryboroughNextLinks go to Sale and Busselton, not Grafton or Gladstone", () => {
  assert.deepEqual(maryboroughNextLinks(), [
    { href: "/locations/vic/sale", label: "Open Sale locations" },
    { href: "/locations/wa/busselton", label: "Open Busselton locations" },
  ]);
  assert.notDeepEqual(maryboroughNextLinks(), babysittersVicNextLinks());
  assert.notDeepEqual(maryboroughNextLinks(), gladstoneNextLinks());
  assert.notDeepEqual(maryboroughNextLinks(), [locationBoardLink({ city: "maryborough", cityName: "Maryborough" })]);
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/caregivers/babysitters/vic"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/locations/nsw/grafton"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/locations/vic/wodonga"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/locations/qld/gladstone"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/locations/vic/traralgon"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/locations/vic/horsham"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!maryboroughNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!maryboroughNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
