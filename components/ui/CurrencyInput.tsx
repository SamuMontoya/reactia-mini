'use client';
import { useEffect, useRef, useState } from 'react';
import { caretAfterFormat, formatCOP, formatCOPInput, parseCOP } from '@/lib/format';

type CurrencyInputProps = {
  id: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * Live-masked pesos field. Shows "$5.000.000" while the user types and hands the
 * form a plain number.
 *
 * The masked text is local state rather than derived on every render: deriving it
 * from `value` would rewrite the input mid-edit and fight the caret. It resyncs
 * from `value` only when the change came from outside (a wizard step restoring a
 * saved answer), detected by comparing digit counts.
 */
export default function CurrencyInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = '$5.000.000',
  invalid = false,
  describedBy,
}: CurrencyInputProps) {
  const [text, setText] = useState(() => formatCOP(value));
  const textRef = useRef(text);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretTarget = useRef<number | null>(null);

  useEffect(() => {
    const incoming = formatCOP(value);
    if (parseCOP(textRef.current) !== (value ?? null)) {
      queueMicrotask(() => setText(incoming));
    }
    // Only resync when the external value changes — see note above.
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
    const formatted = formatCOPInput(raw);

    caretTarget.current = caretAfterFormat(formatted, raw, caret);
    setText(formatted);
    onChange(parseCOP(formatted));
  };

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="ds-input tabular-nums"
    />
  );
}
