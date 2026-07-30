import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  clearDraft,
  draftEstaCompleto,
  draftTieneRespuestas,
  getDraft,
  pasoDesdeDraft,
  saveDraft,
  type DiagnosticoDraft,
} from '@/lib/storage/diagnosticoDraft';

const LEAD_ID = 'lead-1';

beforeEach(() => {
  localStorage.clear();
});

describe('saveDraft / getDraft / clearDraft', () => {
  it('guarda y recupera un borrador con su marca de tiempo', () => {
    const timestamp = saveDraft(LEAD_ID, {
      respuestas: { modelo_tipo_negocio: 'producto' },
      paso: 2,
    });

    expect(typeof timestamp).toBe('number');

    const draft = getDraft(LEAD_ID);
    expect(draft).toEqual({
      respuestas: { modelo_tipo_negocio: 'producto' },
      paso: 2,
      guardadoEn: timestamp,
    });
  });

  it('devuelve null cuando no hay borrador guardado', () => {
    expect(getDraft('lead-sin-borrador')).toBeNull();
  });

  it('mantiene borradores de distintos leads separados', () => {
    saveDraft('lead-a', { respuestas: { modelo_tipo_negocio: 'producto' }, paso: 0 });
    saveDraft('lead-b', { respuestas: { modelo_tipo_negocio: 'servicio' }, paso: 5 });

    expect(getDraft('lead-a')?.respuestas.modelo_tipo_negocio).toBe('producto');
    expect(getDraft('lead-b')?.respuestas.modelo_tipo_negocio).toBe('servicio');
  });

  it('clearDraft elimina solo el borrador del lead indicado', () => {
    saveDraft('lead-a', { respuestas: { modelo_tipo_negocio: 'producto' }, paso: 0 });
    saveDraft('lead-b', { respuestas: { modelo_tipo_negocio: 'servicio' }, paso: 0 });

    clearDraft('lead-a');

    expect(getDraft('lead-a')).toBeNull();
    expect(getDraft('lead-b')).not.toBeNull();
  });

  it('ignora un valor corrupto en localStorage en vez de lanzar', () => {
    localStorage.setItem('reactia_diagnostico:lead-1', '{esto no es json válido');
    expect(getDraft(LEAD_ID)).toBeNull();
  });

  it('rellena paso/guardadoEn con 0 si faltan en el JSON guardado', () => {
    localStorage.setItem(
      'reactia_diagnostico:lead-1',
      JSON.stringify({ respuestas: { modelo_tipo_negocio: 'producto' } })
    );
    expect(getDraft(LEAD_ID)).toEqual({
      respuestas: { modelo_tipo_negocio: 'producto' },
      paso: 0,
      guardadoEn: 0,
    });
  });
});

describe('draftTieneRespuestas', () => {
  it('es falso para un borrador sin ninguna respuesta', () => {
    const draft: DiagnosticoDraft = { respuestas: {}, paso: 0, guardadoEn: 1 };
    expect(draftTieneRespuestas(draft)).toBe(false);
  });

  it('es verdadero en cuanto hay al menos una respuesta', () => {
    const draft: DiagnosticoDraft = {
      respuestas: { modelo_tipo_negocio: 'producto' },
      paso: 0,
      guardadoEn: 1,
    };
    expect(draftTieneRespuestas(draft)).toBe(true);
  });
});

describe('draftEstaCompleto', () => {
  const PREGUNTA_IDS = ['modelo_tipo_negocio', 'descripcion_negocio', 'ticket_promedio_cop'];

  it('es falso si respondieron menos preguntas que el total', () => {
    const draft: DiagnosticoDraft = {
      respuestas: { modelo_tipo_negocio: 'producto' },
      paso: 0,
      guardadoEn: 1,
    };
    expect(draftEstaCompleto(draft, PREGUNTA_IDS as never)).toBe(false);
  });

  it('es verdadero cuando todas las preguntas principales tienen respuesta', () => {
    const draft = {
      respuestas: {
        modelo_tipo_negocio: 'producto',
        descripcion_negocio: 'Vendemos software',
        ticket_promedio_cop: 500000,
      },
      paso: 11,
      guardadoEn: 1,
    } as unknown as DiagnosticoDraft;
    expect(draftEstaCompleto(draft, PREGUNTA_IDS as never)).toBe(true);
  });

  it('no cuenta un campo "otro" adicional como si fuera una pregunta principal respondida', () => {
    // Bug real: contar Object.keys(respuestas) contra el total permitía que
    // un campo companion de "otro" (una key extra que no es una pregunta
    // principal) inflara el conteo y marcara el borrador como completo con
    // una pregunta principal real todavía sin responder.
    const draft = {
      respuestas: {
        modelo_tipo_negocio: 'producto',
        descripcion_negocio: 'Vendemos software',
        // ticket_promedio_cop sin responder
        origen_clientes_otro: 'Alianzas con contadores',
      },
      paso: 11,
      guardadoEn: 1,
    } as unknown as DiagnosticoDraft;
    expect(draftEstaCompleto(draft, PREGUNTA_IDS as never)).toBe(false);
  });
});

describe('pasoDesdeDraft', () => {
  it('devuelve el paso guardado cuando está dentro de rango', () => {
    const draft: DiagnosticoDraft = { respuestas: {}, paso: 5, guardadoEn: 1 };
    expect(pasoDesdeDraft(draft, 12)).toBe(5);
  });

  it('limita al último índice válido si el borrador apunta más allá del total actual', () => {
    const draft: DiagnosticoDraft = { respuestas: {}, paso: 50, guardadoEn: 1 };
    expect(pasoDesdeDraft(draft, 12)).toBe(11);
  });

  it('nunca devuelve un índice negativo', () => {
    const draft: DiagnosticoDraft = { respuestas: {}, paso: -3, guardadoEn: 1 };
    expect(pasoDesdeDraft(draft, 12)).toBe(0);
  });
});
