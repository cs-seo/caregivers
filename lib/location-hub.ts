export function locationSpecialtyNotice() {
  return "Jump straight into a care type Australia-wide, then narrow by state or suburb.";
}

export function locationSpecialtyTitle() {
  return "Browse by care type";
}

export function locationSpecialtyLinks(specialties: { slug: string; pluralName: string }[]) {
  return specialties.map((spec) => ({
    href: `/caregivers/${spec.slug}`,
    label: spec.pluralName,
  }));
}
