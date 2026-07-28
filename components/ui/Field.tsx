import { Alert } from '@/components/icons';

type FieldProps = {
  /** Base id — the label gets `${id}-label`, the error `${id}-error`. */
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Set for controls labelled via aria-labelledby (the custom dropdown). */
  asGroup?: boolean;
  children: React.ReactNode;
};

/**
 * One label/hint/error shell for every field in the funnel, so spacing and
 * error placement can't drift between the two forms.
 */
export default function Field({
  id,
  label,
  hint,
  error,
  asGroup = false,
  children,
}: FieldProps) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  const heading = asGroup ? (
    <span id={labelId} className="block font-display text-base font-semibold text-ink">
      {label}
    </span>
  ) : (
    <label
      id={labelId}
      htmlFor={id}
      className="block font-display text-base font-semibold text-ink"
    >
      {label}
    </label>
  );

  return (
    // flex column with the control pushed to the bottom: inside a multi-column
    // grid the cells stretch to the tallest one, so `mt-auto` lands every input
    // on the same baseline even when one label wraps to two lines and its
    // neighbour doesn't. In a single-column form there is no slack to
    // distribute, so it behaves exactly as before.
    <div
      role={asGroup ? 'group' : undefined}
      aria-labelledby={asGroup ? labelId : undefined}
      className="flex flex-col"
    >
      {heading}
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-sm text-stone">
          {hint}
        </p>
      )}
      <div className="mt-auto pt-2">{children}</div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-signal-low"
        >
          <Alert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
