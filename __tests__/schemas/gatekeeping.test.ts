import { describe, it, expect } from '@jest/globals';
import { gatekeepingSchema } from '@/lib/schemas';
import { rangoACop, rangoALabel } from '@/content/facturacion-rangos';

const datosValidos = {
  facturacion_rango: '5_30m',
  anios_operacion: 2,
  rol: 'dueño_ceo',
  nombre: 'Samuel',
  empresa: 'Reactia',
  whatsapp: '+573001234567',
} as const;

describe('gatekeepingSchema', () => {
  it('válida con datos correctos', () => {
    expect(() => gatekeepingSchema.parse(datosValidos)).not.toThrow();
  });

  it('permite facturación < 5M a nivel de schema (el umbral de 5M es lógica de negocio en submitGatekeeping)', () => {
    const data = { ...datosValidos, facturacion_rango: '1_5m' };
    expect(() => gatekeepingSchema.parse(data)).not.toThrow();
  });

  it('acepta años_operacion=0', () => {
    expect(() => gatekeepingSchema.parse({ ...datosValidos, anios_operacion: 0 })).not.toThrow();
  });

  it('permite rol distinto a dueño_ceo a nivel de schema (la descalificación por rol es lógica de negocio en submitGatekeeping)', () => {
    const data = { ...datosValidos, rol: 'empleado' };
    expect(() => gatekeepingSchema.parse(data)).not.toThrow();
  });

  it('rechaza whatsapp con menos de 10 dígitos', () => {
    const data = { ...datosValidos, whatsapp: '123456' };
    expect(() => gatekeepingSchema.parse(data)).toThrow();
  });

  it('acepta exactamente 10 dígitos nacionales con +57', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+573001234567' })
    ).not.toThrow();
  });

  it('rechaza 9 dígitos nacionales (uno de menos)', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+57300123456' })
    ).toThrow();
  });

  it('rechaza 11 dígitos nacionales (uno de más)', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+5730012345678' })
    ).toThrow();
  });

  it('rechaza un número sin el código de país +57', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '3001234567' })
    ).toThrow();
  });

  it('rechaza un código de país distinto a +57', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+13001234567' })
    ).toThrow();
  });

  it('rechaza caracteres no numéricos', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+5730012345ab' })
    ).toThrow();
  });

  it('rechaza espacios dentro del número', () => {
    expect(() =>
      gatekeepingSchema.parse({ ...datosValidos, whatsapp: '+57 300 1234567' })
    ).toThrow();
  });
});

describe('rangos de facturación', () => {
  it('persiste el piso del rango y presenta su etiqueta', () => {
    expect(rangoACop('sin_facturacion')).toBe(0);
    expect(rangoACop('5_30m')).toBe(5_000_000);
    expect(rangoACop('mas_100m')).toBe(100_000_000);
    expect(rangoALabel('5_30m')).toBe('$5 a $30 millones al mes');
  });
});
