export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(date);
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  }).format(date);
}

export function monthYear(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(date);
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function snippet(text: string, max = 90) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function lastActiveLabel(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const hours = (Date.now() - date.getTime()) / 36e5;
  if (hours < 12) return "Active today";
  if (hours < 48) return "Active yesterday";
  const days = Math.round(hours / 24);
  if (days < 14) return `Active ${days} days ago`;
  return `Last active ${formatDate(date)}`;
}

export function sydneyDateTimeLocal(daysFromNow: number, hour: number) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:00`;
}

export function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
