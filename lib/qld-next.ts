export function qldNextNotice() {
  return "Queensland has its own city hubs. Open Brisbane’s suburb list, or browse nurses in Queensland.";
}

export function qldNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld");
}

export function qldNextLinks() {
  return [
    { href: "/locations/qld/brisbane", label: "Open Brisbane suburbs" },
    { href: "/caregivers/nursing/qld", label: "Browse nurses in Queensland" },
  ];
}
