import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { nursingNextLinks, nursingNextNotice } from "./nursing-next";
import { photosNextLinks, photosNextNotice } from "./photos-next";
import { respiteNextLinks, respiteNextNotice } from "./respite-next";
import { shortlistPlacesLinks, shortlistPlacesNotice } from "./shortlist-places";
import { agedCareNextLinks, agedCareNextNotice, agedCareNextShows } from "./aged-care-next";

test("agedCareNextNotice names unused aged care paths without a count or Instant Book", () => {
  assert.match(agedCareNextNotice(), /Aged care/);
  assert.match(agedCareNextNotice(), /Sunshine Coast/);
  assert.match(agedCareNextNotice(), /Cairns/);
  assert.doesNotMatch(agedCareNextNotice(), /\d+ open/);
  assert.doesNotMatch(agedCareNextNotice(), /Instant Book/);
  assert.doesNotMatch(agedCareNextNotice(), /Hire/);
  assert.doesNotMatch(agedCareNextNotice(), /job=/);
  assert.doesNotMatch(agedCareNextNotice(), /Wollongong/);
  assert.doesNotMatch(agedCareNextNotice(), /Tasmania/);
  assert.doesNotMatch(agedCareNextNotice(), /in-home aged care/);
  assert.doesNotMatch(agedCareNextNotice(), /GST/);
  assert.doesNotMatch(agedCareNextNotice(), /Western Australia/);
  assert.doesNotMatch(agedCareNextNotice(), /NDIS/);
  assert.doesNotMatch(agedCareNextNotice(), /nurses/);
  assert.doesNotMatch(agedCareNextNotice(), /respite/);
  assert.notEqual(agedCareNextNotice(), disabilityNextNotice());
  assert.notEqual(agedCareNextNotice(), nursingNextNotice());
  assert.notEqual(agedCareNextNotice(), respiteNextNotice());
  assert.notEqual(agedCareNextNotice(), caregiversNextNotice());
  assert.notEqual(agedCareNextNotice(), photosNextNotice());
  assert.notEqual(agedCareNextNotice(), shortlistPlacesNotice());
  assert.notEqual(agedCareNextNotice(), familyStartNotice());
  assert.notEqual(agedCareNextNotice(), guidesIndexNextNotice());
});

test("agedCareNextShows is a signed-in family on aged care only", () => {
  assert.equal(agedCareNextShows({ isFamily: true, specialtySlug: "aged-care", specialtyPath: true }), true);
  assert.equal(
    agedCareNextShows({ isFamily: true, specialtySlug: "aged-care", specialtyPath: true, jobAttached: true }),
    false,
  );
  assert.equal(
    agedCareNextShows({ isFamily: true, specialtySlug: "disability-support", specialtyPath: true }),
    false,
  );
  assert.equal(agedCareNextShows({ isFamily: true, specialtySlug: "aged-care", specialtyPath: false }), false);
  assert.equal(agedCareNextShows({ isFamily: false, specialtySlug: "aged-care", specialtyPath: true }), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers/aged-care"), true);
});

test("agedCareNextLinks go to Sunshine Coast and Cairns, not Wollongong or Tasmania", () => {
  assert.deepEqual(agedCareNextLinks(), [
    { href: "/caregivers/aged-care/qld/sunshine-coast", label: "Browse aged care on the Sunshine Coast" },
    { href: "/locations/qld/cairns", label: "Open Cairns locations" },
  ]);
  assert.notDeepEqual(agedCareNextLinks(), disabilityNextLinks());
  assert.notDeepEqual(agedCareNextLinks(), nursingNextLinks());
  assert.notDeepEqual(agedCareNextLinks(), respiteNextLinks());
  assert.notDeepEqual(agedCareNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(agedCareNextLinks(), photosNextLinks());
  assert.notDeepEqual(agedCareNextLinks(), shortlistPlacesLinks());
  assert.notDeepEqual(agedCareNextLinks(), familyStartLinks());
  assert.notDeepEqual(agedCareNextLinks(), guidesIndexNextLinks());
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/guides/in-home-aged-care"));
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/locations/tas"));
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/locations/nsw/wollongong"));
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/guides/gst-invoices-for-hcp-and-ndis"));
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/caregivers/disability-support/wa"));
  assert.ok(!agedCareNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!agedCareNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!agedCareNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
