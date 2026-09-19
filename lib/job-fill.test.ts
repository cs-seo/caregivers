import assert from "node:assert/strict";
import { test } from "node:test";
import { JOB_FILL_STEPS, jobFillHeading, jobFillNotice } from "./job-fill";

test("job fill path has book, invite and hire steps", () => {
  assert.equal(jobFillHeading(), "How this request gets filled");
  assert.equal(JOB_FILL_STEPS.length, 3);
  assert.equal(JOB_FILL_STEPS[0].title, "Book someone who is free");
  assert.equal(JOB_FILL_STEPS[1].title, "Invite a carer to propose");
  assert.equal(JOB_FILL_STEPS[2].title, "Hire a written proposal");
});

test("job fill notice says booking closes the request and an invite does not", () => {
  assert.match(jobFillNotice(), /closes this request/);
  assert.match(jobFillNotice(), /written proposal/);
  assert.match(JOB_FILL_STEPS[1].body, /does not book them/);
  assert.match(JOB_FILL_STEPS[2].body, /escrow/);
});
