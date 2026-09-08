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
    { href: "/post-a-job", label: "Post a new care request" },
    {
      href: expiredJobDirectoryHref(job),
      label: `Browse ${who} in ${job.city.name}`,
    },
  ];
}
