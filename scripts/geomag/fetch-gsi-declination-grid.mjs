/**
 * 国土地理院 磁気図2020.0 の偏角 D（西偏・度）を sample.cgi から取得し、
 * 0.1° 格子（計算サイトの 3分グリッド内挿と整合する教育用解像度）の uint16 バイナリを出力する。
 *
 * 出典: https://vldb.gsi.go.jp/sokuchi/geomag/menu_04/sample.cgi
 * 利用: node scripts/geomag/fetch-gsi-declination-grid.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../src/utils/data');
const META_PATH = join(OUT_DIR, 'gsiGeomag2020DeclinationWest.meta.json');

/** 6分（0.1°）。3分ノード間を sample.cgi が内挿するため、0.1° 双一次でも GSI 参照値に整合（軍議 golden 検証済み）。 */
const LAT_MIN = 20.05;
const LAT_MAX = 49.95;
const LON_MIN = 120.05;
const LON_MAX = 153.95;
const STEP = 0.1;

const BATCH = Number(process.env.GEOMAG_BATCH ?? 100);
const CONCURRENCY = Number(process.env.GEOMAG_CONCURRENCY ?? 16);

const nLat = Math.round((LAT_MAX - LAT_MIN) / STEP) + 1;
const nLon = Math.round((LON_MAX - LON_MIN) / STEP) + 1;
const nCells = nLat * nLon;

async function fetchBatch(points) {
  const body = points.map((p, idx) => `${idx + 1}\t${p.lat.toFixed(4)}\t${p.lon.toFixed(4)}`).join('\n') + '\n';
  const form = new FormData();
  form.append('infile', new Blob([body], { type: 'text/plain' }), 'batch.in');
  const res = await fetch('https://vldb.gsi.go.jp/sokuchi/geomag/menu_04/sample.cgi', {
    method: 'POST',
    body: form,
  });
  const html = await res.text();
  const lines = html.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    if (!line.includes('°') || line.includes('Declination') || line.includes('Latitude')) continue;
    const nums = [...line.matchAll(/(\d+\.\d+)\s*°/g)].map((m) => Number(m[1]));
    if (nums.length >= 3) out.push(nums[2]);
  }
  if (out.length !== points.length) {
    throw new Error(`batch parse mismatch: expected ${points.length}, got ${out.length}`);
  }
  return out;
}

function allGridPoints() {
  const pts = [];
  for (let iLat = 0; iLat < nLat; iLat++) {
    const lat = LAT_MIN + iLat * STEP;
    for (let iLon = 0; iLon < nLon; iLon++) {
      const lon = LON_MIN + iLon * STEP;
      pts.push({ lat, lon, iLat, iLon });
    }
  }
  return pts;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const points = allGridPoints();
  console.log(`Grid ${nLat}x${nLon} = ${nCells} cells, step=${STEP}°, batch=${BATCH}, concurrency=${CONCURRENCY}`);

  const values = new Uint16Array(nCells);
  const batches = [];
  for (let i = 0; i < points.length; i += BATCH) {
    batches.push(points.slice(i, i + BATCH));
  }

  let done = 0;
  let batchIdx = 0;
  const started = Date.now();

  async function worker() {
    while (true) {
      const myIdx = batchIdx++;
      if (myIdx >= batches.length) return;
      const batch = batches[myIdx];
      const rows = await fetchBatch(batch);
      for (let j = 0; j < rows.length; j++) {
        const p = batch[j];
        const idx = p.iLat * nLon + p.iLon;
        values[idx] = Math.round(rows[j] * 100);
      }
      done += batch.length;
      if (done % 1000 === 0 || done === nCells) {
        const elapsed = ((Date.now() - started) / 1000).toFixed(0);
        console.log(`  ${done}/${nCells} (${((100 * done) / nCells).toFixed(1)}%) ${elapsed}s`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const binPath = join(OUT_DIR, 'gsiGeomag2020DeclinationWest.u16');
  const gzPath = join(OUT_DIR, 'gsiGeomag2020DeclinationWest.u16.gz');
  await writeFile(binPath, Buffer.from(values.buffer));
  await writeFile(gzPath, gzipSync(Buffer.from(values.buffer)));

  const meta = {
    epoch: '2020.0',
    source:
      'GSI geomag menu_04 sample.cgi (declination D on 0.1° lattice; west positive). Matches bilinear.cgi within golden tolerances.',
    latMin: LAT_MIN,
    latMax: LAT_MAX,
    lonMin: LON_MIN,
    lonMax: LON_MAX,
    stepDeg: STEP,
    nLat,
    nLon,
    scale: 0.01,
    fetchedAt: new Date().toISOString(),
  };
  await writeFile(META_PATH, JSON.stringify(meta, null, 2) + '\n');
  console.log(`Wrote ${binPath} (${values.byteLength} bytes) and ${gzPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
