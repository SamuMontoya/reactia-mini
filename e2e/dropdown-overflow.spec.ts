import { test, expect } from '@playwright/test';

test.describe('Difuminado del sheet de opciones cuando tiene overflow', () => {
  // Short enough that `max-h-[80vh]` (≈320px here) caps the option list
  // below its own content height, forcing real internal scroll — the exact
  // "hay overflow en las opciones" case the page-level ScrollHint never saw,
  // since that only ever watched `document.documentElement`.
  test.use({ viewport: { width: 390, height: 400 } });

  test('muestra su propio difuminado y flecha, independientes del indicador de página', async ({
    page,
  }) => {
    await page.goto('/reactia-mini/gatekeeping');
    // The button's accessible name comes from its `aria-labelledby` (the
    // question text), not its visible placeholder text — see Dropdown.tsx.
    await page.getByRole('button', { name: '¿Cuánto factura tu negocio al mes?' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const fade = dialog.locator('.ds-dropdown-fade');
    await expect(fade).toBeVisible();
    await expect(fade.locator('.ds-scroll-hint')).toBeVisible();

    // Scrolling the sheet itself to its end hides its own fade — this is
    // the sheet's local scroll position, unrelated to the page underneath.
    await dialog.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await expect(fade).toBeHidden();
  });

  test('no aparece si el sheet no tiene overflow', async ({ page }) => {
    // A tall viewport gives max-h-[80vh] enough room for every option.
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/reactia-mini/gatekeeping');
    // The button's accessible name comes from its `aria-labelledby` (the
    // question text), not its visible placeholder text — see Dropdown.tsx.
    await page.getByRole('button', { name: '¿Cuánto factura tu negocio al mes?' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.ds-dropdown-fade')).toHaveCount(0);
  });
});
