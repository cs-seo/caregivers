export const DEMO_VISA_PAN = "4242424242424242";
export const DEMO_VISA_DISPLAY = "4242 4242 4242 4242";

export function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

export function sanitizeCardName(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function parseCardExpiry(raw: string) {
  const match = raw.trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const yearRaw = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  return { month, year };
}

export function isExpiryCurrentOrFuture(expiry: { month: number; year: number }, now = new Date()) {
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  if (expiry.year > nowYear) return true;
  if (expiry.year < nowYear) return false;
  return expiry.month >= nowMonth;
}

export function isValidCvc(raw: string) {
  return /^\d{3,4}$/.test(raw.trim());
}

export function readDemoCard(formData: FormData) {
  return {
    number: digitsOnly(String(formData.get("cardNumber") ?? "")),
    expiry: String(formData.get("cardExpiry") ?? ""),
    cvc: String(formData.get("cardCvc") ?? "").trim(),
    name: sanitizeCardName(String(formData.get("cardName") ?? "")),
  };
}

export function isAcceptedDemoCard(
  card: { number: string; expiry: string; cvc: string; name: string },
  now = new Date(),
) {
  if (card.number !== DEMO_VISA_PAN) return false;
  if (!sanitizeCardName(card.name)) return false;
  if (!isValidCvc(card.cvc)) return false;
  const expiry = parseCardExpiry(card.expiry);
  return Boolean(expiry && isExpiryCurrentOrFuture(expiry, now));
}
