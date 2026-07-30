'use client';
import { Check } from '@/components/icons';

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

type OptionCardsProps = {
  name: string;
  options: readonly Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** Two columns once there are enough short options to justify it. */
  columns?: 1 | 2;
  labelId?: string;
  invalid?: boolean;
};

/**
 * Radio group rendered as full-width tappable cards.
 *
 * Native radio dots are ~16px of hit area; on a phone-first funnel the whole
 * card should be the target. The real <input type="radio"> is kept (visually
 * hidden, not display:none) so keyboard arrow-key group navigation, form
 * serialisation and screen-reader semantics all still come for free.
 */
export default function OptionCards({
  name,
  options,
  value,
  onChange,
  columns = 1,
  labelId,
  invalid = false,
}: OptionCardsProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={invalid || undefined}
      className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
    >
      {options.map((option, index) => {
        const checked = value === option.value;

        return (
          <label
            key={option.value}
            style={{ animationDelay: `${index * 45}ms` }}
            // Staggered on mount, same as the question block's own slide-in —
            // a little life in the one part of the wizard the reader spends
            // the most time looking at, without adding a second, competing
            // motion once the options are actually on screen.
            className={`ds-animate-up group flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border bg-white px-4 py-4 transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
              checked
                ? 'border-amber shadow-[var(--shadow-md)]'
                : 'border-dust hover:border-stone/60'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                checked ? 'border-amber bg-amber text-white' : 'border-dust'
              }`}
            >
              <Check className={`h-3.5 w-3.5 ${checked ? '' : 'invisible'}`} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-semibold text-ink">
                {option.label}
              </span>
              {option.hint && (
                <span className="block text-sm text-stone">{option.hint}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
