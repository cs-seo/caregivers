export function suburbNextNotice() {
  return "Suburb pages keep local carers on one list. Open someone already on your shortlist, or compare the same specialty across the city.";
}

export function directoryIsSuburbPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "caregivers" && parts.length === 5;
}

export function suburbNextShows(args: {
  isFamily: boolean;
  suburbPath: boolean;
  profileHref?: string | null;
  jobAttached?: boolean;
}) {
  return Boolean(args.isFamily && args.suburbPath && args.profileHref && !args.jobAttached);
}

export function suburbNextPlace(
  caregivers: { id: string; slug: string; user: { name: string } }[],
  savedIds: Iterable<string>,
) {
  const saved = new Set(savedIds);
  const match = caregivers.find((carer) => saved.has(carer.id));
  return match ? { href: `/caregiver/${match.slug}`, name: match.user.name } : null;
}

export function suburbNextCityHref(args: { specialty?: string; state?: string; city?: string }) {
  if (!args.specialty || !args.state || !args.city) return null;
  return `/caregivers/${args.specialty}/${args.state}/${args.city}`;
}

export function suburbNextLinks(args: { profileHref: string; profileName: string; cityHref: string }) {
  return [
    { href: args.profileHref, label: `Open ${args.profileName}’s profile` },
    { href: args.cityHref, label: "Compare this specialty across the city" },
  ];
}
