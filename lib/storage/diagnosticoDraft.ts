import type { Diagnostico } from '@/lib/schemas';

/**
 * Autosave for the diagnóstico wizard.
 *
 * localStorage rather than a server endpoint: the answers are worthless until
 * the diagnóstico is submitted, a write costs nothing and never fails on a bad
 * connection, and it needs no extra table or route. The trade-off — the draft
 * doesn't follow the user to another device — is acceptable for a 10-minute
 * form. If it ever has to survive a device change, the same three functions can
 * be re-pointed at an endpoint without touching the wizard.
 *
 * Keyed per lead so two people filling the form on one shared computer never
 * inherit each other's answers.
 */

export type DiagnosticoDraft = {
  respuestas: Partial<Diagnostico>;
  /** Question index the user was last on, so we reopen where they left off. */
  paso: number;
  guardadoEn: number;
};

const key = (leadId: string) => `reactia_diagnostico:${leadId}`;

export const saveDraft = (
  leadId: string,
  draft: Omit<DiagnosticoDraft, 'guardadoEn'>
): number | null => {
  try {
    const guardadoEn = Date.now();
    localStorage.setItem(key(leadId), JSON.stringify({ ...draft, guardadoEn }));
    return guardadoEn;
  } catch {
    // Sin localStorage (modo privado, cuota llena): el formulario sigue
    // funcionando, sólo se pierde la recuperación.
    return null;
  }
};

export const getDraft = (leadId: string): DiagnosticoDraft | null => {
  try {
    const raw = localStorage.getItem(key(leadId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<DiagnosticoDraft>;
    if (!parsed.respuestas || typeof parsed.respuestas !== 'object') return null;

    return {
      respuestas: parsed.respuestas,
      paso: typeof parsed.paso === 'number' ? parsed.paso : 0,
      guardadoEn: typeof parsed.guardadoEn === 'number' ? parsed.guardadoEn : 0,
    };
  } catch {
    return null;
  }
};

export const clearDraft = (leadId: string): void => {
  try {
    localStorage.removeItem(key(leadId));
  } catch {
    // Nada que limpiar si localStorage no está disponible.
  }
};

/** A draft only matters if it actually has an answer in it — an empty one
 *  (e.g. left over from a visit that never got past the first question)
 *  shouldn't trigger a "seguir donde quedaste" prompt. */
export const draftTieneRespuestas = (draft: DiagnosticoDraft): boolean =>
  Object.keys(draft.respuestas).length > 0;

/** Whether every question has an answer, i.e. the draft belongs on the
 *  review screen rather than back on a specific question.
 *
 *  Checked against the actual main-question ids, not a raw key count: the
 *  form also stores each "otro" free-text companion field under its own key
 *  (e.g. `origen_clientes_otro`) once a question's "otro" option is picked,
 *  so a draft answering 10 of 12 main questions but choosing "otro" on 2 of
 *  them has 12 keys — a count against `totalPreguntas` would call that
 *  complete and route straight to the review screen with 2 required
 *  questions still blank. */
export const draftEstaCompleto = (
  draft: DiagnosticoDraft,
  preguntaIds: readonly (keyof Diagnostico)[]
): boolean =>
  preguntaIds.every((id) => {
    const value = draft.respuestas[id];
    return value !== undefined && value !== null && value !== '';
  });

/** Which question index to reopen on — the saved step, clamped so a draft
 *  saved against a longer version of the wizard can't point past the end
 *  of the current one. */
export const pasoDesdeDraft = (draft: DiagnosticoDraft, totalPreguntas: number): number =>
  Math.min(Math.max(draft.paso, 0), totalPreguntas - 1);
