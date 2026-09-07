import { BOOKING_STATUS } from "./constants";

export function isPendingAcceptance(status: string) {
  return status === BOOKING_STATUS.PENDING_ACCEPTANCE;
}

export function pendingAcceptanceCount(weeks: { status: string }[]) {
  return weeks.filter((week) => isPendingAcceptance(week.status)).length;
}

export function familyPendingAcceptanceNotice(args: {
  carerName: string;
  pendingWeeks: number;
  seriesTotal?: number;
}) {
  if (args.pendingWeeks <= 0) return null;
  const series = Boolean(args.seriesTotal && args.seriesTotal > 1);
  if (series && args.pendingWeeks === args.seriesTotal) {
    return `${args.carerName} still needs to accept this ${args.seriesTotal}-week request-to-book series. You pay into escrow after they accept — not before.`;
  }
  if (series) {
    return `${args.carerName} still needs to accept ${args.pendingWeeks} ${
      args.pendingWeeks === 1 ? "week" : "weeks"
    } of this series. You pay into escrow after they accept — not before.`;
  }
  return `${args.carerName} still needs to accept this request-to-book sit. You pay into escrow after they accept — not before.`;
}

export function familyPendingAcceptanceBanner(items: { carerName: string; pendingWeeks: number }[]) {
  if (!items.length) return null;
  if (items.length === 1) {
    const { carerName, pendingWeeks } = items[0];
    return pendingWeeks > 1
      ? `${carerName} still needs to accept ${pendingWeeks} weeks.`
      : `${carerName} still needs to accept this sit.`;
  }
  return `${items.length} request-to-book sits are waiting for a carer to accept.`;
}

export function familyPendingAcceptanceHint(pendingWeeks: number) {
  if (pendingWeeks <= 0) return null;
  return pendingWeeks > 1
    ? "You cannot pay until the carer accepts. Cancel unpaid weeks if you need to withdraw."
    : "You cannot pay until the carer accepts. Cancel if you need to withdraw.";
}

export function carerPendingAcceptanceNotice(args: {
  familyName: string;
  pendingWeeks: number;
  seriesTotal?: number;
}) {
  if (args.pendingWeeks <= 0) return null;
  const series = Boolean(args.seriesTotal && args.seriesTotal > 1);
  if (series && args.pendingWeeks === args.seriesTotal) {
    return `${args.familyName} is waiting for you to accept this ${args.seriesTotal}-week request-to-book series. Accept so they can pay into escrow, or decline if you cannot do it.`;
  }
  if (series) {
    return `${args.familyName} is waiting for you to accept ${args.pendingWeeks} ${
      args.pendingWeeks === 1 ? "week" : "weeks"
    } of this series. Accept so they can pay into escrow, or decline if you cannot do it.`;
  }
  return `${args.familyName} is waiting for you to accept this request-to-book sit. Accept so they can pay into escrow, or decline if you cannot do it.`;
}

export function carerPendingAcceptanceBanner(items: { familyName: string; pendingWeeks: number }[]) {
  if (!items.length) return null;
  if (items.length === 1) {
    const { familyName, pendingWeeks } = items[0];
    return pendingWeeks > 1
      ? `${familyName} is waiting for you to accept ${pendingWeeks} weeks.`
      : `${familyName} is waiting for you to accept this sit.`;
  }
  return `${items.length} families are waiting for you to accept a request-to-book sit.`;
}

export function carerPendingAcceptanceHint(pendingWeeks: number) {
  if (pendingWeeks <= 0) return null;
  return pendingWeeks > 1
    ? "Accept every week so the family can pay into escrow, or decline the series if you cannot do it."
    : "Accept so the family can pay into escrow, or decline if you cannot do it.";
}
