export function babysittersSaNextNotice() {
  return "Babysitters in South Australia have their own list. Open Parkes locations, or open Cowra locations.";
}

export function babysittersSaNextShows(args: {
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
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function babysittersSaNextLinks() {
  return [
    { href: "/locations/nsw/parkes", label: "Open Parkes locations" },
    { href: "/locations/nsw/cowra", label: "Open Cowra locations" },
  ];
}
