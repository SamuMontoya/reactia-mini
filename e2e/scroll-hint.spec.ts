import { test, expect } from '@playwright/test';

test.describe('Indicador de scroll en móvil', () => {
  // Set explicitly rather than relying on which project (mobile/desktop) runs
  // this file — the hint's visibility is a CSS breakpoint (`sm:hidden`), so
  // what matters here is viewport width, not which Playwright device profile
  // happens to be active.
  test.use({ viewport: { width: 390, height: 844 } });

  test('aparece en una página larga, sigue visible en scroll parcial, y solo desaparece cerca del final', async ({
    page,
  }) => {
    await page.goto('/reactia-mini/gatekeeping');

    const hint = page.locator('.ds-scroll-hint');
    await expect(hint).toBeVisible();

    // Not a "dismiss on first scroll" hint — pausing partway down a long
    // page must not make it disappear while there's still plenty below.
    await page.mouse.wheel(0, 150);
    await expect(hint).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(hint).toBeHidden();

    // Scrolling back away from the bottom brings it back.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(hint).toBeVisible();
  });

  test('se oculta en cuanto asoma el footer real del sitio, sin esperar a que quede completamente visible', async ({
    page,
  }) => {
    await page.goto('/reactia-mini/gatekeeping');

    const hint = page.locator('.ds-scroll-hint');
    await expect(hint).toBeVisible();

    const footerTop = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.getBoundingClientRect().top + window.scrollY : null;
    });
    expect(footerTop).not.toBeNull();

    // Scroll to just barely reveal the footer's top edge, not all the way
    // to the actual end of the document.
    await page.evaluate((y) => window.scrollTo(0, y - 20), footerTop as number);
    await expect(hint).toBeHidden();
  });

  test('no aparece cuando toda la página cabe en pantalla', async ({ page }) => {
    // A single question step is short enough on most viewports to fit
    // without scrolling once the draft-resume decision is skipped.
    await page.addInitScript(() => {
      localStorage.setItem(
        'reactia_lead',
        JSON.stringify({
          leadId: 'e2e-scroll-lead',
          deviceId: 'e2e-device',
          nombre: 'Test',
          empresa: 'TestCo',
          whatsapp: '573000000000',
        })
      );
    });
    await page.goto('/reactia-mini/no-calificas?leadId=e2e-scroll-lead');

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);

    if (scrollHeight - clientHeight <= 120) {
      await expect(page.locator('.ds-scroll-hint')).toHaveCount(0);
    }
  });
});

test.describe('Indicador de scroll — solo en móvil', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('no se muestra en desktop aunque la página sea larga', async ({ page }) => {
    await page.goto('/reactia-mini/gatekeeping');
    await expect(page.locator('.ds-scroll-hint')).toBeHidden();
  });
});

test.describe('Indicador de scroll — aparece tras cambiar de pregunta sin recargar', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('detecta el overflow de una pregunta con muchas opciones, llegado por navegación cliente (sin recarga), y lo posiciona sobre el nav sticky', async ({
    page,
  }) => {
    const leadId = 'e2e-swap-overflow-lead';
    await page.addInitScript(
      ([id]) => {
        localStorage.setItem(
          'reactia_lead',
          JSON.stringify({
            leadId: id,
            deviceId: 'e2e-device',
            nombre: 'Test',
            empresa: 'TestCo',
            whatsapp: '573000000000',
          })
        );
        // `origen_clientes` (5 stacked options) with "otro" picked, so its
        // companion text field is also showing — tall enough on a real
        // phone viewport to overflow.
        localStorage.setItem(
          `reactia_diagnostico:${id}`,
          JSON.stringify({
            respuestas: {
              modelo_tipo_negocio: 'producto',
              descripcion_negocio: 'Vendo software para negocios pequeños en Bogotá.',
              origen_clientes: 'otro',
              origen_clientes_otro: 'Alianzas con gremios locales',
            },
            paso: 5,
            guardadoEn: 1700000000000,
          })
        );
      },
      [leadId]
    );

    await page.goto('/reactia-mini/diagnostico');
    // Reaching the question is itself a client-side state swap (modal ->
    // question), not a fresh navigation — exactly the case a plain
    // ResizeObserver on `document.documentElement` can't see.
    await page.getByRole('button', { name: 'Continuar donde quedé' }).click();
    await expect(page.getByText('¿De dónde llegan hoy la mayoría de tus clientes?')).toBeVisible();

    const hint = page.locator('.ds-scroll-hint');
    await expect(hint).toBeVisible();

    const nav = page.getByRole('button', { name: 'Siguiente' }).locator('..');
    const [hintBox, navBox] = await Promise.all([hint.boundingBox(), nav.boundingBox()]);
    expect(hintBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    // The hint sits above the sticky nav bar, not overlapping/behind it.
    expect(hintBox!.y + hintBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
  });
});

test.describe('Indicador de scroll — offset del nav sticky del wizard', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('reserva el alto del nav sticky de preguntas, y lo libera al salir de esa página', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'reactia_lead',
        JSON.stringify({
          leadId: 'e2e-offset-lead',
          deviceId: 'e2e-device',
          nombre: 'Test',
          empresa: 'TestCo',
          whatsapp: '573000000000',
        })
      );
    });

    await page.goto('/reactia-mini/diagnostico');
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible();

    const offsetEnPregunta = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--scroll-hint-offset')
        .trim()
    );
    expect(offsetEnPregunta).toMatch(/^\d+(\.\d+)?px$/);
    expect(parseFloat(offsetEnPregunta)).toBeGreaterThan(0);

    // A page with no sticky bottom bar of its own must not inherit one.
    await page.goto('/reactia-mini/gatekeeping');
    const offsetFuera = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--scroll-hint-offset')
        .trim()
    );
    expect(offsetFuera).toBe('');
  });
});
