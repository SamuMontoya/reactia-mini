import { Groq } from 'groq-sdk';
import { config } from '@/config';
import { scoringResultSchema, type Diagnostico, type ScoringResult } from '@/lib/schemas';
import { buildScoringPrompt } from '@/lib/scoring/buildPrompt';
import { getErrorMessage } from '@/lib/getErrorMessage';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_TIMEOUT_MS = 8000;

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

export const callGroqScoring = async (
  diagnosticoId: string,
  respuestas: Diagnostico
): Promise<ScoringResult & { modelo_usado: string }> => {
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
      { timeout: GROQ_TIMEOUT_MS }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Groq no devolvió contenido');
    }

    const parsed = JSON.parse(raw);
    const validResult = scoringResultSchema.parse(parsed);

    return { ...validResult, modelo_usado: GROQ_MODEL };
  } catch (error) {
    throw new Error(
      `Error en scoring de Groq para diagnóstico ${diagnosticoId}: ${getErrorMessage(error)}`
    );
  }
};
