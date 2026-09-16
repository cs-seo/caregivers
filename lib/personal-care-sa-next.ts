export function personalCareSaNextNotice() {
  return "Personal care assistants in South Australia have their own list. Open Warwick locations, or open Emerald locations.";
}

export function personalCareSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "personal-care" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function personalCareSaNextLinks() {
  return [
    { href: "/locations/qld/warwick", label: "Open Warwick locations" },
    { href: "/locations/qld/emerald", label: "Open Emerald locations" },
  ];
}
