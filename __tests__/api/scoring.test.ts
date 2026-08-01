import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type Completion = { choices: Array<{ message: { content: string | null } }> };
/** Only the part of the request these tests assert on. */
type ChatRequest = { messages: unknown; model: string };
type CreateFn = (body: ChatRequest, options?: unknown) => Promise<Completion>;

const mockGroqCreate = jest.fn<CreateFn>();
const mockOpenRouterCreate = jest.fn<CreateFn>();

jest.mock('groq-sdk', () => ({
  Groq: jest.fn(() => ({
    chat: { completions: { create: mockGroqCreate } },
  })),
}));

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    chat: { completions: { create: mockOpenRouterCreate } },
  })),
}));

// Both keys present by default so the fallback path is reachable; the
// "no key configured" cases override this per-test. `isOpenRouterConfigured`
// mirrors the real implementation so those overrides behave as in production
// — the real function itself is covered in __tests__/config.test.ts.
const PLACEHOLDER = 'PENDIENTE_CONFIGURAR';
jest.mock('@/config', () => {
  const config = {
    GROQ_API_KEY: 'groq-test-key',
    OPENROUTER_API_KEY: 'openrouter-test-key',
  };
  return {
    config,
    WHATSAPP_PLACEHOLDER: 'PENDIENTE_CONFIGURAR',
    isOpenRouterConfigured: () => {
      const v = config.OPENROUTER_API_KEY.trim();
      return v !== '' && v !== 'PENDIENTE_CONFIGURAR';
    },
  };
});

import { callScoring } from '@/lib/api/scoring';
import { config } from '@/config';
import type { Diagnostico } from '@/lib/schemas';

const RESPUESTAS = {
  modelo_tipo_negocio: 'producto',
  descripcion_negocio: 'Vendo software para restaurantes pequeños en Bogotá.',
  ticket_promedio_cop: 5_000_000,
  oferta_escrita: 'si',
  avatar_claridad: 4,
  origen_clientes: 'referidos',
  proceso_conversion: 'parcial',
  operacion_dueño: 'yo_ayudante',
  procesos_documentados: 3,
  rituales_metricas: 'no',
  kpi_norte_definido: 'si',
  mayor_frustracion: 'No tengo tiempo para vender, me absorbe la operación.',
} as Diagnostico;

/** A payload that satisfies scoringResultSchema. */
const validPayload = (proximoPaso = 'Escribe tu oferta en una página.') =>
  JSON.stringify({
    scores: {
      modelo: 60,
      oferta: 30,
      clientes: 70,
      operaciones: 50,
      procesos: 55,
      metricas: 65,
    },
    cuello_botella: 'oferta',
    proximo_paso: proximoPaso,
    benchmark: 'La mayoría de negocios en tu etapa se estanca en lo que ofrece.',
    kpis_starter: ['Ventas al mes', 'Clientes nuevos', 'Precio promedio', 'Cierres'],
  });

const completion = (content: string | null): Completion => ({
  choices: [{ message: { content } }],
});

beforeEach(() => {
  mockGroqCreate.mockReset();
  mockOpenRouterCreate.mockReset();
  config.OPENROUTER_API_KEY = 'openrouter-test-key';
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('callScoring — Groq como proveedor principal', () => {
  it('usa Groq y no toca OpenRouter cuando Groq responde bien', async () => {
    mockGroqCreate.mockResolvedValue(completion(validPayload()));

    const result = await callScoring('diag-1', RESPUESTAS);

    expect(result.modelo_usado).toBe('llama-3.3-70b-versatile');
    expect(result.cuello_botella).toBe('oferta');
    expect(mockOpenRouterCreate).not.toHaveBeenCalled();
  });
});

describe('callScoring — respaldo en OpenRouter', () => {
  it('cae a OpenRouter cuando Groq lanza un error (caída, timeout, rate limit)', async () => {
    mockGroqCreate.mockRejectedValue(new Error('503 Service Unavailable'));
    mockOpenRouterCreate.mockResolvedValue(completion(validPayload()));

    const result = await callScoring('diag-1', RESPUESTAS);

    expect(mockOpenRouterCreate).toHaveBeenCalledTimes(1);
    expect(result.modelo_usado).toBe('openrouter/meta-llama/llama-3.3-70b-instruct');
    expect(result.cuello_botella).toBe('oferta');
  });

  it('cae a OpenRouter cuando Groq responde vacío', async () => {
    mockGroqCreate.mockResolvedValue(completion(null));
    mockOpenRouterCreate.mockResolvedValue(completion(validPayload()));

    const result = await callScoring('diag-1', RESPUESTAS);

    expect(result.modelo_usado).toContain('openrouter/');
  });

  it('cae a OpenRouter cuando Groq devuelve un JSON que no cumple el esquema', async () => {
    // Right shape, impossible score — exactly what must never reach la base.
    mockGroqCreate.mockResolvedValue(
      completion(
        JSON.stringify({
          scores: { modelo: 999, oferta: 30, clientes: 70, operaciones: 50, procesos: 55, metricas: 65 },
          cuello_botella: 'oferta',
          proximo_paso: 'algo',
          benchmark: 'algo',
          kpis_starter: ['a', 'b', 'c', 'd'],
        })
      )
    );
    mockOpenRouterCreate.mockResolvedValue(completion(validPayload()));

    const result = await callScoring('diag-1', RESPUESTAS);

    expect(result.modelo_usado).toContain('openrouter/');
    expect(result.scores.modelo).toBe(60);
  });

  it('le manda a OpenRouter exactamente el mismo prompt que a Groq', async () => {
    mockGroqCreate.mockRejectedValue(new Error('caída'));
    mockOpenRouterCreate.mockResolvedValue(completion(validPayload()));

    await callScoring('diag-1', RESPUESTAS);

    const groqArgs = mockGroqCreate.mock.calls[0]?.[0];
    const openRouterArgs = mockOpenRouterCreate.mock.calls[0]?.[0];

    expect(groqArgs).toBeDefined();
    expect(openRouterArgs).toBeDefined();
    expect(openRouterArgs?.messages).toEqual(groqArgs?.messages);
  });
});

describe('callScoring — cuando no hay respaldo posible', () => {
  it('propaga el error de Groq si no hay OPENROUTER_API_KEY configurada', async () => {
    config.OPENROUTER_API_KEY = '';
    mockGroqCreate.mockRejectedValue(new Error('503 Service Unavailable'));

    await expect(callScoring('diag-1', RESPUESTAS)).rejects.toThrow(/Groq/);
    expect(mockOpenRouterCreate).not.toHaveBeenCalled();
  });

  it('trata el placeholder de Vercel como "sin configurar" y no gasta una llamada condenada', async () => {
    // What the Vercel env var holds until the real key is pasted in.
    config.OPENROUTER_API_KEY = PLACEHOLDER;
    mockGroqCreate.mockRejectedValue(new Error('503 Service Unavailable'));

    await expect(callScoring('diag-1', RESPUESTAS)).rejects.toThrow(/Groq/);
    expect(mockOpenRouterCreate).not.toHaveBeenCalled();
  });

  it('lanza un error que menciona ambos proveedores si los dos fallan', async () => {
    mockGroqCreate.mockRejectedValue(new Error('groq caído'));
    mockOpenRouterCreate.mockRejectedValue(new Error('openrouter caído'));

    // `[\s\S]` rather than the `s` flag — the project's TS target predates it.
    await expect(callScoring('diag-1', RESPUESTAS)).rejects.toThrow(
      /Ambos proveedores[\s\S]*groq caído[\s\S]*openrouter caído/
    );
  });
});
