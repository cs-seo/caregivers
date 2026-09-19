export function companionCareQldNextNotice() {
  return "Companion carers in Queensland have their own list. Open Mount Isa locations, or open Port Hedland locations.";
}

export function companionCareQldNextShows(args: {
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
      args.stateSlug === "qld" &&
      !args.jobAttached,
  );
}

export function companionCareQldNextLinks() {
  return [
    { href: "/locations/qld/mount-isa", label: "Open Mount Isa locations" },
    { href: "/locations/wa/port-hedland", label: "Open Port Hedland locations" },
  ];
}
