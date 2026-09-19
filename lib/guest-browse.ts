export function guestBrowseNotice() {
  return "You can browse verified carers and local pages before you sign in.";
}

export function guestBrowseLinks() {
  return [
    { href: "/caregivers", label: "Browse verified carers" },
    { href: "/locations", label: "Explore cities and suburbs" },
  ];
}
