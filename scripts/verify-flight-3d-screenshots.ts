/**
 * One-off visual capture for PR #64 (not part of CI).
 * Usage: PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx tsx scripts/verify-flight-3d-screenshots.ts
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { createInitialFlightPlan } from '../src/pages/planning/createInitialFlightPlan';
import type { Airport, FlightPlan, RouteSegment, Waypoint } from '../src/types';
import { toPlanDocument } from '../src/utils/planDocument';
import { FLIGHT_PLAN_DRAFT_STORAGE_KEY } from '../src/pages/planning/flightPlanDraft';

const OUT = '/opt/cursor/artifacts';
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';

function airport(id: string, label: string, lat: number, lon: number, elevFt = 0): Airport {
  return {
    value: id,
    label,
    name: label,
    type: 'civilian',
    latitude: lat,
    longitude: lon,
    properties: { id, 'Elev(ft)': elevFt },
  };
}

function customWp(id: string, lat: number, lon: number): Waypoint {
  return {
    id,
    name: id,
    type: 'custom',
    coordinates: [lon, lat],
    latitude: lat,
    longitude: lon,
  };
}

function buildRjfaPlan(): FlightPlan {
  const base = createInitialFlightPlan();
  const departure = airport('RJFA', 'RJFA', 33.8814, 130.6517, 98);
  const arrival = airport('RJFZ', 'RJFZ', 33.685, 131.0403, 28);
  const waypoints = [customWp('wp1', 33.6381, 130.8067), customWp('wp2', 33.5981, 131.1881)];
  const seg = (from: string, to: string): RouteSegment => ({
    from,
    to,
    speed: 200,
    bearing: 0,
    altitude: 5000,
    eta: '',
    distance: 1,
    duration: '',
    fuelUsedLb: 0,
    fuelRemainingLb: 0,
    frequency: '',
  });
  const routeSegments = [seg('RJFA', 'wp1'), seg('wp1', 'wp2'), seg('wp2', 'RJFZ')];
  return { ...base, departure, arrival, waypoints, routeSegments, altitude: 5000, speed: 200 };
}

async function setRange(page: import('@playwright/test').Page, testId: string, value: number) {
  const slider = page.getByTestId(testId);
  await slider.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    input.value = String(v);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await page.waitForTimeout(500);
}

async function setProgress(page: import('@playwright/test').Page, pct: number) {
  const slider = page.getByRole('slider', { name: '再生位置' });
  await slider.fill(String(pct));
  await page.waitForTimeout(4000);
}

async function waitViewerReady(page: import('@playwright/test').Page) {
  const deadline = Date.now() + 15 * 60_000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      ready: Boolean(window.__flightViewer3dReady),
      err: window.__flightViewer3dError ?? null,
      playEnabled: (() => {
        const btn = document.querySelector('[data-testid="flight-viewer-play"]');
        return btn instanceof HTMLButtonElement && !btn.disabled;
      })(),
      cesiumErr: document.querySelector('.cesium-widget-errorPanel')?.textContent?.trim() ?? null,
    }));
    if (state.err) throw new Error(`FlightViewer3D: ${state.err}`);
    if (state.cesiumErr) throw new Error(`Cesium: ${state.cesiumErr}`);
    if (state.ready || state.playEnabled) return;
    await page.waitForTimeout(1500);
  }
  throw new Error('3D viewer did not become ready within 15 minutes');
}

async function scrubPlaybackNoCrash(page: import('@playwright/test').Page, label: string) {
  for (const pct of [0, 25, 50, 75, 100]) {
    await setProgress(page, pct);
    const err = await page.evaluate(() => window.__flightViewer3dError ?? null);
    if (err) throw new Error(`${label} @${pct}%: ${err}`);
  }
}

async function shot(page: import('@playwright/test').Page, name: string) {
  await page.locator('[data-testid="flight-viewer-3d"] canvas').screenshot({
    path: `${OUT}/${name}.png`,
    timeout: 60_000,
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const doc = toPlanDocument(buildRjfaPlan());
  const draftJson = JSON.stringify(doc);

  const headed = Boolean(process.env.DISPLAY);
  const browser = await chromium.launch({
    headless: !headed,
    args: headed
      ? ['--enable-webgl']
      : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.setDefaultTimeout(180_000);
  page.setDefaultNavigationTimeout(180_000);

  page.on('console', (m) => {
    if (m.type() === 'error' && m.text().includes('normalized')) {
      console.error('CONSOLE', m.text());
    }
  });

  await page.addInitScript(
    ({ key, json }) => {
      localStorage.setItem(key, json);
    },
    { key: FLIGHT_PLAN_DRAFT_STORAGE_KEY, json: draftJson },
  );

  await page.addInitScript(() => {
    performance.mark('flight-3d-nav-start');
    window.__flightViewer3dNavStartMs = performance.now();
  });
  const navStart = Date.now();
  await page.goto(`${BASE}/planning?mode=plan`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  const details3d = page.locator('details').filter({
    has: page.locator('summary', { hasText: '3D ルートプレビュー' }),
  });
  await details3d.locator('summary').click({ timeout: 60_000 });
  await waitViewerReady(page);
  const timings = await page.evaluate(() => ({
    chunkMs: window.__flightViewer3dChunkMs ?? null,
    controlsMs: window.__flightViewer3dControlsReadyMs ?? null,
  }));
  const controlsWallMs = Date.now() - navStart;
  console.log('timings', { ...timings, controlsWallMs });
  if (controlsWallMs > 15_000) {
    console.warn(`WARN: controls enabled after ${controlsWallMs}ms (target <= 15000)`);
  }
  console.log('viewer ready');
  await page.getByTestId('flight-viewer-mode-gsi').click();
  await page.waitForTimeout(12_000);

  await page.getByTestId('flight-viewer-camera-chase').click();
  await scrubPlaybackNoCrash(page, 'chase-initial');
  await setRange(page, 'flight-viewer-chase-distance', 650);
  await setRange(page, 'flight-viewer-chase-pitch', -18);
  for (const [pct, name] of [[15, 'chase-650-15pct'], [50, 'chase-650-50pct']] as const) {
    await setProgress(page, pct);
    await shot(page, name);
  }

  await setRange(page, 'flight-viewer-chase-distance', 3000);
  await setRange(page, 'flight-viewer-chase-pitch', -75);
  await setProgress(page, 50);
  await shot(page, 'chase-3000-75-50pct');
  await scrubPlaybackNoCrash(page, 'chase-3000');

  await page.getByTestId('flight-viewer-camera-cockpit').click();
  await page.waitForTimeout(10_000);
  for (const [pct, name] of [
    [15, 'cockpit-15pct'],
    [45, 'cockpit-45pct'],
    [80, 'cockpit-80pct'],
    [100, 'cockpit-100pct'],
  ] as const) {
    await setProgress(page, pct);
    await shot(page, name);
  }
  await scrubPlaybackNoCrash(page, 'cockpit');

  await browser.close();
  console.log('Screenshots written to', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
