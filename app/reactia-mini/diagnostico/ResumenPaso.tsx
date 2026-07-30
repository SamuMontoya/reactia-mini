'use client';
import type { Diagnostico } from '@/lib/schemas';
import {
  AREA_LABELS,
  describeAnswer,
  diagnosticoConfig,
  type DiagnosticoQuestion,
} from '@/content/diagnostico-config';
import { AREA_ICONS, Pencil, QuoteMark, Sparkles } from '@/components/icons';
import Reveal from '@/components/ui/Reveal';

type ResumenPasoProps = {
  values: Partial<Diagnostico>;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
};

/**
 * Compact answer for everything except free text: an option, an amount, a 1-5
 * rating. Full card width rather than sized to its own text — at five columns
 * a fit-content chip left a ragged, ad-hoc-looking edge next to the card's own
 * border; full width reads as one deliberate block instead.
 *
 * `min-h-14` reserves the same two-line height as the question title above it,
 * on both chip variants. Five columns leaves each card narrow enough that a
 * medium-length answer ("Yo con un ayudante") wraps to two lines while a short
 * one ("No") doesn't, and without that reserved floor the difference alone was
 * enough to make otherwise-identical cards render at different heights. (56px,
 * not the 52px two lines of text alone would need — the chip's own border adds
 * a couple more, and 52px measured 3px short in practice.)
 */
const CHIP_ALTURA = 'min-h-14';

function RespuestaChip({ texto }: { texto: string }) {
  if (!texto) {
    return (
      <span
        className={`mt-3 flex w-full items-center rounded-[var(--radius-btn)] border border-signal-low/30 bg-signal-low/5 px-3 py-1.5 text-sm italic text-signal-low ${CHIP_ALTURA}`}
      >
        Sin responder
      </span>
    );
  }

  return (
    <span
      className={`ds-wash mt-3 flex w-full items-center py-1.5 pl-3 pr-3.5 text-sm font-semibold leading-snug text-ink ${CHIP_ALTURA}`}
    >
      {texto}
    </span>
  );
}

/**
 * One of the two free-text answers (business description, biggest frustration)
 * — the qualitative input the scoring model leans on most, and the only prose
 * in the whole review. Promoted out of the grid into its own dark feature card:
 * a giant ghost quotation mark and an ink surface mark it as substance rather
 * than another data point, which is also where the review screen gets the
 * "toque oscuro" the rest of the funnel already uses at its other big moments
 * (generando, the closing CTA).
 */
function RespuestaHistoria({
  question,
  index,
  texto,
  onEdit,
}: {
  question: DiagnosticoQuestion;
  index: number;
  texto: string;
  onEdit: () => void;
}) {
  const Icon = AREA_ICONS[question.area];
  const sinResponder = !texto;

  return (
    <button
      type="button"
      onClick={onEdit}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-ink p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber/50 hover:shadow-[0_16px_36px_rgba(200,134,10,0.22)] sm:p-7"
    >
      {/* Giant ghost quotation mark — the same oversized-glyph-in-the-corner
          motif as the landing's step cards and the result page's KPI tiles,
          reused here instead of inventing a new decoration. A hand-drawn SVG,
          not the “ character: that glyph sits high and thin in its own em-box,
          so at this size almost none of it is inked — against this card's
          overflow-hidden it clipped down to an odd fragment instead of reading
          as a quotation mark. */}
      <QuoteMark className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-white/[0.07]" />


      <span className="relative flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-amber" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-amber">
            {AREA_LABELS[question.area]}
          </span>
        </span>
        <span
          aria-hidden
          className="flex shrink-0 items-center gap-1 text-xs text-dust/70 transition-colors group-hover:text-amber"
        >
          <Pencil className="h-3.5 w-3.5" />
          {index + 1}
        </span>
      </span>

      <span className="relative mt-3 block font-display text-lg font-bold leading-snug text-white">
        {question.titulo}
      </span>

      {sinResponder ? (
        <span className="relative mt-4 inline-flex w-fit items-center rounded-[var(--radius-btn)] border border-signal-low/40 bg-signal-low/10 px-3 py-1.5 text-sm italic text-signal-low">
          Sin responder
        </span>
      ) : (
        <p className="relative mt-4 line-clamp-5 whitespace-pre-wrap text-base italic leading-relaxed text-dust">
          “{texto}”
        </p>
      )}

      <span className="sr-only">Editar esta respuesta</span>
    </button>
  );
}

/**
 * Review screen — the last step before the diagnóstico is generated.
 *
 * Every answer is listed and every card is a button back into that one
 * question. Editing one answer must not disturb the others, which is why the
 * wizard keeps a single react-hook-form instance for the whole flow and this
 * screen only changes which step is on screen: nothing is re-initialised, so
 * the other ten answers are literally untouched.
 *
 * The two free-text answers live outside the grid, in their own section (see
 * RespuestaHistoria) — mixing a paragraph-length answer into a grid of
 * one-line chips is what used to force every card in that row to match the
 * tallest one, leaving short answers stranded in a mostly-empty box. Pulled out,
 * the grid is left with ten answers of the same rough shape (a label, a title,
 * a short chip), so `items-start` keeps them naturally close in height without
 * fighting anything.
 */
export default function ResumenPaso({
  values,
  onEdit,
  onSubmit,
  isSubmitting,
  submitError,
}: ResumenPasoProps) {
  const conIndice = diagnosticoConfig.map((question, index) => ({ question, index }));
  const historias = conIndice.filter(({ question }) => question.tipo === 'texto');
  const resto = conIndice.filter(({ question }) => question.tipo !== 'texto');

  return (
    <div className="mx-auto w-full">
      <header className="mx-auto max-w-2xl text-center">
        <p className="ds-eyebrow">Último paso</p>
        <h2 className="mt-4 font-display text-section font-bold text-ink">
          Revisa tus respuestas
        </h2>
        <p className="mt-3 text-lg text-stone">
          Toca cualquier respuesta si quieres cambiarla. Lo demás se queda como está.
        </p>
      </header>

      <p className="ds-label mt-10">En tus palabras</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {historias.map(({ question, index }) => (
          <Reveal key={question.id} delay={index * 60} className="h-full">
            <RespuestaHistoria
              question={question}
              index={index}
              texto={describeAnswer(question, values)}
              onEdit={() => onEdit(index)}
            />
          </Reveal>
        ))}
      </div>

      <p className="ds-label mt-10">Todo lo demás, de un vistazo</p>
      {/* Five columns — with the two long-form answers moved out above, exactly
          ten questions are left, so five columns is two clean, complete rows
          instead of an odd number trailing off into a half-empty last row.
          `items-start` (not the grid default of `stretch`) keeps every card
          sized to its own content rather than matching the tallest one sharing
          its row — the title's reserved two-line height (below) is what makes
          the chips land on the same baseline anyway, so nothing needs to
          stretch to achieve that. */}
      <ol className="mt-3 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {resto.map(({ question, index }) => {
          const respuesta = describeAnswer(question, values);

          return (
            <li key={question.id}>
              {/* Staggered so the cards arrive as a sequence instead of all at
                  once as they scroll into view — 60ms a card keeps a five-wide
                  row landing well under half a second. */}
              <Reveal delay={index * 60}>
                <button
                  type="button"
                  onClick={() => onEdit(index)}
                  // No h-full: with `items-start` on the grid above, each card's
                  // height already comes from its own content, not from a
                  // stretched row — forcing it here would just be a no-op.
                  className="group flex w-full flex-col rounded-[var(--radius-card)] border border-dust bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber hover:shadow-[var(--shadow-md)]"
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

                  {/* Clamped to two lines AND given a min-height that reserves
                      that same two lines whether the title needs them or not.
                      The clamp alone stops a long title from growing past two
                      lines, but a one-line title would still leave its chip
                      sitting higher than its neighbours' — the reserved height is
                      what makes every chip land on the same row regardless of
                      how long its own question happens to be.
                      No `block` here: `line-clamp-2` already sets
                      `display: -webkit-box` (required for the clamp to actually
                      clip anything), and `block` competes for the same `display`
                      property — with both present the clamp silently stopped
                      clipping and every multi-line title rendered at full height. */}
                  <span className="mt-1.5 line-clamp-2 min-h-[2.75rem] font-display text-sm font-semibold leading-snug text-ink">
                    {question.titulo}
                  </span>

                  <RespuestaChip texto={respuesta} />

                  <span className="sr-only">Editar esta respuesta</span>
                </button>
              </Reveal>
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

      <div className="mt-10 flex flex-col items-center gap-3">
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
