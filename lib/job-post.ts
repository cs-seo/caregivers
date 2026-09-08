import { isJobSlug } from "./job-match";
import { acceptingJobWhere } from "./job-status";

export const SIMILAR_JOB_LIMIT = 3;

export function postedJobNotice() {
  return "Request posted. Book or invite a carer who is free at this start. Proposal alerts will show when someone replies.";
}

export function isPostedFlash(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function postedJobHref(slug: string) {
  return `/care-requests/${slug}?posted=1`;
}

export function parsePostJobPrefill(params: { specialty?: string | string[]; city?: string | string[] }) {
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const specialty = one(params.specialty);
  const city = one(params.city);
  return {
    specialty: specialty && isJobSlug(specialty) ? specialty : undefined,
    city: city && isJobSlug(city) ? city : undefined,
  };
}

export function postJobHref(filters: { specialty?: string; city?: string } = {}) {
  const parts: string[] = [];
  if (filters.specialty) parts.push(`specialty=${filters.specialty}`);
  if (filters.city) parts.push(`city=${filters.city}`);
  return parts.length ? `/post-a-job?${parts.join("&")}` : "/post-a-job";
}

export function similarJobsWhere(place: { cityId: string; specialtyId: string }, now = new Date()) {
  return {
    ...acceptingJobWhere(now),
    cityId: place.cityId,
    specialtyId: place.specialtyId,
  };
}

export function similarJobsTitle(specialtyName: string, cityName: string) {
  return `Open ${specialtyName.toLowerCase()} requests in ${cityName}`;
}

export function similarJobsNotice(args: {
  count: number;
  ownCount: number;
  specialtyName: string;
  cityName: string;
}) {
  const spec = args.specialtyName.toLowerCase();
  if (args.count === 0) {
    return `No open ${spec} requests in ${args.cityName} yet. Yours would be the first on the board.`;
  }
  if (args.ownCount > 0) {
    return args.ownCount === 1
      ? `You already have an open ${spec} request in ${args.cityName}. Open it instead of posting a duplicate, or post if you still need another sit.`
      : `You already have ${args.ownCount} open ${spec} requests in ${args.cityName}. Open one instead of posting a duplicate, or post if you still need another sit.`;
  }
  return args.count === 1
    ? `One ${spec} request is already accepting proposals in ${args.cityName}. Open it if it covers this sit, or post if you still need another.`
    : `${args.count} ${spec} requests are already accepting proposals in ${args.cityName}. Open one if it covers this sit, or post if you still need another.`;
}
