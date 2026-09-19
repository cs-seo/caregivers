export function afterSchoolSaNextNotice() {
  return "After-school carers in South Australia have their own list. Open Ballina locations, or open Nelson Bay locations.";
}

export function afterSchoolSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "after-school-care" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function afterSchoolSaNextLinks() {
  return [
    { href: "/locations/nsw/ballina", label: "Open Ballina locations" },
    { href: "/locations/nsw/nelson-bay", label: "Open Nelson Bay locations" },
  ];
}
