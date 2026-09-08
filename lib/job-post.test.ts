import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SIMILAR_JOB_LIMIT,
  isPostedFlash,
  parsePostJobPrefill,
  postJobHref,
  postedJobHref,
  postedJobNotice,
  similarJobsNotice,
  similarJobsTitle,
  similarJobsWhere,
} from "./job-post";

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

test("similarJobsWhere keeps accepting jobs in that city and specialty", () => {
  const now = new Date("2026-09-08T00:00:00+10:00");
  assert.deepEqual(similarJobsWhere({ cityId: "city-sydney", specialtyId: "spec-aged" }, now), {
    status: "open",
    startDate: { gt: now },
    cityId: "city-sydney",
    specialtyId: "spec-aged",
  });
  assert.equal(SIMILAR_JOB_LIMIT, 3);
});

test("similarJobsNotice warns about a family's own open request", () => {
  assert.equal(similarJobsTitle("Aged care", "Sydney"), "Open aged care requests in Sydney");
  assert.equal(
    similarJobsNotice({ count: 1, ownCount: 1, specialtyName: "Aged care", cityName: "Sydney" }),
    "You already have an open aged care request in Sydney. Open it instead of posting a duplicate, or post if you still need another sit.",
  );
  assert.equal(
    similarJobsNotice({ count: 0, ownCount: 0, specialtyName: "Aged care", cityName: "Perth" }),
    "No open aged care requests in Perth yet. Yours would be the first on the board.",
  );
  assert.match(
    similarJobsNotice({ count: 2, ownCount: 0, specialtyName: "Aged care", cityName: "Sydney" }),
    /already accepting proposals in Sydney/,
  );
});
