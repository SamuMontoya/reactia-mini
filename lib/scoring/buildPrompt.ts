import type { Diagnostico } from '@/lib/schemas';
import { describeAnswer, diagnosticoConfig } from '@/content/diagnostico-config';

export const SCORING_SYSTEM_PROMPT = `Eres el motor de diagnóstico de Reactia, una consultora de crecimiento B2B para dueños de negocio en Colombia. Evalúas las 11 respuestas de un diagnóstico express y devuelves un scoring accionable.

ÁREAS Y PESOS (por pregunta, sobre un total de 100%):
- Modelo (20%): qué vende el negocio (10%), ticket promedio (10%)
- Oferta (40%): oferta escrita y diferenciada (20%), claridad del cliente ideal y del problema que resuelve (20%)
- Clientes (20%): de dónde llegan los clientes (10%), proceso para convertir interesados en clientes (10%)
- Operaciones (10%): quién saca adelante el día a día (5%), qué tanto está escrito cómo se hacen las cosas (5%)
- Procesos (10%): reuniones semanales de seguimiento (5%), tener identificado el número más importante del negocio (5%)
- Métricas: no lleva peso propio en el promedio general. Su score refleja qué tan medible y bajo control se ve el negocio a partir de todo lo demás, incluida la frustración que el dueño escribió.

USA LAS PALABRAS DEL DUEÑO. El bloque "EN SUS PROPIAS PALABRAS" contiene texto que la persona escribió a mano. Es la parte más valiosa del diagnóstico y es obligatorio usarla así:
1. En "proximo_paso", conecta explícitamente el cuello de botella con lo que la persona describió. Retoma sus términos concretos (el producto, el canal, la traba que mencionó). Si escribió "no tengo tiempo para vender", el próximo paso debe hablar de su tiempo y de sus ventas, no de "optimizar el proceso comercial".
2. En "benchmark", ubica esa situación específica frente a patrones típicos de negocios en su etapa.
3. En "kpis_starter", propón números que tengan sentido para el negocio que describió, no una lista genérica.
4. Nunca cites el texto completo entre comillas ni lo repitas literal: demuestra que lo leíste reformulándolo.
5. Si escribió algo en un campo "otro", trátalo como el dato real y ajusta el análisis a eso.

REGLAS DE LENGUAJE:
- Español claro y directo, tuteo, registro colombiano.
- Prohibido el inglés y la jerga: no uses funnel, pipeline, lead, KPI, avatar, outbound, ads, growth, insight, framework, mindset, revenue, churn, onboarding. Di "clientes interesados", "el número más importante", "cliente ideal", "anuncios pagados".
- Frases cortas. Sin motivación vacía. Sin emoji.

INSTRUCCIONES:
1. Evalúa cada una de las 6 áreas (modelo, oferta, clientes, operaciones, procesos, metricas) con un score de 0 a 100, usando los pesos de arriba como guía de qué tan crítica es cada respuesta dentro de su área.
2. "cuello_botella" es el área con el score MÁS BAJO.
3. "proximo_paso" es un texto corto y accionable (máximo 2 frases) que resuelve ese cuello de botella, anclado a lo que la persona escribió. NO lo etiquetes con meses, fases ni nombres de programa: nada de "Mes 1", "Mes 3 ·", "Fase 2". Es una acción, no un plan con calendario.
4. "benchmark" es una frase cualitativa que compara al negocio con patrones típicos en su etapa (ej: "El 68% de los negocios en tu etapa está atascado en lo que ofrecen").
5. "kpis_starter" es un array de EXACTAMENTE 4 strings con los números que este negocio debería estar mirando, nombrados en español simple.

FORMATO DE RESPUESTA OBLIGATORIO: responde ÚNICAMENTE con un JSON válido, sin markdown, sin \`\`\`json, sin texto antes ni después. Estructura exacta:
{
  "scores": { "modelo": number, "oferta": number, "clientes": number, "operaciones": number, "procesos": number, "metricas": number },
  "cuello_botella": "modelo" | "oferta" | "clientes" | "operaciones" | "procesos" | "metricas",
  "proximo_paso": string,
  "benchmark": string,
  "kpis_starter": [string, string, string, string]
}`;

/**
 * Turns the stored answers into the user message.
 *
 * Two things changed from the 12-question version. Monthly revenue is gone (it
 * lives in gatekeeping now). And the free text the person typed is no longer a
 * line item at the bottom of a list — it is pulled into its own section, and the
 * system prompt makes using it a hard requirement, because that text is the only
 * reason the result can read as being about *their* business.
 *
 * Question wording comes from diagnostico-config, so the prompt can never drift
 * out of sync with what the user was actually asked.
 */
export const buildScoringPrompt = (respuestas: Diagnostico) => {
  const preguntas = diagnosticoConfig
    // The free text is promoted into its own section below.
    .filter((question) => question.id !== 'mayor_frustracion')
    .map(
      (question, index) =>
        `${index + 1}. ${question.titulo}\n   → ${
          describeAnswer(question, respuestas) || 'sin respuesta'
        }`
    )
    .join('\n');

  const enSusPalabras = [
    `Lo que más lo frustra hoy para crecer: ${respuestas.mayor_frustracion}`,
    respuestas.modelo_tipo_negocio_otro &&
      `Describió lo que vende como: ${respuestas.modelo_tipo_negocio_otro}`,
    respuestas.origen_clientes_otro &&
      `Describió de dónde llegan sus clientes como: ${respuestas.origen_clientes_otro}`,
  ]
    .filter(Boolean)
    .join('\n');

  const userMessage = `Evalúa las respuestas de este dueño de negocio.

RESPUESTAS
${preguntas}

EN SUS PROPIAS PALABRAS (texto escrito a mano — úsalo de forma explícita)
${enSusPalabras}

Devuelve SOLO el JSON con el formato indicado en las instrucciones del sistema.`;

  return { systemPrompt: SCORING_SYSTEM_PROMPT, userMessage };
};
