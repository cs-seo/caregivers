export function disabilitySaNextNotice() {
  return "Disability support workers in South Australia have their own list. Open Northam locations, or open Collie locations.";
}

export function disabilitySaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "disability-support" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function disabilitySaNextLinks() {
  return [
    { href: "/locations/wa/northam", label: "Open Northam locations" },
    { href: "/locations/wa/collie", label: "Open Collie locations" },
  ];
}
