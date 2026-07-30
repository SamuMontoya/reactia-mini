import { describe, it, expect } from '@jest/globals';
import {
  AREA_WEIGHTS,
  computeOverallScore,
  scoreColor,
  scoreVeredicto,
} from '@/app/reactia-mini/resultado/scoreScale';

describe('AREA_WEIGHTS', () => {
  it('suma exactamente 1.0', () => {
    const total = Object.values(AREA_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

describe('computeOverallScore', () => {
  it('calcula el promedio ponderado y lo redondea', () => {
    const score = computeOverallScore({
      modelo: 50,
      oferta: 60,
      clientes: 70,
      operaciones: 30,
      procesos: 60,
      metricas: 80,
    });
    // 50*.2 + 60*.4 + 70*.2 + 30*.1 + 60*.1 + 80*0 = 10+24+14+3+6+0 = 57
    expect(score).toBe(57);
  });

  it('trata un área faltante como 0 en vez de lanzar', () => {
    const score = computeOverallScore({
      modelo: 100,
      oferta: 100,
      clientes: 100,
    } as never);
    // Solo modelo(.2) + oferta(.4) + clientes(.2) tienen valor = 80% de 100
    expect(score).toBe(80);
  });

  it('da 0 cuando todas las áreas son 0', () => {
    expect(
      computeOverallScore({
        modelo: 0,
        oferta: 0,
        clientes: 0,
        operaciones: 0,
        procesos: 0,
        metricas: 0,
      })
    ).toBe(0);
  });

  it('da 100 cuando todas las áreas son 100', () => {
    expect(
      computeOverallScore({
        modelo: 100,
        oferta: 100,
        clientes: 100,
        operaciones: 100,
        procesos: 100,
        metricas: 100,
      })
    ).toBe(100);
  });
});

describe('scoreColor / scoreVeredicto — límites de banda', () => {
  it('39 es rojo/bajo, 40 ya no', () => {
    expect(scoreColor(39)).toBe('var(--color-alerta)');
    expect(scoreColor(40)).not.toBe('var(--color-alerta)');
    expect(scoreVeredicto(39)).toBe('¡Hay mucho por ordenar!');
    expect(scoreVeredicto(40)).not.toBe('¡Hay mucho por ordenar!');
  });

  it('70 sigue en la banda media, 71 ya es la alta', () => {
    expect(scoreColor(70)).toBe('var(--color-naranja)');
    expect(scoreColor(71)).toBe('var(--color-exito)');
    expect(scoreVeredicto(70)).toBe('¡Vas por buen camino!');
    expect(scoreVeredicto(71)).toBe('¡Vas sólido!');
  });
});
