import { Groq } from 'groq-sdk';
import OpenAI from 'openai';
import { config, isOpenRouterConfigured } from '@/config';
import { scoringResultSchema, type Diagnostico, type ScoringResult } from '@/lib/schemas';
import { buildScoringPrompt } from '@/lib/scoring/buildPrompt';
import { getErrorMessage } from '@/lib/getErrorMessage';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
/** OpenRouter exposes the same Llama 3.3 70B as Groq, so the fallback answers
 *  with the same model the prompt was tuned against — a different provider,
 *  not a different brain. */
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

const SCORING_TIMEOUT_MS = 8000;

export type ScoringOutcome = ScoringResult & { modelo_usado: string };

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

/**
 * OpenRouter speaks the OpenAI wire format, so the official OpenAI SDK drives
 * it as-is with just a different baseURL.
 *
 * Built on first use, not at module scope: the OpenAI constructor throws
 * outright on a missing key, and this module is imported while Next collects
 * page data at build time — so a module-scope client turned "fallback not
 * configured" (an explicitly supported state) into a failed build. Lazy means
 * the cost is only paid when the fallback actually runs.
 */
let openrouterClient: OpenAI | null = null;
const getOpenRouter = (): OpenAI => {
  if (!openrouterClient) {
    openrouterClient = new OpenAI({
      apiKey: config.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return openrouterClient;
};

/**
 * Both providers are asked for a JSON object and validated against the same
 * schema, so a provider that answers with prose, truncated JSON or the right
 * shape but wrong values fails here rather than reaching the database.
 */
const parseScoringResponse = (raw: string | null | undefined): ScoringResult => {
  if (!raw) throw new Error('respuesta vacía');
  return scoringResultSchema.parse(JSON.parse(raw));
};

export const callGroqScoring = async (
  diagnosticoId: string,
  respuestas: Diagnostico
): Promise<ScoringOutcome> => {
  const { systemPrompt, userMessage } = buildScoringPrompt(respuestas);

  try {
    const completion = await groq.chat.completions.create(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      },
      { timeout: SCORING_TIMEOUT_MS }
    );

    const validResult = parseScoringResponse(completion.choices[0]?.message?.content);

    return { ...validResult, modelo_usado: GROQ_MODEL };
  } catch (error) {
    throw new Error(
      `Error en scoring de Groq para diagnóstico ${diagnosticoId}: ${getErrorMessage(error)}`
    );
  }
};

export const callOpenRouterScoring = async (
  diagnosticoId: string,
  respuestas: Diagnostico
): Promise<ScoringOutcome> => {
  const { systemPrompt, userMessage } = buildScoringPrompt(respuestas);

  try {
    const completion = await getOpenRouter().chat.completions.create(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: OPENROUTER_MODEL,
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      },
      { timeout: SCORING_TIMEOUT_MS }
    );

    const validResult = parseScoringResponse(completion.choices[0]?.message?.content);

    // Prefixed so the stored value says which provider actually served it —
    // the two share a model name, and "which provider was up" is exactly what
    // you want to know when reading these rows back.
    return { ...validResult, modelo_usado: `openrouter/${OPENROUTER_MODEL}` };
  } catch (error) {
    throw new Error(
      `Error en scoring de OpenRouter para diagnóstico ${diagnosticoId}: ${getErrorMessage(error)}`
    );
  }
};

/**
 * Scoring with a provider fallback: Groq first, OpenRouter if Groq can't
 * deliver.
 *
 * This is the last step of the funnel — the visitor has already answered
 * twelve questions — so a provider outage, a rate limit, a timeout or a
 * malformed response should not be the thing that sends them away
 * empty-handed. Anything that makes Groq fail (including a response that
 * doesn't validate against the schema) hands over to OpenRouter with the
 * exact same prompt.
 *
 * The fallback is optional: with no OPENROUTER_API_KEY configured this
 * behaves exactly as the Groq-only version did, surfacing Groq's own error.
 */
export const callScoring = async (
  diagnosticoId: string,
  respuestas: Diagnostico
): Promise<ScoringOutcome> => {
  try {
    return await callGroqScoring(diagnosticoId, respuestas);
  } catch (groqError) {
    if (!isOpenRouterConfigured()) throw groqError;

    // Logged rather than swallowed: a successful fallback is invisible to the
    // visitor by design, so without this a sustained Groq outage would look
    // like nothing is wrong at all.
    console.error(
      `[scoring] Groq falló, intentando con OpenRouter: ${getErrorMessage(groqError)}`
    );

    try {
      return await callOpenRouterScoring(diagnosticoId, respuestas);
    } catch (fallbackError) {
      throw new Error(
        `Ambos proveedores de scoring fallaron para diagnóstico ${diagnosticoId}. ` +
          `Groq: ${getErrorMessage(groqError)} | OpenRouter: ${getErrorMessage(fallbackError)}`
      );
    }
  }
};
