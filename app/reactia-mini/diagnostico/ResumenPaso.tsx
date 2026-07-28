'use client';
import type { Diagnostico } from '@/lib/schemas';
import {
  AREA_LABELS,
  describeAnswer,
  diagnosticoConfig,
} from '@/content/diagnostico-config';
import { ArrowRight, Pencil } from '@/components/icons';

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
    <div className="mx-auto w-full max-w-3xl">
      <header className="text-center">
        <p className="ds-eyebrow">Último paso</p>
        <h2 className="mt-4 font-display text-section font-bold text-ink">
          Revisa tus respuestas
        </h2>
        <p className="mt-3 text-lg text-stone">
          Toca cualquier respuesta si quieres cambiarla. Lo demás se queda como está.
        </p>
      </header>

      <ol className="mt-8 space-y-2.5">
        {diagnosticoConfig.map((question, index) => {
          const respuesta = describeAnswer(question, values);

          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="group flex w-full items-start gap-4 rounded-[var(--radius-card)] border border-dust bg-white p-4 text-left transition-all duration-200 hover:border-amber hover:shadow-[var(--shadow-md)] sm:p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dust font-display text-sm font-bold text-stone transition-colors group-hover:border-amber group-hover:text-amber"
                >
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="ds-label block">{AREA_LABELS[question.area]}</span>
                  <span className="mt-1 block font-display text-base font-semibold text-ink">
                    {question.titulo}
                  </span>
                  <span className="mt-1.5 block text-base whitespace-pre-wrap text-stone">
                    {respuesta || 'Sin responder'}
                  </span>
                </span>

                <span
                  aria-hidden
                  className="mt-0.5 flex shrink-0 items-center gap-1.5 text-sm text-stone transition-colors group-hover:text-amber"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Cambiar</span>
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
          {isSubmitting ? 'Generando...' : 'Generar mi diagnóstico'}
          {!isSubmitting && <ArrowRight className="h-5 w-5" />}
        </button>
        <p className="text-sm text-stone">Tarda unos segundos. No cierres la página.</p>
      </div>
    </div>
  );
}
