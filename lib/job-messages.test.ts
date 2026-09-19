import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canSendJobMessage,
  canViewJobThread,
  groupJobMessages,
  isCarerInvolvedInJob,
  sanitizeJobMessage,
} from "./job-messages";

const job = { familyId: "alex", status: "open" };

test("sanitizeJobMessage trims and caps length", () => {
  assert.equal(sanitizeJobMessage("  8:15 is fine  "), "8:15 is fine");
  assert.equal(sanitizeJobMessage("x".repeat(1200)).length, 1000);
});

test("isCarerInvolvedInJob is true for invited, proposed or hired carers", () => {
  assert.equal(isCarerInvolvedInJob({ caregiverId: "james", invited: true }), true);
  assert.equal(isCarerInvolvedInJob({ caregiverId: "sarah", proposed: true }), true);
  assert.equal(isCarerInvolvedInJob({ caregiverId: "sarah", hiredCaregiverId: "sarah" }), true);
  assert.equal(isCarerInvolvedInJob({ caregiverId: "elena" }), false);
  assert.equal(isCarerInvolvedInJob({ caregiverId: "elena", hiredCaregiverId: "sarah" }), false);
});

test("canViewJobThread is only the family or the involved carer", () => {
  assert.equal(
    canViewJobThread({
      job,
      viewerId: "alex",
      threadCaregiverId: "james",
      involved: true,
    }),
    true,
  );
  assert.equal(
    canViewJobThread({
      job,
      viewerId: "james-user",
      viewerCaregiverId: "james",
      threadCaregiverId: "james",
      involved: true,
    }),
    true,
  );
  assert.equal(
    canViewJobThread({
      job,
      viewerId: "elena-user",
      viewerCaregiverId: "elena",
      threadCaregiverId: "james",
      involved: true,
    }),
    false,
  );
  assert.equal(
    canViewJobThread({
      job,
      viewerId: "alex",
      threadCaregiverId: "elena",
      involved: false,
    }),
    false,
  );
});

test("canSendJobMessage only while the request is open", () => {
  assert.equal(
    canSendJobMessage({
      job,
      viewerId: "alex",
      threadCaregiverId: "james",
      involved: true,
    }),
    true,
  );
  assert.equal(
    canSendJobMessage({
      job: { familyId: "alex", status: "hired" },
      viewerId: "alex",
      threadCaregiverId: "sarah",
      involved: true,
    }),
    false,
  );
});

test("groupJobMessages keeps each carer thread together", () => {
  const groups = groupJobMessages([
    { caregiverId: "james", body: "first" },
    { caregiverId: "sarah", body: "proposal q" },
    { caregiverId: "james", body: "reply" },
  ]);
  assert.deepEqual(
    groups.get("james")?.map((row) => row.body),
    ["first", "reply"],
  );
  assert.equal(groups.get("sarah")?.length, 1);
});
