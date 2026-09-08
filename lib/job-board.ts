import { isJobSlug } from "./job-match";
import { postJobHref } from "./job-post";

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

export type JobBoardEmptyContext = {
  filters: JobBoardFilters;
  specialtyName?: string;
  specialtyPlural?: string;
  cityName?: string;
  stateName?: string;
  stateSlug?: string;
};

export function jobBoardDirectoryHref(ctx: Pick<JobBoardEmptyContext, "filters" | "stateSlug">) {
  const specialty = ctx.filters.specialty;
  const state = ctx.filters.city ? ctx.stateSlug : ctx.filters.state || ctx.stateSlug;
  const city = ctx.filters.city;
  if (specialty && state && city) return `/caregivers/${specialty}/${state}/${city}`;
  if (specialty && state) return `/caregivers/${specialty}/${state}`;
  if (specialty) return `/caregivers/${specialty}`;
  return "/caregivers";
}

export function jobBoardEmptyLinks(ctx: JobBoardEmptyContext) {
  const { filters } = ctx;
  const spec = ctx.specialtyName?.toLowerCase();
  const who = ctx.specialtyPlural?.toLowerCase() ?? (spec ? `${spec} carers` : "verified carers");
  const stateSlug = filters.city ? ctx.stateSlug : filters.state || ctx.stateSlug;
  const links: { href: string; label: string }[] = [];

  if (filters.fit) {
    links.push({
      href: jobBoardHref({ ...filters, fit: false }),
      label: filters.city || filters.state || filters.specialty
        ? "Show every open job in this filter"
        : "Show every open job",
    });
  }
  if (filters.city && spec && stateSlug) {
    links.push({
      href: jobBoardHref({ specialty: filters.specialty, state: stateSlug, fit: filters.fit }),
      label: `Show ${spec} requests in ${ctx.stateName ?? "this state"}`,
    });
  }
  if (filters.city || filters.state) {
    links.push({
      href: jobBoardHref({ specialty: filters.specialty, fit: filters.fit }),
      label: spec ? `Show ${spec} requests Australia-wide` : "Show every open job Australia-wide",
    });
  } else if (filters.specialty && !filters.fit) {
    links.push({
      href: jobBoardHref({ fit: filters.fit }),
      label: "Show every open job",
    });
  }

  const directoryHref = jobBoardDirectoryHref(ctx);
  const directoryLabel =
    filters.city && ctx.cityName
      ? `Browse ${who} in ${ctx.cityName}`
      : filters.state && ctx.stateName
        ? `Browse ${who} in ${ctx.stateName}`
        : filters.specialty
          ? `Browse ${who}`
          : "Browse verified carers";
  links.push({ href: directoryHref, label: directoryLabel });
  links.push({
    href: postJobHref({ specialty: filters.specialty, city: filters.city }),
    label: "Post a care request",
  });
  return [...new Map(links.map((link) => [link.href, link])).values()];
}

export function locationBoardLink(place: { city?: string; cityName?: string; state?: string; stateName?: string }) {
  if (place.city && place.cityName) {
    return { href: jobBoardHref({ city: place.city }), label: jobBoardTitle(undefined, place.cityName) };
  }
  if (place.state && place.stateName) {
    return { href: jobBoardHref({ state: place.state }), label: jobBoardTitle(undefined, undefined, place.stateName) };
  }
  return { href: jobBoardHref(), label: jobBoardTitle() };
}

export function locationBoardNotice(placeName: string) {
  return `Families in ${placeName} also post care requests. Browse the board to send a proposal or hire into escrow.`;
}

export function guideBoardLink(specialty: { slug: string; name: string }) {
  return {
    href: jobBoardHref({ specialty: specialty.slug }),
    label: jobBoardTitle(specialty.name),
  };
}

export function guideBoardNotice(specialtyName: string) {
  return `Families also post ${specialtyName.toLowerCase()} requests. Browse the board to send a proposal or hire into escrow.`;
}
