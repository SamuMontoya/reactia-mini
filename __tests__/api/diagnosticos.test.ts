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

const mockLeadSingle = jest.fn<() => Promise<LeadSingleResult>>();
const mockDiagnosticoSingle = jest.fn<() => Promise<DiagnosticoSingleResult>>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
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
});

describe('saveDiagnostico', () => {
  it('guarda correctamente si el lead existe y las respuestas son válidas', async () => {
    mockLeadSingle.mockResolvedValue({ data: { id: 'lead-1' }, error: null });
    mockDiagnosticoSingle.mockResolvedValue({
      data: { id: 'diagnostico-1' },
      error: null,
    });

    const result = await saveDiagnostico('lead-1', validRespuestas);

    expect(result).toEqual({ diagnosticoId: 'diagnostico-1' });
  });

  it('rechaza si el lead no existe', async () => {
    mockLeadSingle.mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    });

    await expect(
      saveDiagnostico('lead-inexistente', validRespuestas)
    ).rejects.toThrow('Lead no encontrado');
  });
});
