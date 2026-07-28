import type { ScoringResult } from '@/lib/schemas';

export type Area = ScoringResult['cuello_botella'];

/**
 * Weights used for the overall score. Must sum to 1.0.
 *
 * "metricas" carries no weight of its own: with monthly revenue moved out of the
 * diagnóstico, that area has no question that scores independently — the model
 * derives it from everything else (see lib/scoring/buildPrompt.ts), so counting
 * it again here would double-count the other five.
 */
export const AREA_WEIGHTS: Record<Area, number> = {
  modelo: 0.2,
  oferta: 0.4,
  clientes: 0.2,
  operaciones: 0.1,
  procesos: 0.1,
  metricas: 0,
};

export const AREA_ORDER: readonly Area[] = [
  'modelo',
  'oferta',
  'clientes',
  'operaciones',
  'procesos',
  'metricas',
];

export const computeOverallScore = (scores: ScoringResult['scores']): number => {
  const total = AREA_ORDER.reduce(
    (sum, area) => sum + (scores[area] ?? 0) * AREA_WEIGHTS[area],
    0
  );
  return Math.round(total);
};

/** Three bands, matching the signal tokens in globals.css. */
export const scoreColor = (score: number): string =>
  score < 40
    ? 'var(--color-signal-low)'
    : score <= 70
      ? 'var(--color-signal-mid)'
      : 'var(--color-signal-high)';

export const scoreVeredicto = (score: number): string =>
  score < 40
    ? '¡Hay mucho por ordenar!'
    : score <= 70
      ? '¡Vas por buen camino!'
      : '¡Vas sólido!';
