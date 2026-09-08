import { isJobSlug } from "./job-match";

export type JobBoardFilters = {
  city?: string;
  state?: string;
  specialty?: string;
  fit?: boolean;
};

export function parseJobBoardFilters(params: {
  city?: string | string[];
  state?: string | string[];
  specialty?: string | string[];
  fit?: string | string[];
}): JobBoardFilters {
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const city = one(params.city);
  const state = one(params.state);
  const specialty = one(params.specialty);
  return {
    city: city && isJobSlug(city) ? city : undefined,
    state: state && isJobSlug(state) ? state : undefined,
    specialty: specialty && isJobSlug(specialty) ? specialty : undefined,
    fit: one(params.fit) === "1",
  };
}

export function jobBoardQuery(filters: JobBoardFilters = {}) {
  const parts: string[] = [];
  if (filters.specialty) parts.push(`specialty=${filters.specialty}`);
  if (filters.state && !filters.city) parts.push(`state=${filters.state}`);
  if (filters.city) parts.push(`city=${filters.city}`);
  if (filters.fit) parts.push("fit=1");
  return parts.join("&");
}

export function jobBoardHref(filters: JobBoardFilters = {}) {
  const qs = jobBoardQuery(filters);
  return qs ? `/care-requests?${qs}` : "/care-requests";
}

export function jobBoardTitle(specialtyName?: string, cityName?: string, stateName?: string) {
  if (specialtyName && cityName) return `Open ${specialtyName.toLowerCase()} requests in ${cityName}`;
  if (specialtyName && stateName) return `Open ${specialtyName.toLowerCase()} requests in ${stateName}`;
  if (specialtyName) return `Open ${specialtyName.toLowerCase()} requests`;
  if (cityName) return `Open care requests in ${cityName}`;
  if (stateName) return `Open care requests in ${stateName}`;
  return "Open care requests";
}

export function openRequestsNotice(count: number, placeName: string, specialtyName: string) {
  const noun = count === 1 ? "open care request" : "open care requests";
  const specialty = specialtyName.toLowerCase();
  if (!placeName) return `${count} ${noun} for ${specialty}`;
  return `${count} ${noun} in ${placeName} for ${specialty}`;
}
