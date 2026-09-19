import { sanitizePhotoUrl } from "./photos";

export function photosNextNotice() {
  return "This profile already has a portrait. Open the in-home aged care guide, or open Tasmania locations.";
}

export function photosNextHasPhoto(photoUrl: string | null | undefined) {
  return Boolean(sanitizePhotoUrl(photoUrl ?? ""));
}

export function photosNextShows(args: { isFamily: boolean; hasPhoto: boolean; expiringSoon: boolean }) {
  return Boolean(args.isFamily && args.hasPhoto && !args.expiringSoon);
}

export function photosNextLinks() {
  return [
    { href: "/guides/in-home-aged-care", label: "Open the in-home aged care guide" },
    { href: "/locations/tas", label: "Open Tasmania locations" },
  ];
}
