import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE_URL = process.env.HOME_VISUAL_BASE_URL ?? 'http://127.0.0.1:8080/';

const VIEWPORTS = [
  [480, 270, 'compact-min'],
  [568, 320, 'compact-small'],
  [854, 480, 'compact-wide'],
  [1024, 768, 'regular-4x3'],
  [1280, 800, 'regular-16x10'],
  [1536, 864, 'regular-reference'],
  [1920, 1080, 'expanded'],
  [2400, 1080, 'expanded-max'],
];

const DESTINATIONS = ['Mapa', 'Arcade', 'Mi dinero', 'Inversiones', 'Tienda', 'Colección'];

async function ensureProfile(page) {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const startButton = page.getByRole('button', { name: 'Empezar' });
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click();
    await page.getByLabel('Nombre del explorador').fill('Visual QA');
    await page.getByRole('button', { name: 'Crear perfil y entrar al mapa' }).click();
    await page.waitForURL(/\/play\/?(?:$|[?#])/, { timeout: 90_000 });
  }
}

test('Home is layered, responsive and tappable from compact-min through expanded-max', async ({ page }) => {
  test.setTimeout(120_000);
  await ensureProfile(page);
  await fs.mkdir('artifacts', { recursive: true });

  for (const [width, height, label] of VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const scene = page.getByTestId('home-scene-layout');
    const background = page.getByTestId('home-background-layer');
    const controls = page.getByTestId('home-controls-layer');
    const panel = page.getByTestId('home-destination-panel');
    const mission = page.getByTestId('home-mission-card');

    await expect(scene, `${label}: scene`).toBeVisible({ timeout: 30_000 });
    await expect(background, `${label}: background`).toBeVisible();
    await expect(controls, `${label}: controls`).toBeVisible();
    await expect(panel, `${label}: destination panel`).toBeVisible();
    await expect(mission, `${label}: mission`).toBeVisible();

    const sceneBox = await scene.boundingBox();
    expect(sceneBox, `${label}: scene box`).not.toBeNull();
    expect(sceneBox.width, `${label}: scene width`).toBeLessThanOrEqual(width + 1);
    expect(sceneBox.height, `${label}: scene height`).toBeLessThanOrEqual(height + 1);

    const destinationBoxes = [];
    for (const name of DESTINATIONS) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button, `${label}: ${name}`).toBeVisible();
      const box = await button.boundingBox();
      expect(box, `${label}: ${name} box`).not.toBeNull();
      expect(box.width, `${label}: ${name} width`).toBeGreaterThanOrEqual(48);
      expect(box.height, `${label}: ${name} height`).toBeGreaterThanOrEqual(48);
      expect(box.x, `${label}: ${name} left`).toBeGreaterThanOrEqual(-1);
      expect(box.y, `${label}: ${name} top`).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width, `${label}: ${name} right`).toBeLessThanOrEqual(width + 1);
      expect(box.y + box.height, `${label}: ${name} bottom`).toBeLessThanOrEqual(height + 1);
      destinationBoxes.push({ name, ...box });
    }

    for (let i = 0; i < destinationBoxes.length; i += 1) {
      for (let j = i + 1; j < destinationBoxes.length; j += 1) {
        const a = destinationBoxes[i];
        const b = destinationBoxes[j];
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        expect(overlapX <= 0 || overlapY <= 0, `${label}: ${a.name}/${b.name} must not overlap`).toBeTruthy();
      }
    }

    const missionButton = page.getByRole('button', { name: 'Ir a mi misión actual' });
    await expect(missionButton, `${label}: mission CTA`).toBeVisible();
    const missionBox = await missionButton.boundingBox();
    expect(missionBox).not.toBeNull();
    expect(missionBox.width, `${label}: mission CTA width`).toBeGreaterThanOrEqual(48);
    expect(missionBox.height, `${label}: mission CTA height`).toBeGreaterThanOrEqual(48);

    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth - window.innerWidth,
      height: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow.width, `${label}: horizontal overflow`).toBeLessThanOrEqual(1);
    expect(overflow.height, `${label}: vertical overflow`).toBeLessThanOrEqual(1);

    await page.screenshot({ path: `artifacts/home-${label}-${width}x${height}.png`, fullPage: false });

    if (label === 'regular-reference') {
      await page.getByRole('button', { name: 'Inversiones', exact: true }).screenshot({
        path: 'artifacts/home-inversiones-reference-crop.png',
      });
      await page.getByRole('button', { name: 'Tienda', exact: true }).screenshot({
        path: 'artifacts/home-tienda-reference-crop.png',
      });
    }
  }
});
