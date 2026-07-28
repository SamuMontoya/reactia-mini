'use client';
import { useEffect, useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { Diagnostico } from '@/lib/schemas';
import { AREA_LABELS, type DiagnosticoQuestion } from '@/content/diagnostico-config';
import OptionCards from '@/components/ui/OptionCards';
import ScaleInput from '@/components/ui/ScaleInput';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { Alert } from '@/components/icons';

type QuestionRendererProps = {
  question: DiagnosticoQuestion;
  control: Control<Diagnostico>;
  errors: FieldErrors<Diagnostico>;
  /** Current value of the main field, to decide whether "otro" is showing. */
  currentValue: unknown;
};

/**
 * Renders one question.
 *
 * Every control goes through <Controller>, i.e. the value is always read from
 * react-hook-form state rather than from the DOM. That is what fixes the
 * "Anterior" bug: the old version registered uncontrolled inputs and set
 * defaultValue="" on the <select>, so stepping back remounted the field and the
 * DOM reset itself to blank even though the answer was still in form state.
 * Controlled fields cannot drift from state, so every question type behaves the
 * same on the way back — not just the ones that happened to work.
 */
export default function QuestionRenderer({
  question,
  control,
  errors,
  currentValue,
}: QuestionRendererProps) {
  // Set when a paste is rejected on a `sinPegar` question, so we can explain
  // why the text didn't appear instead of leaving the user thinking it broke.
  const [pegadoBloqueado, setPegadoBloqueado] = useState(false);

  useEffect(() => {
    setPegadoBloqueado(false);
  }, [question.id]);

  const labelId = `pregunta-${question.id}`;
  const error = errors[question.id]?.message as string | undefined;
  const otro = question.otro;
  const otroVisible = !!otro && currentValue === otro.cuando;
  const otroError = otro
    ? (errors[otro.campo]?.message as string | undefined)
    : undefined;

  return (
    <div>
      {/* Amber wash, never a filled chip — the wizard already uses solid amber
          for the selected option and the progress bar. */}
      <p className="ds-wash inline-block py-1.5 pl-3 pr-3.5">
        <span className="ds-eyebrow">{AREA_LABELS[question.area]}</span>
      </p>

      <h2
        id={labelId}
        className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl"
      >
        {question.titulo}
      </h2>

      {question.ayuda && <p className="mt-3 text-lg text-stone">{question.ayuda}</p>}

      <div className="mt-8">
        {question.tipo === 'opciones' && (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <OptionCards
                name={field.name}
                options={question.opciones ?? []}
                value={field.value as string | undefined}
                onChange={field.onChange}
                columns={question.columnas ?? 1}
                labelId={labelId}
                invalid={!!error}
              />
            )}
          />
        )}

        {question.tipo === 'escala' && (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <ScaleInput
                name={field.name}
                value={field.value as number | undefined}
                onChange={field.onChange}
                lowLabel={question.escala?.bajo ?? '1'}
                highLabel={question.escala?.alto ?? '5'}
                labelId={labelId}
              />
            )}
          />
        )}

        {question.tipo === 'moneda' && (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <CurrencyInput
                id={question.id}
                value={field.value as number | null | undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={question.placeholder}
                invalid={!!error}
              />
            )}
          />
        )}

        {question.tipo === 'texto' && (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => {
              const texto = (field.value as string | undefined) ?? '';
              const max = question.maxLength;

              return (
                <div>
                  <textarea
                    id={question.id}
                    rows={question.filas ?? 5}
                    placeholder={question.placeholder}
                    maxLength={max}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={max ? `${question.id}-contador` : undefined}
                    value={texto}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    onPaste={
                      question.sinPegar
                        ? (event) => {
                            event.preventDefault();
                            setPegadoBloqueado(true);
                          }
                        : undefined
                    }
                    onDrop={question.sinPegar ? (event) => event.preventDefault() : undefined}
                    className="ds-input resize-y"
                  />

                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    {/* Announced politely rather than as an alert: the user did
                        nothing wrong, they just need to know why nothing landed. */}
                    <p
                      aria-live="polite"
                      className={`text-sm text-stone transition-opacity ${
                        pegadoBloqueado ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {pegadoBloqueado ? 'Escríbelo con tus palabras, sin pegar.' : ' '}
                    </p>

                    {max && (
                      <p
                        id={`${question.id}-contador`}
                        className={`shrink-0 text-sm tabular-nums ${
                          texto.length >= max ? 'text-signal-mid' : 'text-stone'
                        }`}
                      >
                        {texto.length}/{max}
                      </p>
                    )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1.5 text-base text-signal-low"
        >
          <Alert className="h-5 w-5 shrink-0" />
          {error}
        </p>
      )}

      {/* Light personalisation: a short text box that only appears once "Otro"
          is chosen, so it costs nothing to everyone who picked a listed answer. */}
      {otroVisible && otro && (
        <div className="ds-rule-amber mt-5">
          <label
            htmlFor={otro.campo}
            className="block font-display text-base font-semibold text-ink"
          >
            {otro.label}
          </label>
          <Controller
            name={otro.campo}
            control={control}
            render={({ field }) => (
              <input
                id={otro.campo}
                type="text"
                maxLength={120}
                placeholder={otro.placeholder}
                aria-invalid={otroError ? true : undefined}
                value={(field.value as string | undefined) ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="ds-input mt-2"
              />
            )}
          />
          {otroError && (
            <p role="alert" className="mt-1.5 text-sm text-signal-low">
              {otroError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
