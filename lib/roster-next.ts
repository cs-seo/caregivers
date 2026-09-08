import { footerBoardLink } from "./footer-board";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function rosterNextNotice() {
  return "Need cover on a free day? Open that Needed-on list, or browse requests already on the board.";
}

export function rosterNextPlace(days: { key: string; booking?: unknown }[]) {
  const empty = days.find((day) => !day.booking && DATE_KEY.test(day.key));
  return empty ? { href: `/caregivers?availableOn=${empty.key}`, dateKey: empty.key } : null;
}

export function rosterNextLinks(place?: { href: string } | null) {
  const links = [];
  if (place?.href.startsWith("/caregivers?availableOn=")) {
    links.push({ href: place.href, label: "Find a carer on a free day" });
  }
  links.push(footerBoardLink());
  return links;
}
