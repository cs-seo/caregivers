export function isJobExpired(job: { status: string; startDate?: Date | null }, now = new Date()) {
  return job.status === "open" && Boolean(job.startDate) && job.startDate!.getTime() <= now.getTime();
}

export function isJobAccepting(job: { status: string; startDate?: Date | null }, now = new Date()) {
  if (job.status !== "open") return false;
  if (!job.startDate) return true;
  return job.startDate.getTime() > now.getTime();
}

export function acceptingJobWhere(now = new Date()) {
  return { status: "open" as const, startDate: { gt: now } };
}

export function requestListingStatus(job: { status: string; startDate?: Date | null }, now = new Date()) {
  return isJobExpired(job, now) ? "expired" : job.status;
}
