export function personalCareQldNextNotice() {
  return "Personal care assistants in Queensland have their own list. Open Moree locations, or open Ararat locations.";
}

export function personalCareQldNextShows(args: {
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
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function personalCareQldNextLinks() {
  return [
    { href: "/locations/nsw/moree", label: "Open Moree locations" },
    { href: "/locations/vic/ararat", label: "Open Ararat locations" },
  ];
}
