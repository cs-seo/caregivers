import { isJobSlug } from "./job-match";

export type JobBoardFilters = {
  city?: string;
  specialty?: string;
  fit?: boolean;
};

export function parseJobBoardFilters(params: {
  city?: string | string[];
  specialty?: string | string[];
  fit?: string | string[];
}): JobBoardFilters {
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const city = one(params.city);
  const specialty = one(params.specialty);
  return {
    city: city && isJobSlug(city) ? city : undefined,
    specialty: specialty && isJobSlug(specialty) ? specialty : undefined,
    fit: one(params.fit) === "1",
  };
}

export function jobBoardQuery(filters: JobBoardFilters = {}) {
  const parts: string[] = [];
  if (filters.specialty) parts.push(`specialty=${filters.specialty}`);
  if (filters.city) parts.push(`city=${filters.city}`);
  if (filters.fit) parts.push("fit=1");
  return parts.join("&");
}

export function jobBoardHref(filters: JobBoardFilters = {}) {
  const qs = jobBoardQuery(filters);
  return qs ? `/care-requests?${qs}` : "/care-requests";
}

export function jobBoardTitle(specialtyName?: string, cityName?: string) {
  if (specialtyName && cityName) return `Open ${specialtyName.toLowerCase()} requests in ${cityName}`;
  if (specialtyName) return `Open ${specialtyName.toLowerCase()} requests`;
  if (cityName) return `Open care requests in ${cityName}`;
  return "Open care requests";
}

export function openRequestsNotice(count: number, cityName: string, specialtyName: string) {
  const noun = count === 1 ? "open care request" : "open care requests";
  return `${count} ${noun} in ${cityName} for ${specialtyName.toLowerCase()}`;
}
