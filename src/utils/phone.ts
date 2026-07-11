export function normalizeIndianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/[\s\-()+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  digits = digits.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits.length >= 10 ? digits : null;
}

/** Display format: 10-digit local part */
export function normalizeMobileDisplay(raw: string | null | undefined): string | null {
  const full = normalizeIndianPhone(raw);
  if (!full) return null;
  if (full.length === 12 && full.startsWith("91")) return full.slice(2);
  if (full.length === 10) return full;
  return null;
}

export function formatMobileDisplay(raw: string | null | undefined): string {
  const m = normalizeMobileDisplay(raw);
  if (!m) return "—";
  return `+91 ${m.slice(0, 5)} ${m.slice(5)}`;
}

export function telHref(raw: string | null | undefined): string | null {
  const full = normalizeIndianPhone(raw);
  return full ? `tel:+${full}` : null;
}

export function waHref(raw: string | null | undefined, message: string): string | null {
  const full = normalizeIndianPhone(raw);
  if (!full) return null;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
