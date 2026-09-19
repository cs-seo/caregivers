export function loginNextNotice() {
  return "You are already signed in as a family. Open Logan locations, or open Moreton Bay locations.";
}

export function loginNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function loginNextLinks() {
  return [
    { href: "/locations/qld/logan", label: "Open Logan locations" },
    { href: "/locations/qld/moreton-bay", label: "Open Moreton Bay locations" },
  ];
}
