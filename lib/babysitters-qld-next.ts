export function babysittersQldNextNotice() {
  return "Babysitters in Queensland have their own list. Open Port Macquarie locations, or open Albury locations.";
}

export function babysittersQldNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "babysitters" &&
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function babysittersQldNextLinks() {
  return [
    { href: "/locations/nsw/port-macquarie", label: "Open Port Macquarie locations" },
    { href: "/locations/nsw/albury", label: "Open Albury locations" },
  ];
}
