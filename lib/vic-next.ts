export function vicNextNotice() {
  return "Victoria has its own city hubs. Open Melbourne’s suburb list, or browse personal care carers in Victoria.";
}

export function vicNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "vic");
}

export function vicNextLinks() {
  return [
    { href: "/locations/vic/melbourne", label: "Open Melbourne suburbs" },
    { href: "/caregivers/personal-care/vic", label: "Browse personal care in Victoria" },
  ];
}
