import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSydneyDateTimeLocal } from "./format";
import { jobViewerFamilyHeading, jobViewerFamilyLinks, jobViewerFamilyNotice } from "./job-viewer";

const brunswick = {
  startDate: parseSydneyDateTimeLocal("2026-09-22T15:20"),
  specialty: { slug: "after-school-care", name: "After-school care", pluralName: "After-school carers" },
  city: { slug: "melbourne", name: "Melbourne", state: { slug: "vic" } },
};

test("jobViewerFamilyLinks send non-owners to browse, post and the local board", () => {
  assert.equal(jobViewerFamilyHeading(), "Need similar care?");
  assert.match(jobViewerFamilyNotice("after-school carers", "Melbourne"), /Melbourne/);
  assert.doesNotMatch(jobViewerFamilyNotice("after-school carers", "Melbourne"), /\d+ open/);
  assert.deepEqual(
    jobViewerFamilyLinks(brunswick).map((link) => [link.label, link.href]),
    [
      [
        "Browse after-school carers in Melbourne",
        "/caregivers/after-school-care/vic/melbourne?availableOn=2026-09-22&availableAt=15:20",
      ],
      ["Post your own care request", "/post-a-job?specialty=after-school-care&city=melbourne"],
      ["Open after-school care requests in Melbourne", "/care-requests?specialty=after-school-care&city=melbourne"],
    ],
  );
  assert.doesNotMatch(jobViewerFamilyLinks(brunswick)[0]?.href ?? "", /[?&]job=/);
});
