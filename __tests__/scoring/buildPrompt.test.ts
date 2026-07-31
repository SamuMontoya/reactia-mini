import { describe, it, expect } from '@jest/globals';
import { SCORING_SYSTEM_PROMPT } from '@/lib/scoring/buildPrompt';

describe('SCORING_SYSTEM_PROMPT — redacción humanizada', () => {
  it('instruye a evitar el lenguaje de reporte corporativo', () => {
    expect(SCORING_SYSTEM_PROMPT).toMatch(/no como un informe generado por máquina/i);
    expect(SCORING_SYSTEM_PROMPT).toMatch(/se observa que/i);
    expect(SCORING_SYSTEM_PROMPT).toMatch(/en conclusión/i);
  });

  it('pide variar la estructura de las frases', () => {
    expect(SCORING_SYSTEM_PROMPT).toMatch(/varía la estructura de las frases/i);
  });

  it('pide preferir palabras concretas y cotidianas', () => {
    expect(SCORING_SYSTEM_PROMPT).toMatch(/palabras concretas y cotidianas/i);
  });

  it('conserva las reglas de idioma y jerga ya existentes', () => {
    expect(SCORING_SYSTEM_PROMPT).toMatch(/tuteo, registro colombiano/i);
    expect(SCORING_SYSTEM_PROMPT).toMatch(/prohibido el inglés y la jerga/i);
  });
});
