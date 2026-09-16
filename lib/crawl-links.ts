export function crawlStaticPaths() {
  return [
    "",
    "/caregivers",
    "/care-requests",
    "/how-it-works",
    "/for-carers",
    "/trust-and-safety",
    "/guides",
    "/locations",
    "/privacy",
    "/terms",
  ];
}

export function crawlFooterSpecialtyLinks(specialties: { slug: string; pluralName: string }[]) {
  return specialties.map((specialty) => ({
    href: `/caregivers/${specialty.slug}`,
    label: specialty.pluralName,
  }));
}

export function crawlFooterStateLinks(states: { slug: string; name: string }[]) {
  return states.map((state) => ({
    href: `/locations/${state.slug}`,
    label: state.name,
  }));
}

export function crawlSuburbSpecialtyLinks(
  specialties: { slug: string; pluralName: string }[],
  args: { stateSlug: string; citySlug: string; suburbSlug: string },
) {
  return specialties.map((specialty) => ({
    href: `/caregivers/${specialty.slug}/${args.stateSlug}/${args.citySlug}/${args.suburbSlug}`,
    label: specialty.pluralName,
  }));
}

export function crawlSpecialtyCityLinks(
  specialty: { slug: string; pluralName: string },
  states: { slug: string; cities: { slug: string; name: string }[] }[],
) {
  return states.flatMap((state) =>
    state.cities.map((city) => ({
      href: `/caregivers/${specialty.slug}/${state.slug}/${city.slug}`,
      label: `${specialty.pluralName} in ${city.name}`,
    })),
  );
}
