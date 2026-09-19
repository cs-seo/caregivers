export function ipswichNextNotice() {
  return "Ipswich has suburb pages under Queensland. Open Kalgoorlie locations, or open Esperance locations.";
}

export function ipswichNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "ipswich");
}

export function ipswichNextLinks() {
  return [
    { href: "/locations/wa/kalgoorlie", label: "Open Kalgoorlie locations" },
    { href: "/locations/wa/esperance", label: "Open Esperance locations" },
  ];
}
