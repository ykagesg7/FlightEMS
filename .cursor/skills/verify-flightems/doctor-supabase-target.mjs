/**
 * Doctor: classify Supabase target for verify-flightems.
 * Prints exactly one word: yes | no | unknown (no secrets, no dotenv chatter).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const cwd = process.cwd();

/** @see package.json: `vite` → development; `vite build` / `vercel-build` → production */
const mode =
  process.env.VERIFY_FLIGHTEMS_VITE_MODE?.trim() ||
  process.env.MODE?.trim() ||
  'development';

const prodRef = (
  process.env.VERIFY_FLIGHTEMS_PROD_SUPABASE_PROJECT_REF ?? 'fstynltdfdetpyvbrswr'
).trim();

const nonProdRefs = (
  process.env.VERIFY_FLIGHTEMS_NON_PROD_SUPABASE_PROJECT_REFS ?? ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const envFilesHighToLow = [
  `.env.${mode}.local`,
  `.env.${mode}`,
  '.env.local',
  '.env',
];

function parseViteSupabaseUrlFromFile(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
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
    if (value) return value;
  }
  return null;
}

const urlsFromFiles = [];
for (const rel of envFilesHighToLow) {
  const url = parseViteSupabaseUrlFromFile(resolve(cwd, rel));
  if (url) urlsFromFiles.push(url);
}

const distinctFileUrls = [...new Set(urlsFromFiles)];

if (distinctFileUrls.length > 1) {
  console.log('unknown');
  process.exit(0);
}

const env = loadEnv(mode, cwd, '');
const effective =
  distinctFileUrls[0] ??
  (env.VITE_SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || '');

if (!effective) {
  console.log('unknown');
  process.exit(0);
}

let hostname = '';
try {
  hostname = new URL(effective).hostname;
} catch {
  console.log('unknown');
  process.exit(0);
}

function extractProjectRef(host) {
  if (host === prodRef) return prodRef;
  const m = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
  return m ? m[1] : null;
}

const ref = extractProjectRef(hostname);
if (!ref) {
  console.log('unknown');
  process.exit(0);
}

if (ref === prodRef) {
  console.log('yes');
} else if (nonProdRefs.includes(ref)) {
  console.log('no');
} else {
  console.log('unknown');
}
