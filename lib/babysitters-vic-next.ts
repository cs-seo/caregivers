export function babysittersVicNextNotice() {
  return "Babysitters in Victoria have their own list. Open Grafton locations, or open Wodonga locations.";
}

export function babysittersVicNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "babysitters" &&
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function babysittersVicNextLinks() {
  return [
    { href: "/locations/nsw/grafton", label: "Open Grafton locations" },
    { href: "/locations/vic/wodonga", label: "Open Wodonga locations" },
  ];
}
