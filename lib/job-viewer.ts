import { jobBoardHref, jobBoardTitle } from "./job-board";
import { jobBrowseHref } from "./job-match";
import { postJobHref } from "./job-post";

export type JobViewerPlace = {
  startDate: Date;
  specialty: { slug: string; name: string; pluralName?: string };
  city: { slug: string; name: string; state: { slug: string } };
};

export function jobViewerFamilyHeading() {
  return "Need similar care?";
}

export function jobViewerFamilyNotice(who: string, cityName: string) {
  return `Need the same kind of sit? Browse ${who} in ${cityName} at this start, post your own request, or open the board.`;
}

export function jobViewerFamilyLinks(job: JobViewerPlace) {
  const who = (job.specialty.pluralName ?? `${job.specialty.name} carers`).toLowerCase();
  return [
    {
      href: jobBrowseHref(job),
      label: `Browse ${who} in ${job.city.name}`,
    },
    {
      href: postJobHref({ specialty: job.specialty.slug, city: job.city.slug }),
      label: "Post your own care request",
    },
    {
      href: jobBoardHref({ specialty: job.specialty.slug, city: job.city.slug }),
      label: jobBoardTitle(job.specialty.name, job.city.name),
    },
  ];
}
