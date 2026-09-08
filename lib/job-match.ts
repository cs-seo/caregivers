import { formatDate, formatDateTime, sydneyDateKey } from "./format";
import { isJobAccepting } from "./job-status";
import { isDateClosed, isOpenAtMinutes, minutesToInput, sydneyMinutes, type WeeklyWindow } from "./weekly-windows";

export type JobMatchCarer = {
  cityId: string;
  specialtyIds: string[];
  windows: WeeklyWindow[];
  blockedKeys?: Iterable<string>;
};

export type JobMatchJob = {
  cityId: string;
  specialtyId: string;
  startDate: Date;
};

export const JOB_MISS = {
  city: "Different city",
  specialty: "Not one of your specialties",
  away: "You marked that day away",
  hours: "Outside your usual weekly hours",
} as const;

export type JobMiss = keyof typeof JOB_MISS;

export function isUtcDateOnly(value: Date) {
  return (
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0
  );
}

export function formatJobStart(value: Date) {
  return isUtcDateOnly(value) ? formatDate(value) : formatDateTime(value);
}

export function jobMissReason(job: JobMatchJob, carer: JobMatchCarer): JobMiss | null {
  if (job.cityId !== carer.cityId) return "city";
  if (carer.specialtyIds.length && !carer.specialtyIds.includes(job.specialtyId)) return "specialty";
  const dateKey = sydneyDateKey(job.startDate);
  const blocked = carer.blockedKeys instanceof Set ? carer.blockedKeys : new Set(carer.blockedKeys ?? []);
  if (blocked.has(dateKey)) return "away";
  if (isUtcDateOnly(job.startDate)) {
    if (isDateClosed(carer.windows, dateKey)) return "hours";
    return null;
  }
  if (!isOpenAtMinutes(carer.windows, dateKey, sydneyMinutes(job.startDate))) return "hours";
  return null;
}

export function jobFitsCarer(job: JobMatchJob, carer: JobMatchCarer) {
  return jobMissReason(job, carer) === null;
}

export function matchingJobs<T extends JobMatchJob>(jobs: T[], carer: JobMatchCarer) {
  return jobs.filter((job) => jobFitsCarer(job, carer));
}

export function jobMissLabel(reason: JobMiss | null, audience: "carer" | "family" = "carer") {
  if (!reason) return audience === "family" ? "Fits this start" : "Fits your roster";
  if (audience === "family") {
    if (reason === "specialty") return "Not one of their specialties";
    if (reason === "away") return "They marked that day away";
    if (reason === "hours") return "Outside their usual weekly hours";
  }
  return JOB_MISS[reason];
}

export function toJobMatchCarer(carer: {
  cityId: string;
  specialties: { specialtyId: string }[];
  weeklyWindows: WeeklyWindow[];
  blockedDates?: { dateKey: string }[];
}): JobMatchCarer {
  return {
    cityId: carer.cityId,
    specialtyIds: carer.specialties.map((item) => item.specialtyId),
    windows: carer.weeklyWindows,
    blockedKeys: carer.blockedDates?.map((row) => row.dateKey),
  };
}

export function jobFitForCarer(
  job: JobMatchJob,
  carer: JobMatchCarer,
  audience: "carer" | "family" = "family",
) {
  const reason = jobMissReason(job, carer);
  return { fit: reason === null, reason, label: jobMissLabel(reason, audience) };
}

export function sortByJobFit<T>(items: T[], job: JobMatchJob, toCarer: (item: T) => JobMatchCarer) {
  return [...items].sort((a, b) => Number(jobFitsCarer(job, toCarer(b))) - Number(jobFitsCarer(job, toCarer(a))));
}

export function shortlistCompareNotice(title: string, startDate: Date) {
  return `Comparing saved carers for ${title} · starts ${formatJobStart(startDate)}. Book or invite from here — booking closes the request and attaches the sit.`;
}

export function isJobSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length > 0 && value.length <= 80;
}

export function canAttachJob(
  job: { familyId: string; status: string; startDate?: Date | null } | null,
  familyId: string,
  now = new Date(),
) {
  return Boolean(job && job.familyId === familyId && isJobAccepting(job, now));
}

export type AttachJobSurface = "list" | "profile" | "book" | "shortlist";

export function attachJobPrefix(surface: AttachJobSurface) {
  if (surface === "book") return "This booking will close your";
  if (surface === "profile") return "Booking from this profile will close your";
  if (surface === "shortlist") return "Booking from your shortlist will close your";
  return "Booking from this list will close your";
}

export function shortlistHref(jobSlug?: string) {
  return jobSlug && isJobSlug(jobSlug) ? `/dashboard/shortlist?job=${jobSlug}` : "/dashboard/shortlist";
}

export function attachJobNotice(title: string, surface: AttachJobSurface) {
  const invite = surface === "book" ? "" : " Invite a carer to apply if you want a proposal first.";
  return `${attachJobPrefix(surface)} ${title} request and attach the sit to that job.${invite}`;
}

export function bookQuery(query: { start?: string; at?: string; job?: string; error?: string } = {}) {
  const parts: string[] = [];
  if (query.start && /^\d{4}-\d{2}-\d{2}$/.test(query.start)) parts.push(`start=${query.start}`);
  if (query.at && /^([01]\d|2[0-3]):([0-5]\d)$/.test(query.at)) parts.push(`at=${query.at}`);
  if (query.job && isJobSlug(query.job)) parts.push(`job=${query.job}`);
  if (query.error && /^[a-z]+$/.test(query.error)) parts.push(`error=${query.error}`);
  return parts.join("&");
}

export function bookHref(
  slug: string,
  query: { start?: string; at?: string; job?: string; error?: string } = {},
) {
  const qs = bookQuery(query);
  return qs ? `/caregiver/${slug}/book?${qs}` : `/caregiver/${slug}/book`;
}

export function caregiverHref(slug: string, query: { start?: string; at?: string; job?: string } = {}) {
  const qs = bookQuery(query);
  return qs ? `/caregiver/${slug}?${qs}` : `/caregiver/${slug}`;
}

export function jobBookHref(slug: string, startDate: Date, jobSlug?: string) {
  const dateKey = sydneyDateKey(startDate);
  const clock = isUtcDateOnly(startDate) ? undefined : minutesToInput(sydneyMinutes(startDate));
  return bookHref(slug, { start: dateKey, at: clock, job: jobSlug });
}

export function jobDirectoryFilters(job: {
  slug: string;
  startDate: Date;
  specialty: { slug: string };
  city: { slug: string; state: { slug: string } };
}) {
  return {
    specialty: job.specialty.slug,
    state: job.city.state.slug,
    city: job.city.slug,
    availableOn: sydneyDateKey(job.startDate),
    availableAt: isUtcDateOnly(job.startDate) ? undefined : minutesToInput(sydneyMinutes(job.startDate)),
    job: isJobSlug(job.slug) ? job.slug : undefined,
  };
}

export function jobDirectoryHref(job: Parameters<typeof jobDirectoryFilters>[0]) {
  const filters = jobDirectoryFilters(job);
  const query = [`availableOn=${filters.availableOn}`];
  if (filters.availableAt) query.push(`availableAt=${filters.availableAt}`);
  if (filters.job) query.push(`job=${filters.job}`);
  return `/caregivers/${filters.specialty}/${filters.state}/${filters.city}?${query.join("&")}`;
}
