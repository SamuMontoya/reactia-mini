'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from '@/components/icons';

export type DropdownOption = {
  value: string;
  label: string;
  hint?: string;
};

type DropdownProps = {
  options: readonly DropdownOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Wired to the visible label via aria-labelledby. */
  labelId?: string;
  invalid?: boolean;
  describedBy?: string;
  name?: string;
};

/**
 * Button trigger + bottom sheet of option cards.
 *
 * Five earlier attempts at this looked broken on a real iPhone during
 * testing — a hand-rolled ARIA listbox, this same button+sheet pattern, a
 * <label>-driven checkbox/radio pair, a touchend-first button, and a
 * responsive select/button hybrid. All of them were red herrings: the actual
 * cause was that the page was being previewed from a non-`localhost` origin
 * (an ngrok tunnel, then a LAN IP), which Next.js dev blocks by default for
 * anything but its own HMR channel — and, separately, `crypto.randomUUID()`
 * (called on every render of the page this field lives on) only exists in a
 * secure context, so it threw on plain HTTP and crashed hydration before a
 * single event handler ever attached. Every native element still rendered
 * fine from the server HTML; nothing needing React ever worked, on any of
 * the five versions, which looked exactly like "custom buttons don't get
 * taps here" but never was. With `allowedDevOrigins` set and that crash
 * fixed, this is back to the version the brand actually wants.
 *
 * The sheet+backdrop render through a portal into `document.body`, not
 * inline where this component sits in the tree. Reason: any CSS-animated
 * ancestor (this form wraps its fields in `.ds-animate-up`) keeps a non-`none`
 * computed `transform` for as long as `animation-fill-mode` holds its end
 * keyframe applied — even when that keyframe is `transform: none`, browsers
 * still report a resolved identity matrix, not the literal keyword — and any
 * non-`none` transform makes that ancestor the containing block for
 * `position: fixed` descendants. Without the portal, the `fixed inset-0`
 * overlay was being sized against that ancestor's own box instead of the
 * viewport, which is why the backdrop only ever dimmed the form card instead
 * of the whole screen.
 */
export default function Dropdown({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Selecciona una opción',
  labelId,
  invalid = false,
  describedBy,
  name,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((option) => option.value === value);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    if (!next) onBlur?.();
  };

  useEffect(() => {
    if (!open) return;
    firstOptionRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpenState(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        data-invalid={invalid || undefined}
        onClick={() => setOpenState(true)}
        className={`ds-input flex items-center justify-between gap-3 text-left ${
          selected ? 'text-ink' : 'text-stone/75'
        }`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-stone" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Cerrar"
              tabIndex={-1}
              onClick={() => setOpenState(false)}
              className="absolute inset-0 cursor-default bg-ink/40"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelId}
              className="ds-animate-up relative max-h-[80vh] w-full overflow-y-auto rounded-t-[1.25rem] bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.15)] sm:max-w-md sm:rounded-[var(--radius-card)] sm:p-2 sm:shadow-[var(--shadow-lg)]"
            >
              {/* Grabber, the iOS action-sheet tell. Decorative only. */}
              <div className="mx-auto mb-1 mt-1.5 h-1.5 w-10 rounded-full bg-dust sm:hidden" />

              <p className="px-3 py-2 text-sm font-semibold text-stone">{placeholder}</p>

              <ul>
                {options.map((option, index) => {
                  const isSelected = option.value === value;

                  return (
                    <li key={option.value}>
                      <button
                        ref={index === 0 ? firstOptionRef : undefined}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(option.value);
                          setOpenState(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-[var(--radius-field)] px-3 py-3 text-left transition-colors ${
                          isSelected ? 'bg-amber/10' : 'active:bg-paper-warm'
                        }`}
                      >
                        <Check
                          className={`mt-1 h-4 w-4 shrink-0 text-amber ${
                            isSelected ? '' : 'invisible'
                          }`}
                        />
                        <span className="min-w-0">
                          <span className="block text-base text-ink">{option.label}</span>
                          {option.hint && (
                            <span className="block text-sm text-stone">{option.hint}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
