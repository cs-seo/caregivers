export function nursingVicNextNotice() {
  return "Nurses in Victoria have their own list. Open Sunshine Coast locations, or open Adelaide locations.";
}

export function nursingVicNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "nursing" &&
      args.stateSlug === "vic" &&
      !args.jobAttached,
  );
}

export function nursingVicNextLinks() {
  return [
    { href: "/locations/qld/sunshine-coast", label: "Open Sunshine Coast locations" },
    { href: "/locations/sa/adelaide", label: "Open Adelaide locations" },
  ];
}
