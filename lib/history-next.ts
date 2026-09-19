import { BOOKING_STATUS } from "./constants";

export function historyNextNotice() {
  return "Released sits stay on this list. Open a paid sit, or print the financial-year statement.";
}

export function historyNextPlace(groups: { href: string; weeks: { status: string }[] }[]) {
  const paid = groups.find((group) => group.weeks.some((week) => week.status === BOOKING_STATUS.RELEASED));
  return paid?.href.startsWith("/dashboard/bookings/") ? { href: paid.href } : null;
}

export function historyNextLinks(place?: { href: string } | null) {
  const links = [];
  if (place?.href?.startsWith("/dashboard/bookings/")) {
    links.push({ href: place.href, label: "Open a paid sit" });
  }
  links.push({ href: "/dashboard/statement", label: "Open the financial-year statement" });
  return links;
}
