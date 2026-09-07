export const REVIEW_REPLY_LIMIT = 500;

export function sanitizeReviewReply(raw: string) {
  return raw.trim().slice(0, REVIEW_REPLY_LIMIT);
}

export function hasReviewReply(review?: { reply?: string | null } | null) {
  return Boolean(review?.reply?.trim());
}

export function canReplyToReview(
  review: { reply?: string | null; caregiverId: string } | null | undefined,
  caregiverId?: string | null,
) {
  return Boolean(caregiverId && review && review.caregiverId === caregiverId && !hasReviewReply(review));
}

export function isSafeReviewReturnPath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.includes("://") || path.includes("//") || path.includes("\\")) return false;
  if (path.length > 240) return false;
  return path.startsWith("/dashboard/bookings/") || path.startsWith("/caregiver/");
}
