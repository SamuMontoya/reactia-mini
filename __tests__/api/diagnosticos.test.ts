import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { saveDiagnostico } from '@/lib/api/diagnosticos';

type LeadSingleResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};
type DiagnosticoSingleResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};
type DeviceDiagResult = {
  error: { message: string } | null;
};

const mockLeadSingle = jest.fn<() => Promise<LeadSingleResult>>();
const mockDiagnosticoSingle = jest.fn<() => Promise<DiagnosticoSingleResult>>();
const mockDeviceDiagInsert = jest.fn<
  (payload: { device_id: string; lead_id: string; diagnostico_id: string }) => Promise<DeviceDiagResult>
>();

// The device-limit check runs its own separate query — mocked to
// "under the limit" here since these tests are about saveDiagnostico's own
// logic, not the limit gate (covered in its own test file).
jest.mock('@/lib/api/device', () => ({
  asegurarLimiteDiagnosticosNoAlcanzado: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn((table: string) => {
      if (table === 'leads') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockLeadSingle,
            })),
          })),
        };
      }

      if (table === 'diagnosticos') {
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: mockDiagnosticoSingle,
            })),
          })),
        };
      }

      if (table === 'device_diagnostics') {
        return {
          insert: mockDeviceDiagInsert,
        };
      }

      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: mockDiagnosticoSingle,
          })),
        })),
      };
    }),
  },
}));

const validRespuestas = {
  modelo_tipo_negocio: 'servicio',
  descripcion_negocio: 'Ofrecemos servicios de consultoría para pequeñas empresas.',
  ticket_promedio_cop: 500_000,
  oferta_escrita: 'si',
  avatar_claridad: 4,
  origen_clientes: 'referidos',
  proceso_conversion: 'parcial',
  operacion_dueño: 'yo_ayudante',
  procesos_documentados: 3,
  rituales_metricas: 'si',
  kpi_norte_definido: 'no',
  mayor_frustracion: 'No tengo suficientes clientes recurrentes.',
} as const;

beforeEach(() => {
  mockLeadSingle.mockReset();
  mockDiagnosticoSingle.mockReset();
  mockDeviceDiagInsert.mockReset();
});

describe('saveDiagnostico', () => {
  it('guarda correctamente si el lead existe y las respuestas son válidas', async () => {
    mockLeadSingle.mockResolvedValue({ data: { id: 'lead-1' }, error: null });
    mockDiagnosticoSingle.mockResolvedValue({
      data: { id: 'diagnostico-1' },
      error: null,
    });
    mockDeviceDiagInsert.mockResolvedValue({ error: null });

    const result = await saveDiagnostico('lead-1', validRespuestas, 'device-1');

    expect(result).toEqual({ diagnosticoId: 'diagnostico-1' });
  });

  it('rechaza si el lead no existe', async () => {
    mockLeadSingle.mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    });

    await expect(
      saveDiagnostico('lead-inexistente', validRespuestas, 'device-1')
    ).rejects.toThrow('Lead no encontrado');
  });

  it('inserta registro en device_diagnostics al guardar diagnóstico', async () => {
    mockLeadSingle.mockResolvedValue({ data: { id: 'lead-1' }, error: null });
    mockDiagnosticoSingle.mockResolvedValue({
      data: { id: 'diagnostico-1' },
      error: null,
    });
    mockDeviceDiagInsert.mockResolvedValue({ error: null });

    await saveDiagnostico('lead-1', validRespuestas, 'device-123');

    expect(mockDeviceDiagInsert).toHaveBeenCalledWith({
      device_id: 'device-123',
      lead_id: 'lead-1',
      diagnostico_id: 'diagnostico-1',
    });
  });

  it('lanza error si falla la inserción en device_diagnostics', async () => {
    mockLeadSingle.mockResolvedValue({ data: { id: 'lead-1' }, error: null });
    mockDiagnosticoSingle.mockResolvedValue({
      data: { id: 'diagnostico-1' },
      error: null,
    });
    mockDeviceDiagInsert.mockResolvedValue({
      error: { message: 'Foreign key constraint failed' },
    });

    await expect(
      saveDiagnostico('lead-1', validRespuestas, 'device-123')
    ).rejects.toThrow('Foreign key constraint failed');
  });
});
