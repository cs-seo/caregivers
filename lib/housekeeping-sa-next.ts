export function directoryIsStateSpecialtyPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts[0] === "caregivers" && parts.length === 3;
}

export function housekeepingSaNextNotice() {
  return "Housekeepers in South Australia have their own list. Open Port Lincoln locations, or open Victor Harbor locations.";
}

export function housekeepingSaNextShows(args: {
  isFamily: boolean;
  specialtySlug?: string;
  stateSlug?: string;
  stateSpecialtyPath: boolean;
  jobAttached?: boolean;
}) {
  return Boolean(
    args.isFamily &&
      args.stateSpecialtyPath &&
      args.specialtySlug === "housekeeping" &&
      args.stateSlug === "sa" &&
      !args.jobAttached,
  );
}

export function housekeepingSaNextLinks() {
  return [
    { href: "/locations/sa/port-lincoln", label: "Open Port Lincoln locations" },
    { href: "/locations/sa/victor-harbor", label: "Open Victor Harbor locations" },
  ];
}
