export function geelongNextNotice() {
  return "Geelong has suburb pages under Victoria. Open special needs carers in Geelong, or open companion carers in Geelong.";
}

export function geelongNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "vic" && args.citySlug === "geelong");
}

export function geelongNextLinks() {
  return [
    { href: "/caregivers/special-needs/vic/geelong", label: "Browse special needs in Geelong" },
    { href: "/caregivers/companion-care/vic/geelong", label: "Browse companion carers in Geelong" },
  ];
}
