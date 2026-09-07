export function defaultWeeklyHours(specialties: string[]) {
  if (specialties.includes("babysitters")) return "Thu–Sun 5pm–midnight";
  if (specialties.includes("after-school-care")) return "Mon–Fri 3pm–7pm";
  if (specialties.includes("nannies")) return "Mon–Fri 8am–6pm";
  if (specialties.includes("nursing") || specialties.includes("aged-care")) return "Mon–Fri 7am–1pm";
  if (specialties.includes("disability-support") || specialties.includes("special-needs")) {
    return "Wed–Sun 9am–5pm";
  }
  if (specialties.includes("respite")) return "Fri–Mon, overnight by arrangement";
  return "Mon–Fri 9am–5pm";
}

export function weeklyHourChips(weeklyHours?: string | null) {
  if (!weeklyHours) return [];
  return weeklyHours
    .split(/[·|]|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}
