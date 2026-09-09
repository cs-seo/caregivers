import assert from "node:assert/strict";
import { test } from "node:test";
import { jobShareHeading, jobShareNotice, jobSharePath, jobShareUrl } from "./job-share";

test("jobShareUrl is the public care-request path", () => {
  assert.equal(jobSharePath("weekday-aged-care-marrickville"), "/care-requests/weekday-aged-care-marrickville");
  assert.equal(
    jobShareUrl("weekday-aged-care-marrickville", "https://careproof.com.au"),
    "https://careproof.com.au/care-requests/weekday-aged-care-marrickville",
  );
});

test("jobShareNotice tells the family why to copy the link", () => {
  assert.equal(jobShareHeading(), "Share this request");
  assert.match(jobShareNotice("owner"), /household member/);
  assert.match(jobShareNotice("public"), /send a proposal/);
});
