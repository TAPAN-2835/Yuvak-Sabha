export function normalizeMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return null;
}

export function formatMobileDisplay(raw: string | null | undefined): string {
  const m = normalizeMobile(raw);
  if (!m) return "—";
  return `+91 ${m.slice(0, 5)} ${m.slice(5)}`;
}

export function telHref(raw: string | null | undefined): string | null {
  const m = normalizeMobile(raw);
  return m ? `tel:+91${m}` : null;
}

export function waHref(raw: string | null | undefined, message: string): string | null {
  const m = normalizeMobile(raw);
  if (!m) return null;
  return `https://wa.me/91${m}?text=${encodeURIComponent(message)}`;
}
