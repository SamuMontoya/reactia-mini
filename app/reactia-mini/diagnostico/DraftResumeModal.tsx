'use client';
import { createPortal } from 'react-dom';
import { Clock } from '@/components/icons';

type DraftResumeModalProps = {
  onContinuar: () => void;
  onEmpezarDeNuevo: () => void;
};

/**
 * Asks, rather than assumes, when a saved draft is found on load.
 *
 * The wizard used to silently reopen wherever the autosave last left it —
 * fine for someone who meant to come back, disorienting for someone who
 * reloaded by accident and now can't tell if what's on screen is their real
 * progress or something stale. Asking costs one tap and removes the doubt
 * either way.
 *
 * Rendered through a portal for the same reason Dropdown's sheet is: this
 * can open while the page is still inside `.ds-animate-up`'s entrance
 * animation, and any non-`none` `transform` on an ancestor — even one that's
 * visually a no-op — becomes the containing block for a `fixed` descendant,
 * clipping it to that ancestor's box instead of the viewport.
 */
export default function DraftResumeModal({
  onContinuar,
  onEmpezarDeNuevo,
}: DraftResumeModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-ink/40" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-resume-titulo"
        className="relative w-full max-w-sm rounded-[var(--radius-card)] border border-dust bg-white p-7 text-center shadow-[var(--shadow-lg)]"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber/12 text-amber">
          <Clock className="h-7 w-7" />
        </span>

        <h2
          id="draft-resume-titulo"
          className="mt-4 font-display text-xl font-bold text-ink"
        >
          Saliste sin querer
        </h2>

        <p className="mt-2 text-base text-stone">
          Tienes respuestas guardadas de una visita anterior. ¿Quieres seguir donde
          quedaste?
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinuar}
            className="ds-btn ds-btn-amber w-full"
          >
            Continuar donde quedé
          </button>
          <button
            type="button"
            onClick={onEmpezarDeNuevo}
            className="ds-btn ds-btn-outline w-full"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
