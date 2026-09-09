export function nanniesSaNextNotice() {
  return "Nannies in South Australia have their own list. Open Goulburn locations, or open Wangaratta locations.";
}

export function nanniesSaNextShows(args: {
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
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function nanniesSaNextLinks() {
  return [
    { href: "/locations/nsw/goulburn", label: "Open Goulburn locations" },
    { href: "/locations/vic/wangaratta", label: "Open Wangaratta locations" },
  ];
}
