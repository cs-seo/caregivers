export function privacyNextNotice() {
  return "This privacy page explains how CareProof stores booking details. Open Naracoorte locations, or open Berri locations.";
}

export function privacyNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function privacyNextLinks() {
  return [
    { href: "/locations/sa/naracoorte", label: "Open Naracoorte locations" },
    { href: "/locations/sa/berri", label: "Open Berri locations" },
  ];
}
