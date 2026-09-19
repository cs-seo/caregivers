export function nanniesQldNextNotice() {
  return "Nannies in Queensland have their own list. Open Katoomba locations, or open Devonport locations.";
}

export function nanniesQldNextShows(args: {
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
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function nanniesQldNextLinks() {
  return [
    { href: "/locations/nsw/katoomba", label: "Open Katoomba locations" },
    { href: "/locations/tas/devonport", label: "Open Devonport locations" },
  ];
}
