import assert from "node:assert/strict";
import { test } from "node:test";
import {
  INVITE_STATUS,
  canCreateInvite,
  canInviteToJob,
  canUpdateInviteNote,
  canWithdrawInvite,
  hiredInviteStatus,
  inviteButtonLabel,
  inviteStatusLabel,
  isSafeInviteReturnPath,
  defaultInviteJobSlug,
  invitableOpenJobs,
  sanitizeInviteNote,
} from "./job-invite";

test("sanitizeInviteNote trims and caps length", () => {
  assert.equal(sanitizeInviteNote("  Weekday mornings  "), "Weekday mornings");
  assert.equal(sanitizeInviteNote("x".repeat(500)).length, 400);
});

test("canInviteToJob only allows the family on an open request", () => {
  assert.equal(canInviteToJob({ familyId: "alex", status: "open" }, "alex"), true);
  assert.equal(canInviteToJob({ familyId: "alex", status: "hired" }, "alex"), false);
  assert.equal(canInviteToJob({ familyId: "alex", status: "open" }, "other"), false);
  assert.equal(canInviteToJob(null, "alex"), false);
});

test("canWithdrawInvite is only for a pending invite on the family's open request", () => {
  const job = { familyId: "alex", status: "open" };
  assert.equal(canWithdrawInvite({ status: INVITE_STATUS.PENDING }, job, "alex"), true);
  assert.equal(canWithdrawInvite({ status: INVITE_STATUS.APPLIED }, job, "alex"), false);
  assert.equal(canWithdrawInvite({ status: INVITE_STATUS.PENDING }, { familyId: "alex", status: "hired" }, "alex"), false);
  assert.equal(canWithdrawInvite({ status: INVITE_STATUS.PENDING }, job, "other"), false);
  assert.equal(canWithdrawInvite(null, job, "alex"), false);
});

test("canUpdateInviteNote matches a withdrawable pending invite", () => {
  const job = { familyId: "alex", status: "open" };
  assert.equal(canUpdateInviteNote({ status: INVITE_STATUS.PENDING }, job, "alex"), true);
  assert.equal(canUpdateInviteNote({ status: INVITE_STATUS.DECLINED }, job, "alex"), false);
});

test("canCreateInvite skips carers who already proposed or have a live invite", () => {
  const job = { familyId: "alex", status: "open" };
  assert.equal(canCreateInvite(job, "alex"), true);
  assert.equal(canCreateInvite(job, "alex", { status: INVITE_STATUS.PENDING }), false);
  assert.equal(canCreateInvite(job, "alex", { status: INVITE_STATUS.APPLIED }), false);
  assert.equal(canCreateInvite(job, "alex", { status: INVITE_STATUS.DECLINED }), true);
  assert.equal(canCreateInvite(job, "alex", null, true), false);
  assert.equal(canCreateInvite({ familyId: "alex", status: "hired" }, "alex"), false);
});

test("hiring applies the chosen invite and declines leftover pending invites", () => {
  assert.equal(hiredInviteStatus("pending", "james", "james"), INVITE_STATUS.APPLIED);
  assert.equal(hiredInviteStatus("pending", "elena", "james"), INVITE_STATUS.DECLINED);
  assert.equal(hiredInviteStatus("applied", "james", "other"), INVITE_STATUS.APPLIED);
});

test("invite labels stay family-facing", () => {
  assert.equal(inviteStatusLabel("pending"), "Invited");
  assert.equal(inviteStatusLabel("applied"), "Applied");
  assert.equal(inviteStatusLabel("declined"), "Declined");
  assert.equal(inviteButtonLabel(null), "Invite to this request");
  assert.equal(inviteButtonLabel({ status: "pending" }), "Invited");
  assert.equal(inviteButtonLabel({ status: "declined" }), "Invite again");
  assert.equal(inviteButtonLabel(null, true), "Already proposed");
});

test("isSafeInviteReturnPath stays on local marketplace pages", () => {
  assert.equal(
    isSafeInviteReturnPath("/caregiver/james-okafor-disability-support-sydney?job=weekday-aged-care-marrickville"),
    true,
  );
  assert.equal(
    isSafeInviteReturnPath("/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&job=weekday-aged-care-marrickville"),
    true,
  );
  assert.equal(isSafeInviteReturnPath("/care-requests/weekday-aged-care-marrickville"), true);
  assert.equal(isSafeInviteReturnPath("/dashboard"), true);
  assert.equal(isSafeInviteReturnPath("/dashboard/shortlist"), true);
  assert.equal(isSafeInviteReturnPath("https://evil.example/caregiver/x"), false);
  assert.equal(isSafeInviteReturnPath("//evil"), false);
});

test("invitableOpenJobs skips hired, proposed and already-invited requests", () => {
  const jobs = [
    { slug: "weekday-aged-care-marrickville", title: "Marrickville", familyId: "alex", status: "open" },
    {
      slug: "overnight-respite-adelaide",
      title: "Norwood",
      familyId: "alex",
      status: "open",
      existing: { status: INVITE_STATUS.PENDING },
    },
    { slug: "midweek-respite-leichhardt", title: "Leichhardt", familyId: "alex", status: "hired" },
  ];
  assert.deepEqual(
    invitableOpenJobs(jobs, "alex").map((job) => job.slug),
    ["weekday-aged-care-marrickville"],
  );
  assert.equal(defaultInviteJobSlug(jobs, "alex", "overnight-respite-adelaide"), "weekday-aged-care-marrickville");
  assert.equal(defaultInviteJobSlug(jobs, "alex", "weekday-aged-care-marrickville"), "weekday-aged-care-marrickville");
});
