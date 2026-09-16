export function specialNeedsQldNextNotice() {
  return "Special-needs carers in Queensland have their own list. Open Bendigo locations, or open Wollongong locations.";
}

export function specialNeedsQldNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "special-needs" &&
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function specialNeedsQldNextLinks() {
  return [
    { href: "/locations/vic/bendigo", label: "Open Bendigo locations" },
    { href: "/locations/nsw/wollongong", label: "Open Wollongong locations" },
  ];
}
