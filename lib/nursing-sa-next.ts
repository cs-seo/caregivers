export function nursingSaNextNotice() {
  return "Nurses in South Australia have their own list. Open Lithgow locations, or open Warragul locations.";
}

export function nursingSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "nursing" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function nursingSaNextLinks() {
  return [
    { href: "/locations/nsw/lithgow", label: "Open Lithgow locations" },
    { href: "/locations/vic/warragul", label: "Open Warragul locations" },
  ];
}
