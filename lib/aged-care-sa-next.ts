export function agedCareSaNextNotice() {
  return "Aged care carers in South Australia have their own list. Open Barossa locations, or open Southern Highlands locations.";
}

export function agedCareSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "aged-care" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function agedCareSaNextLinks() {
  return [
    { href: "/locations/sa/barossa", label: "Open Barossa locations" },
    { href: "/locations/nsw/southern-highlands", label: "Open Southern Highlands locations" },
  ];
}
