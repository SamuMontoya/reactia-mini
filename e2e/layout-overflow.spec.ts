import { test, expect } from '@playwright/test';

const LEAD_ID = 'e2e-overflow-lead';

/** Every width the funnel realistically meets, from an iPhone SE up. */
const WIDTHS = [320, 360, 390, 430, 768, 1280];

const RUTAS: Array<[string, string]> = [
  ['landing', '/reactia-mini'],
  ['gatekeeping', '/reactia-mini/gatekeeping'],
  ['diagnostico', '/reactia-mini/diagnostico'],
  ['no-calificas', `/reactia-mini/no-calificas?leadId=${LEAD_ID}`],
];

async function sembrarEstado(page: import('@playwright/test').Page) {
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
      // paso 11 = the last question, whose nav shows the longest label pair
      // ("Anterior" + "Revisar respuestas") — the combination that used to
      // push the primary button past the right edge on a phone. A saved
      // draft also makes the landing render its draft card, the other thing
      // that overflowed.
      localStorage.setItem(
        `reactia_diagnostico:${leadId}`,
        JSON.stringify({
          respuestas: { modelo_tipo_negocio: 'producto' },
          paso: 11,
          guardadoEn: 1700000000000,
        })
      );
    },
    [LEAD_ID]
  );
}

test.describe('Ninguna pantalla desborda horizontalmente', () => {
  for (const width of WIDTHS) {
    test.describe(`a ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } });

      for (const [nombre, ruta] of RUTAS) {
        test(`${nombre} cabe en el viewport`, async ({ page }) => {
          await sembrarEstado(page);
          await page.goto(ruta);

          const continuar = page.getByRole('button', { name: 'Continuar donde quedé' });
          if (await continuar.count()) await continuar.click();
          await page.waitForTimeout(300);

          const { scrollWidth, innerWidth, desbordados } = await page.evaluate(() => {
            const desbordados: string[] = [];
            document.querySelectorAll('button, a, input, textarea, h1, h2, p').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width === 0) return;
              if (r.right > window.innerWidth + 1 || r.left < -1) {
                desbordados.push(
                  `${el.tagName}:${(el.textContent ?? '').trim().slice(0, 30)} [${Math.round(r.left)}..${Math.round(r.right)}]`
                );
              }
            });
            return {
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth,
              desbordados,
            };
          });

          expect(desbordados, `elementos fuera del viewport en ${nombre}`).toEqual([]);
          expect(scrollWidth, `scroll horizontal en ${nombre}`).toBeLessThanOrEqual(innerWidth);
        });
      }
    });
  }
});

test.describe('Nav del wizard en la última pregunta', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('los dos botones respetan el margen del contenedor', async ({ page }) => {
    await sembrarEstado(page);
    await page.goto('/reactia-mini/diagnostico');
    await page.getByRole('button', { name: 'Continuar donde quedé' }).click();
    await expect(page.getByText('Pregunta 12 de 12')).toBeVisible();

    const anterior = page.getByRole('button', { name: 'Anterior' });
    const avanzar = page.getByRole('button', { name: /Revisar/ });

    const [boxAnterior, boxAvanzar] = await Promise.all([
      anterior.boundingBox(),
      avanzar.boundingBox(),
    ]);
    expect(boxAnterior).not.toBeNull();
    expect(boxAvanzar).not.toBeNull();

    // .ds-container's gutter is 1.25rem = 20px on a phone.
    expect(boxAnterior!.x).toBeGreaterThanOrEqual(19);
    expect(boxAvanzar!.x + boxAvanzar!.width).toBeLessThanOrEqual(390 - 19);
    // And they must not run into each other.
    expect(boxAvanzar!.x).toBeGreaterThan(boxAnterior!.x + boxAnterior!.width);
  });
});
