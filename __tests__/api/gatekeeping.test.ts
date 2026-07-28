import { describe, it, expect, jest } from '@jest/globals';
import { submitGatekeeping } from '@/lib/api/gatekeeping';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: 'test-lead-id' },
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

describe('submitGatekeeping', () => {
  it('retorna leadId y califica=true si cumple criterios', async () => {
    const result = await submitGatekeeping({
      facturacion_rango: '5_30m',
      anios_operacion: 2,
      rol: 'dueño_ceo',
      nombre: 'Samuel',
      empresa: 'Reactia',
      whatsapp: '+573001234567',
    });

    expect(result.leadId).toBe('test-lead-id');
    expect(result.califica).toBe(true);
  });

  it('retorna califica=false si facturación < 5M', async () => {
    const result = await submitGatekeeping({
      facturacion_rango: '1_5m',
      anios_operacion: 2,
      rol: 'dueño_ceo',
      nombre: 'Samuel',
      empresa: 'Reactia',
      whatsapp: '+573001234567',
    });

    expect(result.califica).toBe(false);
  });

  it('retorna califica=false si rol no es dueño_ceo', async () => {
    const result = await submitGatekeeping({
      facturacion_rango: '5_30m',
      anios_operacion: 2,
      rol: 'empleado',
      nombre: 'Samuel',
      empresa: 'Reactia',
      whatsapp: '+573001234567',
    });

    expect(result.califica).toBe(false);
  });

  it('no bloquea un negocio que arrancó este año', async () => {
    const result = await submitGatekeeping({
      facturacion_rango: '5_30m',
      anios_operacion: 0,
      rol: 'dueño_ceo',
      nombre: 'Samuel',
      empresa: 'Reactia',
      whatsapp: '+573001234567',
    });

    expect(result).toEqual({ leadId: 'test-lead-id', califica: false });
  });
});
