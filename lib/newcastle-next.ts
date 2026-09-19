export function newcastleNextNotice() {
  return "Newcastle has suburb pages under New South Wales. Open aged care carers in Newcastle, or open nannies in Newcastle.";
}

export function newcastleNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "newcastle");
}

export function newcastleNextLinks() {
  return [
    { href: "/caregivers/aged-care/nsw/newcastle", label: "Browse aged care in Newcastle" },
    { href: "/caregivers/nannies/nsw/newcastle", label: "Browse nannies in Newcastle" },
  ];
}
