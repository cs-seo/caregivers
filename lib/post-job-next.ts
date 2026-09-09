import { footerBoardLink } from "./footer-board";

export function postJobShowsNext(prefill: { specialty?: string; city?: string }) {
  return !prefill.specialty || !prefill.city;
}

export function postJobNextNotice() {
  return "Already have someone in mind? Open your shortlist, or browse requests already on the board.";
}

export function postJobNextLinks() {
  return [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    footerBoardLink(),
  ];
}
