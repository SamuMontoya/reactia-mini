'use client';
import type { Diagnostico } from '@/lib/schemas';
import {
  AREA_LABELS,
  describeAnswer,
  diagnosticoConfig,
} from '@/content/diagnostico-config';
import { Pencil, Sparkles } from '@/components/icons';

type ResumenPasoProps = {
  values: Partial<Diagnostico>;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
};

/**
 * Review screen — the last step before the diagnóstico is generated.
 *
 * Every answer is listed and every row is a button back into that one question.
 * Editing one answer must not disturb the others, which is why the wizard keeps
 * a single react-hook-form instance for the whole flow and this screen only
 * changes which step is on screen: nothing is re-initialised, so the other ten
 * answers are literally untouched.
 */
export default function ResumenPaso({
  values,
  onEdit,
  onSubmit,
  isSubmitting,
  submitError,
}: ResumenPasoProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="text-center">
        <p className="ds-eyebrow">Último paso</p>
        <h2 className="mt-4 font-display text-section font-bold text-ink">
          Revisa tus respuestas
        </h2>
        <p className="mt-3 text-lg text-stone">
          Toca cualquier respuesta si quieres cambiarla. Lo demás se queda como está.
        </p>
      </header>

      {/* A grid, not a stack. Twelve full-width rows meant scrolling past the
          "Generar" button to check anything; three columns fit all twelve
          answers in roughly one screen, which is the whole point of a review
          step. `auto-rows-fr` keeps every card in a row the same height so the
          grid stays a grid even when one answer runs long. */}
      <ol className="mt-8 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {diagnosticoConfig.map((question, index) => {
          const respuesta = describeAnswer(question, values);

          return (
            <li key={question.id} className="contents">
              {/* Staggered so twelve cards arrive as a sequence instead of all at
                  once. 35ms a card keeps the whole grid under half a second. */}
              <button
                type="button"
                onClick={() => onEdit(index)}
                style={{ animationDelay: `${index * 35}ms` }}
                className="ds-animate-up group flex h-full w-full flex-col rounded-[var(--radius-card)] border border-dust bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber hover:shadow-[var(--shadow-md)]"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="ds-label truncate">{AREA_LABELS[question.area]}</span>
                  <span
                    aria-hidden
                    className="flex shrink-0 items-center gap-1 text-xs text-stone/70 transition-colors group-hover:text-amber"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {index + 1}
                  </span>
                </span>

                <span className="mt-1.5 block font-display text-sm font-semibold leading-snug text-ink">
                  {question.titulo}
                </span>

                {/* Long free-text answers are clamped so one verbose reply can't
                    stretch its whole row; the full text is one click away. */}
                <span
                  className={`mt-auto block whitespace-pre-wrap pt-2 text-base ${
                    respuesta
                      ? 'line-clamp-4 text-ink'
                      : 'italic text-signal-low'
                  }`}
                >
                  {respuesta || 'Sin responder'}
                </span>

                <span className="sr-only">Editar esta respuesta</span>
              </button>
            </li>
          );
        })}
      </ol>

      {submitError && (
        <p
          role="alert"
          className="mt-6 rounded-[var(--radius-field)] border border-signal-low/30 bg-signal-low/5 p-4 text-base text-signal-low"
        >
          {submitError}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="ds-btn ds-btn-amber ds-btn-lg w-full sm:w-auto"
        >
          {isSubmitting ? (
            'Generando...'
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generar mi diagnóstico
            </>
          )}
        </button>
        <p className="text-sm text-stone">Tarda unos segundos. No cierres la página.</p>
      </div>
    </div>
  );
}
