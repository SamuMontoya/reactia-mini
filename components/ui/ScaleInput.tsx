'use client';

type ScaleInputProps = {
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel: string;
  highLabel: string;
  labelId?: string;
};

/**
 * 1-5 rating, as discrete buttons rather than a range slider.
 *
 * A slider has no honest empty state — it renders at its midpoint whether or not
 * the user has answered, so "no answer" and "3" look identical, and the value
 * silently reappears as 3 when a wizard step remounts. Buttons make the
 * unanswered state visible and are far easier to hit on a phone.
 */
export default function ScaleInput({
  name,
  value,
  onChange,
  min = 1,
  max = 5,
  lowLabel,
  highLabel,
  labelId,
}: ScaleInputProps) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelId} className="flex gap-2">
        {steps.map((step) => {
          const checked = value === step;

          return (
            <label
              key={step}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-card)] border py-5 font-display text-2xl font-bold transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                checked
                  ? 'border-amber bg-amber text-white shadow-[var(--shadow-md)]'
                  : 'border-dust bg-white text-stone hover:border-stone/60 hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={step}
                checked={checked}
                onChange={() => onChange(step)}
                className="sr-only"
              />
              {step}
            </label>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-sm text-stone">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
