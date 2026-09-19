export function disabilityQldNextNotice() {
  return "Disability support workers in Queensland have their own list. Open Gawler locations, or open Palmerston locations.";
}

export function disabilityQldNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "disability-support" &&
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function disabilityQldNextLinks() {
  return [
    { href: "/locations/sa/gawler", label: "Open Gawler locations" },
    { href: "/locations/nt/palmerston", label: "Open Palmerston locations" },
  ];
}
