export function isHouseholdSavedFlash(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function householdSavedNotice() {
  return "Household saved. New Instant Book and request-to-book sits will pick up these handover defaults.";
}

export function householdSavedLinks() {
  return [
    { href: "/dashboard#coming-up", label: "Check upcoming sits" },
    { href: "/caregivers", label: "Browse verified carers" },
  ];
}
