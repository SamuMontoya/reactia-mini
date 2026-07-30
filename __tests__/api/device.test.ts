import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getDiagnosticosByDeviceId } from '@/lib/api/device';

type SelectResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

const mockOrder = jest.fn<() => Promise<SelectResult>>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: mockOrder,
        })),
      })),
    })),
  },
}));

const resultadoResumen = {
  scores: {
    modelo: 60,
    oferta: 30,
    clientes: 70,
    operaciones: 50,
    procesos: 55,
    metricas: 65,
  },
  cuello_botella: 'oferta',
  proximo_paso: 'Mes 1: Definiciones y Oferta',
  benchmark: 'El 68% de negocios en tu etapa está atascado en Oferta',
  kpis_starter: ['Ingresos mensuales', 'Tickets cerrados', 'Pipeline activo', 'CAC estimado'],
};

beforeEach(() => {
  mockOrder.mockReset();
});

describe('getDiagnosticosByDeviceId', () => {
  it('incluye los datos de resultados cuando resultado_id no es null', async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          diagnostico_id: 'diag-1',
          resultado_id: 'resultado-1',
          created_at: '2026-01-01T00:00:00.000Z',
          diagnosticos: { id: 'diag-1', lead_id: 'lead-1' },
          leads: { nombre: 'María Gómez', empresa: 'Tech Solutions' },
          resultados: resultadoResumen,
        },
      ],
      error: null,
    });

    const result = await getDiagnosticosByDeviceId('device-1');

    expect(result).toEqual([
      {
        diagnosticoId: 'diag-1',
        resultadoId: 'resultado-1',
        created_at: '2026-01-01T00:00:00.000Z',
        leadId: 'lead-1',
        empresa: 'Tech Solutions',
        nombre: 'María Gómez',
        resultado: resultadoResumen,
      },
    ]);
  });

  it('devuelve resultado null cuando el diagnóstico está incompleto', async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          diagnostico_id: 'diag-2',
          resultado_id: null,
          created_at: '2026-01-02T00:00:00.000Z',
          diagnosticos: { id: 'diag-2', lead_id: 'lead-1' },
          leads: { nombre: 'María Gómez', empresa: 'Tech Solutions' },
          resultados: null,
        },
      ],
      error: null,
    });

    const result = await getDiagnosticosByDeviceId('device-1');

    expect(result).toEqual([
      {
        diagnosticoId: 'diag-2',
        resultadoId: null,
        created_at: '2026-01-02T00:00:00.000Z',
        leadId: 'lead-1',
        empresa: 'Tech Solutions',
        nombre: 'María Gómez',
        resultado: null,
      },
    ]);
  });

  it('lanza error si falla la consulta', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'Error de conexión' },
    });

    await expect(getDiagnosticosByDeviceId('device-1')).rejects.toThrow(
      'Error de conexión'
    );
  });
});
