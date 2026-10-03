/**
 * Visual capture for Planning 3D pop-out PR.
 * Usage: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *        PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npx tsx scripts/verify-planning-3d-popout-screenshots.ts
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { createInitialFlightPlan } from '../src/pages/planning/createInitialFlightPlan';
import type { Airport, FlightPlan, RouteSegment, Waypoint } from '../src/types';
import { toPlanDocument } from '../src/utils/planDocument';
import { FLIGHT_PLAN_DRAFT_STORAGE_KEY } from '../src/pages/planning/flightPlanDraft';

const OUT = '/opt/cursor/artifacts';
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';

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

function buildPlan(): FlightPlan {
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

async function open3dCard(page: import('@playwright/test').Page) {
  const details3d = page.locator('details').filter({
    has: page.locator('summary', { hasText: '3D ルートプレビュー' }),
  });
  await details3d.locator('summary').click({ timeout: 60_000 });
  await page.getByTestId('planning-flight-viewer-3d-panel').waitFor({ timeout: 120_000 });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const draftJson = JSON.stringify(toPlanDocument(buildPlan()));

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  context.setDefaultTimeout(180_000);
  const page = await context.newPage();

  await page.addInitScript(
    ({ key, json }) => {
      localStorage.setItem(key, json);
    },
    { key: FLIGHT_PLAN_DRAFT_STORAGE_KEY, json: draftJson },
  );

  await page.goto(`${BASE}/planning?mode=plan`, { waitUntil: 'domcontentloaded' });
  await open3dCard(page);
  await page.getByTestId('flight-viewer-3d').waitFor({ timeout: 180_000 });

  const popoutPromise = context.waitForEvent('page');
  await page.getByTestId('flight-viewer-popout-open').click();
  const popout = await popoutPromise;
  await popout.waitForLoadState('domcontentloaded');
  await popout.getByTestId('planning-3d-popout-page').waitFor({ timeout: 60_000 });
  await popout.getByTestId('flight-viewer-3d').waitFor({ timeout: 180_000 });

  await page.getByTestId('flight-viewer-popout-placeholder').waitFor({ timeout: 10_000 });
  await page.screenshot({ path: `${OUT}/planning-3d-popout-main-placeholder.png`, fullPage: false });

  await popout.screenshot({ path: `${OUT}/planning-3d-popout-window.png`, fullPage: true });

  await page.getByLabel('高度 (ft)').fill('6000');
  await page.waitForTimeout(2000);
  await popout.screenshot({ path: `${OUT}/planning-3d-popout-after-altitude-edit.png`, fullPage: true });

  await popout.close();
  await page.getByTestId('flight-viewer-3d').waitFor({ timeout: 180_000 });
  await page.screenshot({ path: `${OUT}/planning-3d-popout-restored-inline.png`, fullPage: false });

  await browser.close();
  console.log('Screenshots written to', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
