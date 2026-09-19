export function specialNeedsSaNextNotice() {
  return "Special-needs carers in South Australia have their own list. Open Shepparton locations, or open Hobart locations.";
}

export function specialNeedsSaNextShows(args: {
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
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function specialNeedsSaNextLinks() {
  return [
    { href: "/locations/vic/shepparton", label: "Open Shepparton locations" },
    { href: "/locations/tas/hobart", label: "Open Hobart locations" },
  ];
}
