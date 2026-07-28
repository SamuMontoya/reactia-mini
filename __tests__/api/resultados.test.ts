import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { saveResultado } from '@/lib/api/resultados';

type DiagnosticoSingleResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};
type ResultadoSingleResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

const mockDiagnosticoSingle = jest.fn<() => Promise<DiagnosticoSingleResult>>();
const mockResultadoSingle = jest.fn<() => Promise<ResultadoSingleResult>>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'diagnosticos') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockDiagnosticoSingle,
            })),
          })),
        };
      }

      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: mockResultadoSingle,
          })),
        })),
      };
    }),
  },
}));

const scoringResult = {
  scores: {
    modelo: 60,
    oferta: 30,
    clientes: 70,
    operaciones: 50,
    procesos: 55,
    metricas: 65,
  },
  cuello_botella: 'oferta' as const,
  proximo_paso: 'Mes 1: Definiciones y Oferta',
  benchmark: 'El 68% de negocios en tu etapa está atascado en Oferta',
  kpis_starter: [
    'Ingresos mensuales',
    'Tickets cerrados',
    'Pipeline activo',
    'CAC estimado',
  ],
  modelo_usado: 'llama-3.3-70b-versatile',
};

beforeEach(() => {
  mockDiagnosticoSingle.mockReset();
  mockResultadoSingle.mockReset();
});

describe('saveResultado', () => {
  it('guarda correctamente si el diagnóstico existe', async () => {
    mockDiagnosticoSingle.mockResolvedValue({ data: { id: 'diag-1' }, error: null });
    mockResultadoSingle.mockResolvedValue({
      data: { id: 'resultado-1' },
      error: null,
    });

    const result = await saveResultado('diag-1', scoringResult);

    expect(result).toEqual({ resultadoId: 'resultado-1' });
  });

  it('rechaza si el diagnóstico no existe', async () => {
    mockDiagnosticoSingle.mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    });

    await expect(
      saveResultado('diag-inexistente', scoringResult)
    ).rejects.toThrow('Diagnóstico no encontrado');
  });
});
