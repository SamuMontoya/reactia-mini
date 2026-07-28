'use client';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
 * Styled listbox, replacing the native <select> so the field can carry the
 * brand's type and spacing (a native select renders with OS chrome and ignores
 * almost all of it).
 *
 * Follows the ARIA listbox pattern rather than approximating it: the trigger is
 * a button with aria-haspopup/aria-expanded, the popup is role="listbox" with
 * role="option" children, active option is tracked with aria-activedescendant,
 * and full keyboard control (arrows, Home/End, Enter/Space, Escape, typeahead)
 * works without a mouse. A hidden input carries the value so the surrounding
 * <form> still serialises normally.
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
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Whether the popup opens upward, decided at open time (see openList).
  const [dropUp, setDropUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: '', timer: 0 });

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = useCallback(
    (refocus = true) => {
      setOpen(false);
      setActiveIndex(-1);
      if (refocus) triggerRef.current?.focus();
    },
    []
  );

  const openList = useCallback(
    (startAt?: number) => {
      // Decide the direction before opening, from an estimate of the popup's
      // height, so it never paints in the wrong place and never opens off the
      // bottom of the screen. Estimating (rather than measuring after mount)
      // keeps this synchronous — one option row is ~62px with a hint line, ~46
      // without, and the list is capped at max-h-72 (288px).
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (trigger) {
        const perOption = options.some((option) => option.hint) ? 62 : 46;
        const estimatedHeight = Math.min(288, options.length * perOption + 12);
        const spaceBelow = window.innerHeight - trigger.bottom - 12;
        const spaceAbove = trigger.top - 12;
        setDropUp(estimatedHeight > spaceBelow && spaceAbove > spaceBelow);
      }

      setActiveIndex(startAt ?? (selectedIndex >= 0 ? selectedIndex : 0));
      setOpen(true);
    },
    [selectedIndex, options]
  );

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      close();
    },
    [options, onChange, close]
  );

  // Close on any click that lands outside the whole control.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
        onBlur?.();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onBlur]);

  // Keep the active option scrolled into view while arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(`${baseId}-option-${activeIndex}`)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, baseId]);

  const moveTo = (index: number) => {
    const last = options.length - 1;
    setActiveIndex(index < 0 ? last : index > last ? 0 : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openList();
        else moveTo(activeIndex + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openList(options.length - 1);
        else moveTo(activeIndex - 1);
        return;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        return;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        if (open) commit(activeIndex);
        else openList();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close();
        }
        return;
      case 'Tab':
        if (open) close(false);
        return;
      default:
        break;
    }

    // Typeahead: printable single characters jump to the next matching option.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      window.clearTimeout(typeahead.current.timer);
      typeahead.current.query += event.key.toLowerCase();
      typeahead.current.timer = window.setTimeout(() => {
        typeahead.current.query = '';
      }, 600);

      const query = typeahead.current.query;
      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(query)
      );
      if (match >= 0) {
        if (!open) openList(match);
        else setActiveIndex(match);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        data-invalid={invalid || undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          // Only a blur that leaves the control counts — moving into the list must not.
          if (!rootRef.current?.contains(event.relatedTarget as Node)) onBlur?.();
        }}
        className={`ds-input flex items-center justify-between gap-3 text-left ${
          selected ? 'text-ink' : 'text-stone/75'
        }`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-stone transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`absolute z-30 max-h-72 w-full overflow-y-auto rounded-[var(--radius-field)] border border-dust bg-white p-1.5 shadow-[var(--shadow-lg)] ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={`flex cursor-pointer items-start gap-2.5 rounded-[7px] px-3 py-2.5 transition-colors ${
                  isActive ? 'bg-paper-warm' : ''
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
