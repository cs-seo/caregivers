import { jobBoardHref, jobBoardTitle } from "./job-board";

export function footerBoardLink() {
  return {
    href: jobBoardHref(),
    label: jobBoardTitle(),
  };
}
