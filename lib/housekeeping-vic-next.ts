export function housekeepingVicNextNotice() {
  return "Housekeepers in Victoria have their own list. Open Derby locations, or open New Norfolk locations.";
}

export function housekeepingVicNextShows(args: {
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
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function housekeepingVicNextLinks() {
  return [
    { href: "/locations/wa/derby", label: "Open Derby locations" },
    { href: "/locations/tas/new-norfolk", label: "Open New Norfolk locations" },
  ];
}
