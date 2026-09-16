import assert from "node:assert/strict";
import { test } from "node:test";
import { gympieNextLinks, gympieNextNotice, gympieNextShows } from "./gympie-next";
import { housekeepingQldNextLinks, housekeepingQldNextNotice } from "./housekeeping-qld-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { maryboroughNextLinks, maryboroughNextNotice, maryboroughNextShows } from "./maryborough-next";

test("gympieNextNotice names unused Murray Bridge and Port Augusta paths without a count or Instant Book", () => {
  assert.match(gympieNextNotice(), /Gympie/);
  assert.match(gympieNextNotice(), /Murray Bridge/);
  assert.match(gympieNextNotice(), /Port Augusta/);
  assert.doesNotMatch(gympieNextNotice(), /\d+ open/);
  assert.doesNotMatch(gympieNextNotice(), /Instant Book/);
  assert.doesNotMatch(gympieNextNotice(), /Hire/);
  assert.doesNotMatch(gympieNextNotice(), /job=/);
  assert.doesNotMatch(gympieNextNotice(), /Echuca/);
  assert.doesNotMatch(gympieNextNotice(), /Hamilton/);
  assert.doesNotMatch(gympieNextNotice(), /Maryborough/);
  assert.doesNotMatch(gympieNextNotice(), /Sale/);
  assert.doesNotMatch(gympieNextNotice(), /Busselton/);
  assert.notEqual(gympieNextNotice(), housekeepingQldNextNotice());
  assert.notEqual(gympieNextNotice(), maryboroughNextNotice());
  assert.notEqual(gympieNextNotice(), locationBoardNotice("Gympie"));
});

test("gympieNextShows is a signed-in family on Gympie only", () => {
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gympie" }), true);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "qld", citySlug: "maryborough" }), false);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "sa", citySlug: "murray-bridge" }), false);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "sa", citySlug: "port-augusta" }), false);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "vic", citySlug: "echuca" }), false);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "vic", citySlug: "hamilton" }), false);
  assert.equal(gympieNextShows({ isFamily: false, stateSlug: "qld", citySlug: "gympie" }), false);
  assert.equal(maryboroughNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gympie" }), false);
});

test("gympieNextLinks go to Murray Bridge and Port Augusta, not Echuca or Maryborough", () => {
  assert.deepEqual(gympieNextLinks(), [
    { href: "/locations/sa/murray-bridge", label: "Open Murray Bridge locations" },
    { href: "/locations/sa/port-augusta", label: "Open Port Augusta locations" },
  ]);
  assert.notDeepEqual(gympieNextLinks(), housekeepingQldNextLinks());
  assert.notDeepEqual(gympieNextLinks(), maryboroughNextLinks());
  assert.notDeepEqual(gympieNextLinks(), [locationBoardLink({ city: "gympie", cityName: "Gympie" })]);
  assert.ok(!gympieNextLinks().some((link) => link.href === "/caregivers/housekeeping/qld"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/locations/vic/echuca"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/locations/vic/hamilton"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/locations/qld/maryborough"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/locations/vic/sale"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/locations/wa/busselton"));
  assert.ok(!gympieNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!gympieNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!gympieNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
