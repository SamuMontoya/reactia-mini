import { describe, it, expect } from '@jest/globals';
import { buildMensajeDiagnostico } from '@/app/reactia-mini/resultado/mensajeWhatsApp';
import type { StoredLead } from '@/lib/storage/leadStorage';

const LEAD: StoredLead = {
  leadId: 'lead-1',
  deviceId: 'device-1',
  nombre: 'María',
  empresa: 'Tech Solutions',
  whatsapp: '+573001234567',
};

describe('buildMensajeDiagnostico', () => {
  it('incluye nombre, empresa, score, cuello de botella y el id del resultado', () => {
    const mensaje = buildMensajeDiagnostico({
      lead: LEAD,
      cuelloBotella: 'oferta',
      score: 57,
      resultadoId: 'res-123',
    });

    expect(mensaje).toContain('María');
    expect(mensaje).toContain('Tech Solutions');
    expect(mensaje).toContain('57 de 100');
    expect(mensaje).toContain('res-123');
  });

  it('omite la línea de nombre/empresa cuando lead es null (sin lanzar)', () => {
    const mensaje = buildMensajeDiagnostico({
      lead: null,
      cuelloBotella: 'oferta',
      score: 57,
      resultadoId: 'res-123',
    });

    expect(mensaje).not.toContain('Soy');
    expect(mensaje).toContain('57 de 100');
  });

  it('omite la línea de nombre/empresa cuando lead es undefined (useLead aún cargando)', () => {
    const mensaje = buildMensajeDiagnostico({
      lead: undefined,
      cuelloBotella: 'oferta',
      score: 57,
      resultadoId: 'res-123',
    });

    expect(mensaje).not.toContain('Soy');
  });

  it('no agrega "de <empresa>" cuando el lead no tiene empresa', () => {
    const mensaje = buildMensajeDiagnostico({
      lead: { ...LEAD, empresa: '' },
      cuelloBotella: 'oferta',
      score: 57,
      resultadoId: 'res-123',
    });

    expect(mensaje).toContain('Soy María.');
    expect(mensaje).not.toContain(' de .');
  });
});
