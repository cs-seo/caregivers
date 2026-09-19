export function counterWaitNotice() {
  return "They have not replied to your suggested rate. Compare someone already on your shortlist, or browse this specialty in this city.";
}

export function counterWaitShowsNext(hasWaitingCounter: boolean) {
  return Boolean(hasWaitingCounter);
}

export function counterWaitLinks(args: {
  specialtySlug?: string | null;
  specialtyPlural?: string | null;
  citySlug?: string | null;
  cityName?: string | null;
  stateSlug?: string | null;
}) {
  const links = [{ href: "/dashboard/shortlist", label: "Open your shortlist" }];
  if (args.specialtySlug && args.citySlug && args.stateSlug) {
    const who = (args.specialtyPlural ?? "verified carers").toLowerCase();
    const city = args.cityName ?? "this city";
    links.push({
      href: `/caregivers/${args.specialtySlug}/${args.stateSlug}/${args.citySlug}`,
      label: `Browse ${who} in ${city}`,
    });
  }
  return links;
}
