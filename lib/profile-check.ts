export function profileCheckNextNotice() {
  return "A check on this profile expires soon. Open the roster calendar, or open after-school carers.";
}

export function profileCheckExpiringSoon(watch: { state: string }[]) {
  return watch.some((item) => item.state === "soon" || item.state === "expired");
}

export function profileCheckNextShows(args: { isFamily: boolean; expiringSoon: boolean }) {
  return Boolean(args.isFamily && args.expiringSoon);
}

export function profileCheckNextLinks() {
  return [
    { href: "/dashboard/calendar", label: "Open the roster calendar" },
    { href: "/caregivers/after-school-care", label: "Open after-school carers" },
  ];
}
