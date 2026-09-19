export function registerNextNotice() {
  return "You already have a family account. Open Bendigo locations, or browse after-school carers in Queensland.";
}

export function registerNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function registerNextLinks() {
  return [
    { href: "/locations/vic/bendigo", label: "Open Bendigo locations" },
    { href: "/caregivers/after-school-care/qld", label: "Browse after-school carers in Queensland" },
  ];
}
