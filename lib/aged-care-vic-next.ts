export function agedCareVicNextNotice() {
  return "Aged care carers in Victoria have their own list. Open Griffith locations, or open Taree locations.";
}

export function agedCareVicNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "aged-care" &&
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function agedCareVicNextLinks() {
  return [
    { href: "/locations/nsw/griffith", label: "Open Griffith locations" },
    { href: "/locations/nsw/taree", label: "Open Taree locations" },
  ];
}
