import { jobBoardHref } from "./job-board";

export function boardNextNotice() {
  return "This board is for proposals into escrow. Open companion carers, or see open disability support jobs.";
}

export function boardNextShows(args: { isFamily: boolean; filtered: boolean }) {
  return Boolean(args.isFamily && !args.filtered);
}

export function boardNextLinks() {
  return [
    { href: "/caregivers/companion-care", label: "Open companion carers" },
    { href: jobBoardHref({ specialty: "disability-support" }), label: "See open disability support jobs" },
  ];
}
