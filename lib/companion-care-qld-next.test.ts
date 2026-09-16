import assert from "node:assert/strict";
import { test } from "node:test";
import {
  companionCareQldNextLinks,
  companionCareQldNextNotice,
  companionCareQldNextShows,
} from "./companion-care-qld-next";
import { companionCareSaNextLinks, companionCareSaNextNotice, companionCareSaNextShows } from "./companion-care-sa-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { gympieNextLinks, gympieNextNotice } from "./gympie-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { housekeepingQldNextLinks, housekeepingQldNextNotice, housekeepingQldNextShows } from "./housekeeping-qld-next";

test("companionCareQldNextNotice names unused Mount Isa and Port Hedland paths without a count or Instant Book", () => {
  assert.match(companionCareQldNextNotice(), /Companion carers/);
  assert.match(companionCareQldNextNotice(), /Queensland/);
  assert.match(companionCareQldNextNotice(), /Mount Isa/);
  assert.match(companionCareQldNextNotice(), /Port Hedland/);
  assert.doesNotMatch(companionCareQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Hire/);
  assert.doesNotMatch(companionCareQldNextNotice(), /job=/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Gympie/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Murray Bridge/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Port Augusta/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Echuca/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Hamilton/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Launceston/);
  assert.doesNotMatch(companionCareQldNextNotice(), /Mount Gambier/);
  assert.notEqual(companionCareQldNextNotice(), gympieNextNotice());
  assert.notEqual(companionCareQldNextNotice(), housekeepingQldNextNotice());
  assert.notEqual(companionCareQldNextNotice(), companionCareSaNextNotice());
});

test("companionCareQldNextShows is a signed-in family on QLD companion care only", () => {
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: false,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/companion-care/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care"), false);
});

test("companionCareQldNextLinks go to Mount Isa and Port Hedland, not Gympie or Echuca", () => {
  assert.deepEqual(companionCareQldNextLinks(), [
    { href: "/locations/qld/mount-isa", label: "Open Mount Isa locations" },
    { href: "/locations/wa/port-hedland", label: "Open Port Hedland locations" },
  ]);
  assert.notDeepEqual(companionCareQldNextLinks(), gympieNextLinks());
  assert.notDeepEqual(companionCareQldNextLinks(), housekeepingQldNextLinks());
  assert.notDeepEqual(companionCareQldNextLinks(), companionCareSaNextLinks());
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/qld/gympie"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/sa/murray-bridge"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/sa/port-augusta"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/caregivers/housekeeping/qld"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/vic/echuca"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/vic/hamilton"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/tas/launceston"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/locations/sa/mount-gambier"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/caregivers/companion-care"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/caregivers/companion-care/qld/brisbane"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!companionCareQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!companionCareQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
