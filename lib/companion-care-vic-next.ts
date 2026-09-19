export function companionCareVicNextNotice() {
  return "Companion carers in Victoria have their own list. Open Nowra locations, or open Mandurah locations.";
}

export function companionCareVicNextShows(args: {
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
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function companionCareVicNextLinks() {
  return [
    { href: "/locations/nsw/nowra", label: "Open Nowra locations" },
    { href: "/locations/wa/mandurah", label: "Open Mandurah locations" },
  ];
}
