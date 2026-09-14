import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE_URL = process.env.HOME_VISUAL_BASE_URL ?? 'http://127.0.0.1:8080/';

test.use({
  viewport: { width: 1560, height: 884 },
  deviceScaleFactor: 1,
});

test('rendered home keeps approved static reference regions', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  const startButton = page.getByRole('button', { name: 'Empezar' });
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click();
    await page.getByLabel('Nombre del explorador').fill('Visual QA');
    await page.getByRole('button', { name: 'Crear perfil y entrar al mapa' }).click();
    await page.waitForURL(/\/play(?:$|\?)/, { timeout: 30_000 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  }

  const canvas = page.getByTestId('home-reference-canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box.width - 1536)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.height - 864)).toBeLessThanOrEqual(1);

  await fs.mkdir('artifacts', { recursive: true });
  await canvas.screenshot({ path: 'artifacts/home-render.png' });
});
