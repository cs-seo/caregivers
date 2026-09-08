import { footerBoardLink } from "./footer-board";

export function legalNextNotice() {
  return "These pages explain escrow and checks. Browse verified carers, or open care requests already on the board.";
}

export function legalNextLinks() {
  return [
    { href: "/caregivers", label: "Browse verified carers" },
    footerBoardLink(),
  ];
}
