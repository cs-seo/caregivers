export function housekeepingQldNextNotice() {
  return "Housekeepers in Queensland have their own list. Open Echuca locations, or open Hamilton locations.";
}

export function housekeepingQldNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "housekeeping" &&
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function housekeepingQldNextLinks() {
  return [
    { href: "/locations/vic/echuca", label: "Open Echuca locations" },
    { href: "/locations/vic/hamilton", label: "Open Hamilton locations" },
  ];
}
