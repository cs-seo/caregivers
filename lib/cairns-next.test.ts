import assert from "node:assert/strict";
import { test } from "node:test";
import { cairnsNextLinks, cairnsNextNotice, cairnsNextShows } from "./cairns-next";
import { companionCareQldNextLinks, companionCareQldNextNotice } from "./companion-care-qld-next";
import { gympieNextLinks, gympieNextNotice, gympieNextShows } from "./gympie-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";

test("cairnsNextNotice names unused Karratha and Port Pirie paths without a count or Instant Book", () => {
  assert.match(cairnsNextNotice(), /Cairns/);
  assert.match(cairnsNextNotice(), /Karratha/);
  assert.match(cairnsNextNotice(), /Port Pirie/);
  assert.doesNotMatch(cairnsNextNotice(), /\d+ open/);
  assert.doesNotMatch(cairnsNextNotice(), /Instant Book/);
  assert.doesNotMatch(cairnsNextNotice(), /Hire/);
  assert.doesNotMatch(cairnsNextNotice(), /job=/);
  assert.doesNotMatch(cairnsNextNotice(), /Mount Isa/);
  assert.doesNotMatch(cairnsNextNotice(), /Port Hedland/);
  assert.doesNotMatch(cairnsNextNotice(), /Gympie/);
  assert.doesNotMatch(cairnsNextNotice(), /Murray Bridge/);
  assert.doesNotMatch(cairnsNextNotice(), /Port Augusta/);
  assert.notEqual(cairnsNextNotice(), companionCareQldNextNotice());
  assert.notEqual(cairnsNextNotice(), gympieNextNotice());
  assert.notEqual(cairnsNextNotice(), locationBoardNotice("Cairns"));
});

test("cairnsNextShows is a signed-in family on Cairns only", () => {
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "qld", citySlug: "cairns" }), true);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gympie" }), false);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "qld", citySlug: "mount-isa" }), false);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "wa", citySlug: "port-hedland" }), false);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "wa", citySlug: "karratha" }), false);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "sa", citySlug: "port-pirie" }), false);
  assert.equal(cairnsNextShows({ isFamily: false, stateSlug: "qld", citySlug: "cairns" }), false);
  assert.equal(gympieNextShows({ isFamily: true, stateSlug: "qld", citySlug: "cairns" }), false);
});

test("cairnsNextLinks go to Karratha and Port Pirie, not Mount Isa or Gympie", () => {
  assert.deepEqual(cairnsNextLinks(), [
    { href: "/locations/wa/karratha", label: "Open Karratha locations" },
    { href: "/locations/sa/port-pirie", label: "Open Port Pirie locations" },
  ]);
  assert.notDeepEqual(cairnsNextLinks(), companionCareQldNextLinks());
  assert.notDeepEqual(cairnsNextLinks(), gympieNextLinks());
  assert.notDeepEqual(cairnsNextLinks(), [locationBoardLink({ city: "cairns", cityName: "Cairns" })]);
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/caregivers/companion-care/qld"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/locations/qld/mount-isa"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/locations/wa/port-hedland"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/locations/qld/gympie"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/locations/sa/murray-bridge"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/locations/sa/port-augusta"));
  assert.ok(!cairnsNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!cairnsNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!cairnsNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
