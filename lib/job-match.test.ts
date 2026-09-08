import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSydneyDateTimeLocal } from "./format";
import { attachJobNotice, bookHref, caregiverHref, canAttachJob, formatJobStart, isJobSlug, isUtcDateOnly, jobBookHref, jobDirectoryHref, jobFitForCarer, jobFitsCarer, jobMissLabel, jobMissReason, matchingJobs, profileJobFitNotice, shortlistCompareNotice, shortlistHref, sortByJobFit, toJobMatchCarer } from "./job-match";
import { parseWeeklyHours } from "./weekly-windows";

const sarah = {
  cityId: "sydney",
  specialtyIds: ["aged-care", "nursing"],
  windows: parseWeeklyHours("Mon–Fri 7am–1pm"),
  blockedKeys: ["2026-09-13", "2026-09-14"],
};

test("weekday Sydney aged-care job fits Sarah", () => {
  const job = { cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-15T00:00:00.000Z") };
  assert.equal(jobMissReason(job, sarah), null);
  assert.equal(jobFitsCarer(job, sarah), true);
  assert.equal(jobMissLabel(null), "Fits your roster");
});

test("Saturday job misses on usual hours", () => {
  const job = { cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-12T00:00:00.000Z") };
  assert.equal(jobMissReason(job, sarah), "hours");
  assert.equal(jobMissLabel("hours"), "Outside your usual weekly hours");
});

test("away day and other city or specialty miss", () => {
  assert.equal(
    jobMissReason({ cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-14T00:00:00.000Z") }, sarah),
    "away",
  );
  assert.equal(
    jobMissReason({ cityId: "melbourne", specialtyId: "aged-care", startDate: new Date("2026-09-15T00:00:00.000Z") }, sarah),
    "city",
  );
  assert.equal(
    jobMissReason({ cityId: "sydney", specialtyId: "babysitters", startDate: new Date("2026-09-15T00:00:00.000Z") }, sarah),
    "specialty",
  );
});

test("matchingJobs keeps only fits", () => {
  const jobs = [
    { id: "a", cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-15T00:00:00.000Z") },
    { id: "b", cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-12T00:00:00.000Z") },
  ];
  assert.deepEqual(matchingJobs(jobs, sarah).map((job) => job.id), ["a"]);
});

test("empty weekly hours stay unspecified and still fit a Saturday", () => {
  const openRoster = { cityId: "sydney", specialtyIds: ["aged-care"], windows: [] };
  const saturday = { cityId: "sydney", specialtyId: "aged-care", startDate: new Date("2026-09-12T00:00:00.000Z") };
  assert.equal(jobMissReason(saturday, openRoster), null);
});

test("a timed Saturday evening sit misses Priya's morning window", () => {
  const priya = {
    cityId: "sydney",
    specialtyIds: ["babysitters", "nannies"],
    windows: parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings"),
  };
  const tess = {
    cityId: "sydney",
    specialtyIds: ["babysitters"],
    windows: parseWeeklyHours("Thu–Sun 5pm–midnight"),
  };
  const bondi = {
    cityId: "sydney",
    specialtyId: "babysitters",
    startDate: parseSydneyDateTimeLocal("2026-09-12T18:00"),
  };
  assert.equal(isUtcDateOnly(bondi.startDate), false);
  assert.equal(jobMissReason(bondi, priya), "hours");
  assert.equal(jobMissReason(bondi, tess), null);
  assert.equal(formatJobStart(bondi.startDate), "12 Sept 2026, 6:00 pm");
});

test("a timed Tuesday morning sit still fits Sarah", () => {
  const job = {
    cityId: "sydney",
    specialtyId: "aged-care",
    startDate: parseSydneyDateTimeLocal("2026-09-15T08:00"),
  };
  assert.equal(jobMissReason(job, sarah), null);
  assert.equal(formatJobStart(job.startDate), "15 Sept 2026, 8:00 am");
});

test("jobDirectoryHref points at Needed on with the start clock time", () => {
  assert.equal(
    jobDirectoryHref({
      slug: "weekday-aged-care-marrickville",
      startDate: parseSydneyDateTimeLocal("2026-09-15T08:00"),
      specialty: { slug: "aged-care" },
      city: { slug: "sydney", state: { slug: "nsw" } },
    }),
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&availableAt=08:00&job=weekday-aged-care-marrickville",
  );
  assert.equal(
    jobDirectoryHref({
      slug: "saturday-babysitter-bondi",
      startDate: new Date("2026-09-12T00:00:00.000Z"),
      specialty: { slug: "babysitters" },
      city: { slug: "sydney", state: { slug: "nsw" } },
    }),
    "/caregivers/babysitters/nsw/sydney?availableOn=2026-09-12&job=saturday-babysitter-bondi",
  );
  assert.equal(
    caregiverHref("sarah-nguyen-aged-care-sydney", {
      start: "2026-09-15",
      at: "08:00",
      job: "weekday-aged-care-marrickville",
    }),
    "/caregiver/sarah-nguyen-aged-care-sydney?start=2026-09-15&at=08:00&job=weekday-aged-care-marrickville",
  );
});

test("jobBookHref prefills the job start clock time", () => {
  assert.equal(
    jobBookHref("sarah-nguyen-aged-care-sydney", parseSydneyDateTimeLocal("2026-09-15T08:00")),
    "/caregiver/sarah-nguyen-aged-care-sydney/book?start=2026-09-15&at=08:00",
  );
  assert.equal(
    jobBookHref(
      "sarah-nguyen-aged-care-sydney",
      parseSydneyDateTimeLocal("2026-09-15T08:00"),
      "weekday-aged-care-marrickville",
    ),
    "/caregiver/sarah-nguyen-aged-care-sydney/book?start=2026-09-15&at=08:00&job=weekday-aged-care-marrickville",
  );
  assert.equal(jobMissLabel(null, "family"), "Fits this start");
  assert.equal(jobMissLabel("hours", "family"), "Outside their usual weekly hours");
});

test("canAttachJob only links an open request owned by the family", () => {
  assert.equal(isJobSlug("weekday-aged-care-marrickville"), true);
  assert.equal(isJobSlug("../evil"), false);
  assert.equal(canAttachJob({ familyId: "alex", status: "open" }, "alex"), true);
  assert.equal(canAttachJob({ familyId: "alex", status: "hired" }, "alex"), false);
  assert.equal(canAttachJob({ familyId: "alex", status: "open" }, "other"), false);
  assert.equal(canAttachJob(null, "alex"), false);
  assert.equal(
    canAttachJob(
      { familyId: "alex", status: "open", startDate: new Date("2026-09-06T09:00:00+10:00") },
      "alex",
      new Date("2026-09-08T00:00:00.000Z"),
    ),
    false,
  );
});

test("bookHref keeps a start clock when the family picks another free day", () => {
  assert.equal(
    bookHref("sarah-nguyen-aged-care-sydney", {
      start: "2026-09-16",
      at: "08:00",
      job: "weekday-aged-care-marrickville",
    }),
    "/caregiver/sarah-nguyen-aged-care-sydney/book?start=2026-09-16&at=08:00&job=weekday-aged-care-marrickville",
  );
});

test("bookHref keeps a safe job slug on error redirects", () => {
  assert.equal(
    bookHref("sarah-nguyen-aged-care-sydney", {
      start: "2026-09-15",
      at: "08:00",
      job: "weekday-aged-care-marrickville",
      error: "hours",
    }),
    "/caregiver/sarah-nguyen-aged-care-sydney/book?start=2026-09-15&at=08:00&job=weekday-aged-care-marrickville&error=hours",
  );
  assert.equal(
    bookHref("sarah-nguyen-aged-care-sydney", { job: "../evil", error: "overlap" }),
    "/caregiver/sarah-nguyen-aged-care-sydney/book?error=overlap",
  );
});

test("toJobMatchCarer and jobFitForCarer label a shortlist against Marrickville", () => {
  const marrickville = {
    cityId: "sydney",
    specialtyId: "aged-care",
    startDate: parseSydneyDateTimeLocal("2026-09-15T08:00"),
  };
  const priya = toJobMatchCarer({
    cityId: "sydney",
    specialties: [{ specialtyId: "nannies" }, { specialtyId: "babysitters" }],
    weeklyWindows: parseWeeklyHours("Mon–Fri 3pm–7pm · Sat mornings"),
  });
  const james = toJobMatchCarer({
    cityId: "sydney",
    specialties: [{ specialtyId: "disability-support" }],
    weeklyWindows: parseWeeklyHours("Wed–Sun 9am–5pm"),
    blockedDates: [],
  });
  assert.deepEqual(jobFitForCarer(marrickville, sarah, "family"), {
    fit: true,
    reason: null,
    label: "Fits this start",
  });
  assert.equal(jobFitForCarer(marrickville, priya, "family").label, "Not one of their specialties");
  assert.equal(jobFitForCarer(marrickville, james, "family").label, "Not one of their specialties");
  assert.deepEqual(
    sortByJobFit(
      [
        { name: "Priya", carer: priya },
        { name: "Sarah", carer: sarah },
        { name: "James", carer: james },
      ],
      marrickville,
      (row) => row.carer,
    ).map((row) => row.name),
    ["Sarah", "Priya", "James"],
  );
  assert.equal(
    shortlistCompareNotice("Weekday aged care for Mum in Marrickville", marrickville.startDate),
    "Comparing saved carers for Weekday aged care for Mum in Marrickville · starts 15 Sept 2026, 8:00 am. Book or invite from here — booking closes the request and attaches the sit.",
  );
  assert.equal(
    profileJobFitNotice(true, marrickville.startDate),
    "City, specialty and usual hours match 15 Sept 2026, 8:00 am.",
  );
  assert.equal(profileJobFitNotice(false, marrickville.startDate), "Checked against 15 Sept 2026, 8:00 am.");
});

test("attachJobNotice names the request on list, profile, shortlist and book", () => {
  assert.equal(
    attachJobNotice("Weekday aged care for Mum in Marrickville", "list"),
    "Booking from this list will close your Weekday aged care for Mum in Marrickville request and attach the sit to that job. Invite a carer to apply if you want a proposal first.",
  );
  assert.equal(
    attachJobNotice("Weekday aged care for Mum in Marrickville", "profile"),
    "Booking from this profile will close your Weekday aged care for Mum in Marrickville request and attach the sit to that job. Invite a carer to apply if you want a proposal first.",
  );
  assert.equal(
    attachJobNotice("Weekday aged care for Mum in Marrickville", "shortlist"),
    "Booking from your shortlist will close your Weekday aged care for Mum in Marrickville request and attach the sit to that job. Invite a carer to apply if you want a proposal first.",
  );
  assert.equal(
    attachJobNotice("Weekday aged care for Mum in Marrickville", "book"),
    "This booking will close your Weekday aged care for Mum in Marrickville request and attach the sit to that job.",
  );
  assert.equal(shortlistHref("weekday-aged-care-marrickville"), "/dashboard/shortlist?job=weekday-aged-care-marrickville");
  assert.equal(shortlistHref("../evil"), "/dashboard/shortlist");
  assert.equal(shortlistHref(), "/dashboard/shortlist");
});
