/**
 * Input formatting helpers.
 *
 * All of these are pure so they can be unit-tested without a DOM — the live
 * masking in the form components is a thin wrapper over them.
 */

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/* ─────────────────────────── Colombian pesos ─────────────────────────── */

const COP_GROUPER = /\B(?=(\d{3})+(?!\d))/g;

/** 5000000 → "$5.000.000". Colombian convention: dot thousands, no cents. */
export const formatCOP = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return `$${Math.trunc(Math.abs(value)).toString().replace(COP_GROUPER, '.')}`;
};

/** Masks whatever the user has typed so far. "5000000" → "$5.000.000". */
export const formatCOPInput = (raw: string): string => {
  const digits = digitsOnly(raw).replace(/^0+(?=\d)/, '');
  if (!digits) return '';
  return `$${digits.replace(COP_GROUPER, '.')}`;
};

/** "$5.000.000" → 5000000. Empty or digitless input → null. */
export const parseCOP = (masked: string): number | null => {
  const digits = digitsOnly(masked);
  return digits ? Number(digits) : null;
};

/* ──────────────────────────── WhatsApp / phone ────────────────────────────
 * The field is fixed to Colombia (+57). The prefix is rendered as static text
 * beside the input rather than living inside it, so the mask can never fight
 * the caret over characters the user is not allowed to edit. The input holds
 * the 10 national digits only; the form submits E.164.
 * ------------------------------------------------------------------------ */

export const COLOMBIA_DIAL_CODE = '+57';

/** Strips a pasted +57 / 0057 / 57 prefix and caps at 10 national digits. */
export const nationalDigits = (raw: string): string => {
  let digits = digitsOnly(raw);
  if (digits.startsWith('0057')) digits = digits.slice(4);
  else if (digits.length > 10 && digits.startsWith('57')) digits = digits.slice(2);
  return digits.slice(0, 10);
};

/** "3001234567" → "300 123 4567" (groups of 3-3-4, as typed). */
export const formatPhoneInput = (raw: string): string => {
  const digits = nationalDigits(raw);
  if (!digits) return '';
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)];
  return parts.filter(Boolean).join(' ');
};

/** "300 123 4567" → "+573001234567". Incomplete input → ''. */
export const toE164Colombia = (raw: string): string => {
  const digits = nationalDigits(raw);
  return digits.length === 10 ? `+57${digits}` : '';
};

/** "+573001234567" → "+57 300 123 4567", for display back to the user. */
export const formatE164ForDisplay = (e164: string): string => {
  const formatted = formatPhoneInput(e164);
  return formatted ? `${COLOMBIA_DIAL_CODE} ${formatted}` : e164;
};

/* ──────────────────────────── Caret preservation ────────────────────────────
 * Re-formatting on every keystroke normally throws the caret to the end, which
 * is only invisible when the user types left-to-right. Counting the digits to
 * the right of the caret and restoring that same count keeps mid-string edits
 * (and backspace) behaving the way the user expects.
 * -------------------------------------------------------------------------- */

export const caretAfterFormat = (
  formatted: string,
  previousValue: string,
  previousCaret: number
): number => {
  const digitsAfterCaret = digitsOnly(previousValue.slice(previousCaret)).length;
  if (digitsAfterCaret === 0) return formatted.length;

  let seen = 0;
  for (let i = formatted.length - 1; i >= 0; i -= 1) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === digitsAfterCaret) return i;
    }
  }
  return 0;
};
