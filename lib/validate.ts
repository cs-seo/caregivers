// Lightweight input validation helpers. Prisma already parameterises queries,
// so these exist to reject obviously malformed / oversized input early and to
// keep enum handling consistent, not as the only line of defence.

// Prisma cuid()/cuid2 ids are lowercase alphanumeric. We accept a slightly
// broader safe charset (also covers uuids and nanoid-style ids) so we never
// reject a legitimate id, while rejecting path traversal, whitespace, oversized
// blobs and injection-looking payloads.
const RECORD_ID = /^[A-Za-z0-9_-]{6,64}$/;

export function isRecordId(value: unknown): value is string {
  return typeof value === "string" && RECORD_ID.test(value);
}

/** Returns the id if it is well-formed, otherwise null. */
export function recordId(value: unknown): string | null {
  return isRecordId(value) ? value : null;
}

/**
 * Trims and caps a free-text field. Returns null when empty. Used to bound
 * payload sizes on mutations so a caller cannot send a multi-megabyte string.
 */
export function boundedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/** Validates that a value is one of an allowed set of enum strings. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}
