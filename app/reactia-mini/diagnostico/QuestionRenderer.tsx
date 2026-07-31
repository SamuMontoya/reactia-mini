'use client';
import { useEffect, useRef, useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { Diagnostico } from '@/lib/schemas';
import { AREA_LABELS, type DiagnosticoQuestion } from '@/content/diagnostico-config';
import OptionCards from '@/components/ui/OptionCards';
import ScaleInput from '@/components/ui/ScaleInput';
import CurrencyInput from '@/components/ui/CurrencyInput';
import DictateButton from '@/components/ui/DictateButton';
import { AREA_ICONS, Alert } from '@/components/icons';

type QuestionRendererProps = {
  question: DiagnosticoQuestion;
  control: Control<Diagnostico>;
  errors: FieldErrors<Diagnostico>;
  /** Current value of the main field, to decide whether "otro" is showing. */
  currentValue: unknown;
  /** Mirrors whether dictation is active on this question's text field up to
   *  the wizard page, so it can hold off letting the reader advance mid
   *  dictation — moving on while the mic is still open is what used to
   *  submit whatever partial value react-hook-form happened to have. */
  onDictandoChange?: (dictando: boolean) => void;
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
  onDictandoChange,
}: QuestionRendererProps) {
  // Set when a paste is rejected on a `sinPegar` question, so we can explain
  // why the text didn't appear instead of leaving the user thinking it broke.
  const [pegadoBloqueado, setPegadoBloqueado] = useState(false);
  // Swaps the (still-empty, while dictating) textarea's own placeholder to
  // say so — the interim preview under DictateButton is easy to miss on a
  // phone, but text where the reader is already looking isn't.
  const [dictando, setDictando] = useState(false);
  // Live, not-yet-final guess from DictateButton, merged straight into the
  // textarea's own displayed value below rather than shown in a floating
  // preview — see DictateButton's doc comment for why.
  const [interim, setInterim] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPegadoBloqueado(false);
    setDictando(false);
    setInterim('');
    onDictandoChange?.(false);
    // Only `question.id` should re-run this — `onDictandoChange` is a fresh
    // callback identity on every parent render, and depending on it here
    // would reset dictation state on every keystroke, not just on question
    // change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const handleDictandoChange = (next: boolean) => {
    setDictando(next);
    onDictandoChange?.(next);
  };

  const labelId = `pregunta-${question.id}`;
  const error = errors[question.id]?.message as string | undefined;
  const otro = question.otro;
  const otroVisible = !!otro && currentValue === otro.cuando;
  const otroError = otro
    ? (errors[otro.campo]?.message as string | undefined)
    : undefined;

  const AreaIcon = AREA_ICONS[question.area];

  return (
    <div className="relative">
      {/* Contained halo — the brand's soft-light motif, scoped to this wrapper
          (not the page) so it can't bleed into the sticky nav/footer below. A
          little visual movement on every question, not just the "big moment"
          screens. Everything else below lives inside its own `relative`
          wrapper: non-positioned content paints BEHIND any positioned element
          regardless of DOM order, so without that wrapper the halo (absolutely
          positioned) would sit on top of the plain input area beneath it. */}
      <div
        aria-hidden
        className="ds-halo pointer-events-none -left-16 -top-24 h-72 w-72 opacity-70"
      />

      <div className="relative">
        {/* Amber wash, never a filled chip — the wizard already uses solid
            amber for the selected option and the progress bar. The area icon
            ties this back to the same glyphs used for these areas on the
            result page. */}
        <p className="ds-wash inline-flex items-center gap-2 py-1.5 pl-3 pr-3.5">
          <AreaIcon className="h-3.5 w-3.5 text-amber" />
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
                // Merged live, right inside the field: while dictating, the
                // growing interim guess is appended after whatever is
                // already committed, so there is nothing to swap out once
                // it goes final — the committed text lands in the exact
                // spot the preview was already showing.
                const valorMostrado =
                  dictando && interim ? `${texto}${texto ? ' ' : ''}${interim}` : texto;

                return (
                  <div>
                    {/* Button, help text and counter all on one row — sits
                        above the textarea so it's the first thing read
                        rather than something discovered after already
                        reaching for the keyboard. The help text truncates
                        rather than wrapping: on a narrow phone it's the
                        least important of the three, not worth a second
                        line. */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <DictateButton
                          onTranscript={(chunk) => {
                            const next = texto ? `${texto} ${chunk}` : chunk;
                            field.onChange(max ? next.slice(0, max) : next);
                          }}
                          onFocusFallback={() => textareaRef.current?.focus()}
                          onListeningChange={handleDictandoChange}
                          onInterimChange={setInterim}
                        />
                        <p className="truncate text-xs text-stone">
                          Toca para dictar o escribe abajo con teclado.
                        </p>
                      </div>

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

                    <textarea
                      ref={textareaRef}
                      id={question.id}
                      rows={question.filas ?? 5}
                      placeholder={
                        dictando && !texto
                          ? 'Estoy tomando nota de lo que dices. Una vez termines de dictar, el texto aparecerá aquí.'
                          : question.placeholder
                      }
                      maxLength={max}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={max ? `${question.id}-contador` : undefined}
                      readOnly={dictando}
                      value={valorMostrado}
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
                      onDrop={
                        question.sinPegar ? (event) => event.preventDefault() : undefined
                      }
                      className="ds-input mt-2 resize-y"
                    />

                    {/* Announced politely rather than as an alert: the user
                        did nothing wrong, they just need to know why nothing
                        landed. */}
                    {pegadoBloqueado && (
                      <p aria-live="polite" className="mt-1.5 text-sm text-stone">
                        Escríbelo con tus palabras, sin pegar.
                      </p>
                    )}
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

        {/* Light personalisation: a short text box that only appears once
            "Otro" is chosen, so it costs nothing to everyone who picked a
            listed answer. */}
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
    </div>
  );
}
