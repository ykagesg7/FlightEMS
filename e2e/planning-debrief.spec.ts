import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test.describe('Planning debrief tools', () => {
  test('imports a GPX track and shows replay controls', async ({ page }, testInfo) => {
    const gpxPath = testInfo.outputPath('sample-track.gpx');
    writeFileSync(
      gpxPath,
      `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Flight Academy Test">
  <trk><name>E2E Track</name><trkseg>
    <trkpt lat="35.0" lon="139.0"><ele>100</ele><time>2026-01-01T00:00:00Z</time></trkpt>
    <trkpt lat="35.1" lon="139.1"><ele>200</ele><time>2026-01-01T00:01:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`
    );

    await page.goto('/planning');
    await expect(page.getByRole('heading', { name: 'Debrief / 航跡' })).toBeVisible({ timeout: 60_000 });
    await page.locator('input[type="file"][accept=".gpx,.kml,.csv"]').setInputFiles(gpxPath);

    await expect(page.locator('input[value="E2E Track"]')).toBeVisible();
    await expect(page.getByRole('button', { name: '再生' })).toBeVisible();
    await expect(page.getByText('2 points')).toBeVisible();
    await page.getByRole('button', { name: /ファイル/ }).click();
    await expect(page.getByRole('menuitem', { name: '計画ルートを GPX 出力' })).toBeVisible();
  });
});
