export function nanniesVicNextNotice() {
  return "Nannies in Victoria have their own list. Open Broken Hill locations, or open Queanbeyan locations.";
}

export function nanniesVicNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "nannies" &&
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function nanniesVicNextLinks() {
  return [
    { href: "/locations/nsw/broken-hill", label: "Open Broken Hill locations" },
    { href: "/locations/nsw/queanbeyan", label: "Open Queanbeyan locations" },
  ];
}
