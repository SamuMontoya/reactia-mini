import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  asegurarLimiteDiagnosticosNoAlcanzado,
  countDiagnosticosByDeviceId,
  getDiagnosticosByDeviceId,
} from '@/lib/api/device';
import { MAX_DIAGNOSTICOS_GRATIS } from '@/lib/constants/limits';

type SelectResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};
type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

const mockOrder = jest.fn<() => Promise<SelectResult>>();
// Separate from mockOrder: countDiagnosticosByDeviceId's query
// (`.select('*', { count, head }).eq(...)`) resolves straight off `.eq()`,
// it never calls `.order()` — a different chain shape than
// getDiagnosticosByDeviceId's, distinguished below by whether `select` was
// called with a `count` option.
const mockCountEq = jest.fn<() => Promise<CountResult>>();

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn((_columns: string, opts?: { count?: string }) => {
        if (opts?.count) {
          return { eq: mockCountEq };
        }
        return {
          eq: jest.fn(() => ({ order: mockOrder })),
        };
      }),
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
  mockCountEq.mockReset();
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

describe('countDiagnosticosByDeviceId', () => {
  it('devuelve el conteo exacto de la consulta', async () => {
    mockCountEq.mockResolvedValue({ count: 2, error: null });
    await expect(countDiagnosticosByDeviceId('device-1')).resolves.toBe(2);
  });

  it('devuelve 0 cuando count viene null', async () => {
    mockCountEq.mockResolvedValue({ count: null, error: null });
    await expect(countDiagnosticosByDeviceId('device-1')).resolves.toBe(0);
  });

  it('lanza error si falla la consulta', async () => {
    mockCountEq.mockResolvedValue({ count: null, error: { message: 'Error de conexión' } });
    await expect(countDiagnosticosByDeviceId('device-1')).rejects.toThrow('Error de conexión');
  });
});

describe('asegurarLimiteDiagnosticosNoAlcanzado', () => {
  it('no lanza si el dispositivo está por debajo del límite', async () => {
    mockCountEq.mockResolvedValue({ count: MAX_DIAGNOSTICOS_GRATIS - 1, error: null });
    await expect(
      asegurarLimiteDiagnosticosNoAlcanzado('device-1')
    ).resolves.toBeUndefined();
  });

  it('lanza cuando el dispositivo ya alcanzó el límite', async () => {
    mockCountEq.mockResolvedValue({ count: MAX_DIAGNOSTICOS_GRATIS, error: null });
    await expect(asegurarLimiteDiagnosticosNoAlcanzado('device-1')).rejects.toThrow();
  });

  it('lanza cuando el dispositivo ya está por encima del límite', async () => {
    mockCountEq.mockResolvedValue({ count: MAX_DIAGNOSTICOS_GRATIS + 5, error: null });
    await expect(asegurarLimiteDiagnosticosNoAlcanzado('device-1')).rejects.toThrow();
  });

  it('no lanza ni consulta cuando no hay deviceId', async () => {
    await expect(
      asegurarLimiteDiagnosticosNoAlcanzado(undefined)
    ).resolves.toBeUndefined();
    expect(mockCountEq).not.toHaveBeenCalled();
  });
});
