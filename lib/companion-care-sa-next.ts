export function companionCareSaNextNotice() {
  return "Companion carers in South Australia have their own list. Open Launceston locations, or open Mount Gambier locations.";
}

export function companionCareSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "companion-care" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function companionCareSaNextLinks() {
  return [
    { href: "/locations/tas/launceston", label: "Open Launceston locations" },
    { href: "/locations/sa/mount-gambier", label: "Open Mount Gambier locations" },
  ];
}
