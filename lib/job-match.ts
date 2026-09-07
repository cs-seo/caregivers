import { formatDate, formatDateTime, sydneyDateKey } from "./format";
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

export function jobMissLabel(reason: JobMiss | null) {
  if (!reason) return "Fits your roster";
  return JOB_MISS[reason];
}

export function jobDirectoryFilters(job: {
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
  };
}

export function jobDirectoryHref(job: Parameters<typeof jobDirectoryFilters>[0]) {
  const filters = jobDirectoryFilters(job);
  const query = [`availableOn=${filters.availableOn}`];
  if (filters.availableAt) query.push(`availableAt=${filters.availableAt}`);
  return `/caregivers/${filters.specialty}/${filters.state}/${filters.city}?${query.join("&")}`;
}
