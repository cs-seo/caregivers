export function perthNextNotice() {
  return "Perth has suburb pages under Western Australia. Open after-school carers in Perth, or open housekeepers in Perth.";
}

export function perthNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "wa" && args.citySlug === "perth");
}

export function perthNextLinks() {
  return [
    { href: "/caregivers/after-school-care/wa/perth", label: "Browse after-school carers in Perth" },
    { href: "/caregivers/housekeeping/wa/perth", label: "Browse housekeepers in Perth" },
  ];
}
