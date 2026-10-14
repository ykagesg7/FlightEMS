/**
 * GSI DEM 周防灘沖の海面段差 — before/after 用（PR #72）。
 * Usage: PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 GSI_SEA_SHOT_TAG=before npx tsx scripts/verify-gsi-sea-rjfz-screenshots.ts
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { createInitialFlightPlan } from '../src/pages/planning/createInitialFlightPlan';
import type { Airport, FlightPlan, RouteSegment, Waypoint } from '../src/types';
import { toPlanDocument } from '../src/utils/planDocument';
import { FLIGHT_PLAN_DRAFT_STORAGE_KEY } from '../src/pages/planning/flightPlanDraft';

const OUT = '/opt/cursor/artifacts/gsi-sea-rjfz';
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
const TAG = process.env.GSI_SEA_SHOT_TAG ?? 'shot';

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
  await page.waitForTimeout(400);
}

async function setProgress(page: import('@playwright/test').Page, pct: number) {
  const slider = page.getByRole('slider', { name: '再生位置' });
  await slider.fill(String(pct));
  await page.waitForTimeout(6000);
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
    }));
    if (state.err) throw new Error(`FlightViewer3D: ${state.err}`);
    if (state.ready || state.playEnabled) return;
    await page.waitForTimeout(1500);
  }
  throw new Error('3D viewer did not become ready');
}

async function shot(page: import('@playwright/test').Page, name: string) {
  await page.locator('[data-testid="flight-viewer-3d"] canvas').screenshot({
    path: `${OUT}/${TAG}-${name}.png`,
    timeout: 90_000,
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const doc = toPlanDocument(buildRjfaPlan());
  const draftJson = JSON.stringify(doc);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.setDefaultTimeout(180_000);

  await page.addInitScript(
    ({ key, json }) => {
      localStorage.setItem(key, json);
      for (const k of Object.keys(sessionStorage)) {
        if (k.startsWith('flight-gsi-dem:')) sessionStorage.removeItem(k);
      }
    },
    { key: FLIGHT_PLAN_DRAFT_STORAGE_KEY, json: draftJson },
  );

  await page.goto(`${BASE}/planning/3d-popout`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await waitViewerReady(page);
  await page.getByTestId('flight-viewer-mode-gsi').click();
  await page.waitForTimeout(14_000);

  await setRange(page, 'flight-viewer-preview-altitude', 5000);
  await page.waitForTimeout(2000);

  await page.getByTestId('flight-viewer-camera-cockpit').click();
  await setRange(page, 'flight-viewer-chase-pitch', -12);
  for (const pct of [65, 80, 90]) {
    await setProgress(page, pct);
    await shot(page, `cockpit-pitch12-pct${pct}`);
  }

  await page.getByTestId('flight-viewer-camera-chase').click();
  await page.waitForTimeout(3000);
  await setRange(page, 'flight-viewer-chase-distance', 1200);
  await setRange(page, 'flight-viewer-chase-pitch', -22);
  await setProgress(page, 80);
  await shot(page, 'chase-1200-pitch22-pct80');

  await browser.close();
  console.log('Screenshots:', OUT, 'tag=', TAG);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
