/**
 * Doctor: classify Supabase target for verify-flightems.
 * Prints exactly one word on stdout: yes | no | unknown
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const argv = process.argv.slice(2);

function modeFromArgv() {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mode' && argv[i + 1]) return argv[i + 1].trim();
    const m = argv[i].match(/^--mode=(.+)$/);
    if (m) return m[1].trim();
  }
  return null;
}

const argvMode = modeFromArgv();
const verifyMode = process.env.VERIFY_FLIGHTEMS_VITE_MODE?.trim();
const modeEnv = process.env.MODE?.trim();

const explicitMode = argvMode || verifyMode || modeEnv || null;
const primaryMode = explicitMode ?? 'development';

/** Default mode with no argv / env → scan both common Vite modes (conservative). */
const modesToScan = explicitMode ? [primaryMode] : ['development', 'production'];

const prodRef = (
  process.env.VERIFY_FLIGHTEMS_PROD_SUPABASE_PROJECT_REF ?? 'fstynltdfdetpyvbrswr'
).trim();

const nonProdRefs = (
  process.env.VERIFY_FLIGHTEMS_NON_PROD_SUPABASE_PROJECT_REFS ?? ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function envFilesForMode(mode) {
  return [
    `.env.${mode}.local`,
    `.env.${mode}`,
    '.env.local',
    '.env',
  ];
}

function parseAllViteSupabaseUrlsFromFile(filePath) {
  if (!existsSync(filePath)) return [];
  const urls = [];
  for (const rawLine of readFileSync(filePath, 'utf8').split('\n')) {
    let trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('export ')) trimmed = trimmed.slice(7).trim();
    const hashIdx = trimmed.indexOf('#');
    if (hashIdx >= 0) trimmed = trimmed.slice(0, hashIdx).trim();
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== 'VITE_SUPABASE_URL') continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) urls.push(value);
  }
  return urls;
}

function extractProjectRef(hostname) {
  if (hostname === prodRef) return prodRef;
  const m = hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  return m ? m[1] : null;
}

/** @returns {'yes' | 'no' | 'unknown'} */
function classifyUrl(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return 'unknown';
  }
  const ref = extractProjectRef(hostname);
  if (!ref) return 'unknown';
  if (ref === prodRef) return 'yes';
  if (nonProdRefs.includes(ref)) return 'no';
  return 'unknown';
}

function emit(result) {
  if (result === 'yes' || result === 'no' || result === 'unknown') {
    console.log(result);
    return;
  }
  console.log('unknown');
}

async function main() {
  let loadEnvFn = null;
  try {
    const vite = await import('vite');
    loadEnvFn = vite.loadEnv;
  } catch {
    console.error('verify-flightems: vite module unavailable; loadEnv skipped');
    emit('unknown');
    return;
  }

  const candidates = [];

  const fromProcess = process.env.VITE_SUPABASE_URL?.trim();
  if (fromProcess) candidates.push(fromProcess);

  const scannedFiles = new Set();
  for (const mode of modesToScan) {
    for (const rel of envFilesForMode(mode)) {
      const abs = resolve(cwd, rel);
      if (scannedFiles.has(abs)) continue;
      scannedFiles.add(abs);
      candidates.push(...parseAllViteSupabaseUrlsFromFile(abs));
    }
    const loaded = loadEnvFn(mode, cwd, '');
    const fromLoadEnv = loaded.VITE_SUPABASE_URL?.trim();
    if (fromLoadEnv) candidates.push(fromLoadEnv);
  }

  if (candidates.length === 0) {
    emit('unknown');
    return;
  }

  const classes = candidates.map(classifyUrl);

  if (classes.includes('yes')) {
    emit('yes');
  } else if (classes.includes('unknown')) {
    emit('unknown');
  } else {
    emit('no');
  }
}

main().catch(() => {
  emit('unknown');
});
