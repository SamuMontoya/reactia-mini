import type { ScoringResult } from '@/lib/schemas';

type Area = ScoringResult['cuello_botella'];

/**
 * Plain-language description of the Reactia month that resolves each area.
 *
 * The model writes `proximo_paso` itself and anchors it to what the person
 * typed; this is the fixed programme mapping shown alongside it, so the result
 * is never just an AI sentence with nothing behind it. Rewritten to drop
 * "avatar", "unit economics", "pricing", "KPI norte", "rituales" and "dashboard".
 */
export const reactiaMeses: Record<Area, string> = {
  modelo:
    'Mes 1 · Estructura y modelo — ordenamos de dónde sale la plata: qué vendes, a cuánto y cuánto te queda.',
  oferta:
    'Mes 1 · Definiciones y oferta — dejamos por escrito a quién le sirves, qué le resuelves y por qué eres distinto.',
  clientes:
    'Mes 2 · Clientes y ventas — armamos de dónde llegan y los pasos para que un interesado te pague.',
  operaciones:
    'Mes 2 · Equipo y delegación — organizamos tu equipo para que dejes de ser el cuello de botella.',
  procesos:
    'Mes 3 · Procesos y seguimiento — escribimos cómo se hacen las cosas e instalamos la reunión semanal.',
  metricas:
    'Mes 3 · Tus números — definimos el número más importante y dónde lo vas a mirar cada semana.',
};
