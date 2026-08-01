import { describe, it, expect, afterEach } from '@jest/globals';

/**
 * `config` snapshots process.env at module load, so each case re-imports the
 * module in isolation with the env it wants — this exercises the real
 * implementation rather than the mirrored copy the scoring tests mock in.
 */
const loadConfig = (openRouterKey: string | undefined) => {
  let mod!: typeof import('@/config');
  jest.isolateModules(() => {
    if (openRouterKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = openRouterKey;
    mod = require('@/config') as typeof import('@/config');
  });
  return mod;
};

const originalKey = process.env.OPENROUTER_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = originalKey;
});

describe('isOpenRouterConfigured', () => {
  it('es true con una llave real', () => {
    expect(loadConfig('sk-or-v1-una-llave-real').isOpenRouterConfigured()).toBe(true);
  });

  it('es false cuando la variable no existe', () => {
    expect(loadConfig(undefined).isOpenRouterConfigured()).toBe(false);
  });

  it('es false con cadena vacía o solo espacios', () => {
    expect(loadConfig('').isOpenRouterConfigured()).toBe(false);
    expect(loadConfig('   ').isOpenRouterConfigured()).toBe(false);
  });

  it('es false con el placeholder que queda sembrado en Vercel', () => {
    const mod = loadConfig('PENDIENTE_CONFIGURAR');
    expect(mod.isOpenRouterConfigured()).toBe(false);
    // Same sentinel the WhatsApp number uses — one string, one meaning.
    expect(mod.WHATSAPP_PLACEHOLDER).toBe('PENDIENTE_CONFIGURAR');
  });
});
