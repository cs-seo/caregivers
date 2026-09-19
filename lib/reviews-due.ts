export function reviewsDueNextNotice() {
  return "Reviews stay on the public profile after you publish. Need cover again? Browse verified carers.";
}

export function reviewsDueNextLinks(place?: { specialty: string; specialtyPlural: string }) {
  if (!place?.specialty) {
    return [{ href: "/caregivers", label: "Browse verified carers" }];
  }
  return [
    {
      href: `/caregivers/${place.specialty}`,
      label: `Browse ${place.specialtyPlural.toLowerCase()}`,
    },
    { href: "/dashboard", label: "Back to your dashboard" },
  ];
}
