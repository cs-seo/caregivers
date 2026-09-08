import assert from "node:assert/strict";
import { test } from "node:test";
import { isPostedFlash, parsePostJobPrefill, postJobHref, postedJobHref, postedJobNotice } from "./job-post";

test("postedJobHref and isPostedFlash mark a fresh request", () => {
  assert.equal(postedJobHref("weekday-aged-care-marrickville"), "/care-requests/weekday-aged-care-marrickville?posted=1");
  assert.equal(isPostedFlash("1"), true);
  assert.equal(isPostedFlash("0"), false);
  assert.equal(isPostedFlash(undefined), false);
});

test("postedJobNotice tells the family what to do next", () => {
  assert.match(postedJobNotice(), /Request posted/);
  assert.match(postedJobNotice(), /Book or invite/);
  assert.match(postedJobNotice(), /Proposal alerts/);
});

test("postJobHref and parsePostJobPrefill keep safe specialty and city slugs", () => {
  assert.equal(postJobHref({ specialty: "aged-care", city: "perth" }), "/post-a-job?specialty=aged-care&city=perth");
  assert.equal(postJobHref({ specialty: "aged-care" }), "/post-a-job?specialty=aged-care");
  assert.equal(postJobHref(), "/post-a-job");
  assert.deepEqual(parsePostJobPrefill({ specialty: "aged-care", city: "perth" }), {
    specialty: "aged-care",
    city: "perth",
  });
  assert.deepEqual(parsePostJobPrefill({ specialty: "AGED CARE", city: "../evil" }), {
    specialty: undefined,
    city: undefined,
  });
});
