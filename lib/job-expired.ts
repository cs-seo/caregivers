import { postJobHref } from "./job-post";

export type ExpiredJobPlace = {
  specialty: { slug: string; name: string; pluralName?: string };
  city: { slug: string; name: string; state: { slug: string } };
};

export function expiredJobDirectoryHref(job: ExpiredJobPlace) {
  return `/caregivers/${job.specialty.slug}/${job.city.state.slug}/${job.city.slug}`;
}

export function expiredJobOwnerNotice() {
  return "This request has left the open board. Proposals, invites and hire are closed. Post a new request with a future start, or book a carer directly.";
}

export function expiredJobRecoveryLinks(job: ExpiredJobPlace) {
  const who = (job.specialty.pluralName ?? job.specialty.name).toLowerCase();
  return [
    { href: postJobHref({ specialty: job.specialty.slug, city: job.city.slug }), label: "Post a new care request" },
    {
      href: expiredJobDirectoryHref(job),
      label: `Browse ${who} in ${job.city.name}`,
    },
  ];
}
