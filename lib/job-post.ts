import { isJobSlug } from "./job-match";

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
