'use client';
import { useEffect, useRef, useState } from 'react';
import {
  COLOMBIA_DIAL_CODE,
  caretAfterFormat,
  formatPhoneInput,
  nationalDigits,
  toE164Colombia,
} from '@/lib/format';

type PhoneInputProps = {
  id: string;
  /** E.164, e.g. "+573001234567". Empty while the number is incomplete. */
  value: string | undefined;
  onChange: (e164: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * WhatsApp field, fixed to Colombia. Types as "300 123 4567", submits
 * "+573001234567".
 *
 * The +57 lives outside the input as static text on purpose: a mask that owns
 * characters the user cannot delete is the single most common way phone inputs
 * end up unusable (backspace at position 4 deletes nothing, or the caret jumps).
 * Pasting a number that already carries +57 / 0057 still works — the prefix is
 * stripped on the way in.
 */
export default function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  invalid = false,
  describedBy,
}: PhoneInputProps) {
  const [text, setText] = useState(() => formatPhoneInput(value ?? ''));
  const textRef = useRef(text);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretTarget = useRef<number | null>(null);

  useEffect(() => {
    const incoming = nationalDigits(value ?? '');
    if (incoming !== nationalDigits(textRef.current)) {
      queueMicrotask(() => setText(formatPhoneInput(incoming)));
    }
    // Resync only on external value changes, not on our own keystrokes.
  }, [value]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (caretTarget.current === null || !inputRef.current) return;
    inputRef.current.setSelectionRange(caretTarget.current, caretTarget.current);
    caretTarget.current = null;
  }, [text]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    const formatted = formatPhoneInput(raw);

    caretTarget.current = caretAfterFormat(formatted, raw, caret);
    setText(formatted);
    onChange(toE164Colombia(formatted));
  };

  return (
    <div
      className={`ds-input flex items-center gap-2.5 focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(17,16,16,0.08)] ${
        invalid ? 'border-signal-low' : ''
      }`}
    >
      <span aria-hidden className="shrink-0 text-stone tabular-nums">
        {COLOMBIA_DIAL_CODE}
      </span>
      <span className="h-5 w-px shrink-0 bg-dust" aria-hidden />
      <input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={text}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="300 123 4567"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-stone/75"
      />
    </div>
  );
}
