import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarNextLinks, calendarNextNotice } from "./calendar-next";
import { jobViewerFamilyLinks } from "./job-viewer";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";

test("reviewsDueNextNotice names browse-again without a count or publish CTA", () => {
  assert.match(reviewsDueNextNotice(), /Need cover again/);
  assert.match(reviewsDueNextNotice(), /Browse verified carers/);
  assert.doesNotMatch(reviewsDueNextNotice(), /\d+ open/);
  assert.doesNotMatch(reviewsDueNextNotice(), /Write a review/);
  assert.doesNotMatch(reviewsDueNextNotice(), /job=/);
  assert.notEqual(reviewsDueNextNotice(), calendarNextNotice());
});

test("reviewsDueNextLinks go to that specialty directory, not the sit review form", () => {
  assert.deepEqual(
    reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }),
    [
      { href: "/caregivers/aged-care", label: "Browse aged care carers" },
      { href: "/dashboard", label: "Back to your dashboard" },
    ],
  );
  assert.deepEqual(reviewsDueNextLinks(), [{ href: "/caregivers", label: "Browse verified carers" }]);
  assert.ok(!reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }).some((link) =>
    link.href.includes("#review"),
  ));
  assert.notDeepEqual(
    reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }),
    calendarNextLinks(),
  );
  assert.notDeepEqual(
    reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }),
    jobViewerFamilyLinks({
      startDate: new Date("2026-08-20T00:00:00.000Z"),
      specialty: { slug: "aged-care", name: "Aged care", pluralName: "Aged care carers" },
      city: { slug: "sydney", name: "Sydney", state: { slug: "nsw" } },
    }),
  );
});
