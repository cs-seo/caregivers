import { sydneyDateKey } from "./format";
import { isDateClosed, type WeeklyWindow } from "./weekly-windows";

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

export function jobMissReason(job: JobMatchJob, carer: JobMatchCarer): JobMiss | null {
  if (job.cityId !== carer.cityId) return "city";
  if (carer.specialtyIds.length && !carer.specialtyIds.includes(job.specialtyId)) return "specialty";
  const dateKey = sydneyDateKey(job.startDate);
  const blocked = carer.blockedKeys instanceof Set ? carer.blockedKeys : new Set(carer.blockedKeys ?? []);
  if (blocked.has(dateKey)) return "away";
  if (isDateClosed(carer.windows, dateKey)) return "hours";
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
