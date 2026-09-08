import { jobBoardHref } from "./job-board";
import { acceptingJobWhere } from "./job-status";

export const RELATED_JOB_LIMIT = 3;

export function relatedJobsTitle(cityName: string) {
  return `Other open requests in ${cityName}`;
}

export function relatedJobsNotice(cityName: string) {
  return `These sits are still accepting proposals in ${cityName}. Open one to apply, or browse the full board.`;
}

export function relatedJobsWhere(job: { id: string; cityId: string }, now = new Date()) {
  return {
    ...acceptingJobWhere(now),
    cityId: job.cityId,
    id: { not: job.id },
  };
}

export function relatedJobsBoardLink(city: { slug: string; name: string }) {
  return {
    href: jobBoardHref({ city: city.slug }),
    label: `Browse every open request in ${city.name}`,
  };
}
