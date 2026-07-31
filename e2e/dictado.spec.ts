import { test, expect } from '@playwright/test';

const LEAD_ID = 'e2e-dictado-lead';

/** Installed before every navigation in the tests that need it — a fake Web
 *  Speech API, driven manually from the test via `window.__lastRecognition`,
 *  rather than a real (unavailable in CI, non-deterministic on-device) one. */
async function instalarReconocimientoFalso(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {}
      stop() {}
      constructor() {
        (window as unknown as { __lastRecognition: unknown }).__lastRecognition = this;
      }
    }
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      FakeSpeechRecognition;
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition =
      FakeSpeechRecognition;
  });
}

/** Fires an interim (non-final) result on whichever fake recognition
 *  instance is currently active. */
async function dictarInterino(page: import('@playwright/test').Page, transcript: string) {
  await page.evaluate((texto) => {
    const recognition = (
      window as unknown as {
        __lastRecognition: { onresult: (event: unknown) => void };
      }
    ).__lastRecognition;
    recognition.onresult({
      resultIndex: 0,
      results: [{ 0: { transcript: texto }, isFinal: false }],
    });
  }, transcript);
}

/**
 * Seeds a lead and a one-question draft so the wizard opens straight on the
 * `descripcion_negocio` "texto" question — the one with the Dictar button —
 * instead of walking through the full 12-question form on every run.
 */
async function abrirPreguntaDeTexto(page: import('@playwright/test').Page) {
  await page.addInitScript(
    ([leadId]) => {
      localStorage.setItem(
        'reactia_lead',
        JSON.stringify({
          leadId,
          deviceId: 'e2e-device',
          nombre: 'Test',
          empresa: 'TestCo',
          whatsapp: '573000000000',
        })
      );
      localStorage.setItem(
        `reactia_diagnostico:${leadId}`,
        JSON.stringify({
          respuestas: { modelo_tipo_negocio: 'producto' },
          paso: 1,
          guardadoEn: 1700000000000,
        })
      );
    },
    [LEAD_ID]
  );

  await page.goto('/reactia-mini/diagnostico');
  await page.getByRole('button', { name: 'Continuar donde quedé' }).click();
  await expect(page.getByText('Cuéntanos sobre tu negocio')).toBeVisible();
}

test.describe('Botón de dictado en preguntas de texto', () => {
  test('el botón de dictado y su help text comparten fila, arriba del textarea', async ({
    page,
  }) => {
    await abrirPreguntaDeTexto(page);

    const boton = page.getByRole('button', { name: 'Dictar' });
    const ayuda = page.getByText('Toca para dictar o escribe abajo con teclado.');
    const textarea = page.getByRole('textbox');

    await expect(boton).toBeVisible();
    await expect(ayuda).toBeVisible();
    await expect(textarea).toBeVisible();

    const [botonBox, ayudaBox, textareaBox] = await Promise.all([
      boton.boundingBox(),
      ayuda.boundingBox(),
      textarea.boundingBox(),
    ]);

    expect(botonBox).not.toBeNull();
    expect(ayudaBox).not.toBeNull();
    expect(textareaBox).not.toBeNull();

    // Same row: within a few px of each other vertically...
    expect(Math.abs(botonBox!.y - ayudaBox!.y)).toBeLessThan(12);
    // ...and both above the textarea (smaller y = higher on screen).
    expect(botonBox!.y).toBeLessThan(textareaBox!.y);
    expect(ayudaBox!.y).toBeLessThan(textareaBox!.y);
  });

  test('el botón es primario ámbar sólido, no un outline', async ({ page }) => {
    await abrirPreguntaDeTexto(page);

    const boton = page.getByRole('button', { name: 'Dictar' });
    const color = await boton.evaluate((el) => getComputedStyle(el).color);
    const backgroundColor = await boton.evaluate((el) => getComputedStyle(el).backgroundColor);

    // --color-amber: #c8860a as a solid fill, --color-white: #fdfcfa text —
    // not an outline with amber-on-transparent text.
    expect(color).toBe('rgb(253, 252, 250)');
    expect(backgroundColor).toBe('rgb(200, 134, 10)');
  });

  test('sin soporte de dictado, tocar el botón deja el foco en el textarea', async ({ page }) => {
    // Force the "unsupported browser" branch: no SpeechRecognition ctor.
    await page.addInitScript(() => {
      // @ts-expect-error - deliberately removing these for the test
      delete window.SpeechRecognition;
      // @ts-expect-error - deliberately removing these for the test
      delete window.webkitSpeechRecognition;
    });

    await abrirPreguntaDeTexto(page);

    await page.getByRole('button', { name: 'Dictar' }).click();
    await expect(page.getByRole('textbox')).toBeFocused();
    await expect(page.getByText(/Toca el ícono del micrófono en tu teclado/i)).toBeVisible();
  });

  test('tocar el botón para detener el dictado a mitad de frase no pierde lo dicho', async ({
    page,
  }) => {
    await instalarReconocimientoFalso(page);
    await abrirPreguntaDeTexto(page);

    await page.getByRole('button', { name: 'Dictar' }).click();
    await dictarInterino(page, 'vendo software para restaurantes');

    // Tap again mid-utterance — the manual stop path that used to drop
    // whatever hadn't gone "final" yet.
    await page.getByRole('button', { name: /Escuchando/ }).click();

    await expect(page.getByRole('textbox')).toHaveValue('vendo software para restaurantes');
  });

  test('no se puede avanzar mientras el dictado sigue activo', async ({ page }) => {
    await instalarReconocimientoFalso(page);
    await abrirPreguntaDeTexto(page);

    const siguiente = page.getByRole('button', { name: 'Siguiente' });
    await expect(siguiente).toBeEnabled();

    await page.getByRole('button', { name: 'Dictar' }).click();
    await expect(siguiente).toBeDisabled();
    await expect(page.getByText('Detén el dictado para continuar.')).toBeVisible();

    await page.getByRole('button', { name: /Escuchando/ }).click();
    await expect(siguiente).toBeEnabled();
  });
});
