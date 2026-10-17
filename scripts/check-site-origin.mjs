#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const FORBIDDEN_DIST = 'flightacademy.com';
const FORBIDDEN_SOURCE = 'https://flightacademy.com';
const DEFAULT_ORIGIN = 'https://flight-lms.vercel.app';
const EXPECTED_ORIGIN = (
  process.env.VITE_SITE_ORIGIN ||
  process.env.VITE_APP_URL ||
  DEFAULT_ORIGIN
)
  .trim()
  .replace(/\/$/, '');

const SOURCE_SCAN_DIRS = ['src', 'vite', 'api', 'scripts', 'e2e', 'public'];
const SOURCE_EXT = /\.(ts|tsx|js|mjs|cjs|html|xml|txt|md|mdx|json|example)$/i;

function walkFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkFiles(full, acc);
    } else if (SOURCE_EXT.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function scanForbiddenInSources() {
  const hits = [];
  for (const dir of SOURCE_SCAN_DIRS) {
    const abs = join(ROOT, dir);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    for (const file of walkFiles(abs)) {
      const rel = relative(ROOT, file);
      if (rel === 'scripts/check-site-origin.mjs') continue;
      const text = readFileSync(file, 'utf8');
      if (!text.toLowerCase().includes(FORBIDDEN_SOURCE)) continue;
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(FORBIDDEN_SOURCE)) {
          hits.push({
            file: relative(ROOT, file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }
  }
  return hits;
}

function scanDist() {
  const distDir = join(ROOT, 'dist');
  const hits = [];
  let files;
  try {
    files = walkFiles(distDir);
  } catch {
    console.error('dist/ not found; run npm run build first');
    process.exit(1);
  }

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (text.toLowerCase().includes(FORBIDDEN_DIST)) {
      hits.push({ file: relative(ROOT, file), kind: 'forbidden-domain' });
    }
  }
  return { files, forbiddenHits: hits };
}

function assertCanonicalAndOg(distFiles) {
  const articleHtml = distFiles.filter(
    (f) => /[/\\]dist[/\\]articles[/\\][^/\\]+[/\\]index\.html$/i.test(f),
  );
  if (articleHtml.length === 0) {
    console.error('No prerendered article HTML under dist/articles/*/index.html');
    process.exit(1);
  }

  const sample = articleHtml.slice(0, 5);
  const mismatches = [];

  for (const file of sample) {
    const html = readFileSync(file, 'utf8');
    const canonical = html.match(/rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
    const ogUrl = html.match(/property="og:url"[^>]*content="([^"]+)"/i)?.[1];
    for (const [label, value] of [
      ['canonical', canonical],
      ['og:url', ogUrl],
    ]) {
      if (!value || !value.startsWith(`${EXPECTED_ORIGIN}/`)) {
        mismatches.push({
          file: relative(ROOT, file),
          label,
          value: value ?? '(missing)',
          expectedPrefix: `${EXPECTED_ORIGIN}/`,
        });
      }
    }
  }

  return mismatches;
}

function main() {
  const sourceHits = scanForbiddenInSources();
  if (sourceHits.length > 0) {
    console.error(`Forbidden URL "${FORBIDDEN_SOURCE}" found in source:`);
    for (const hit of sourceHits) {
      console.error(`- ${hit.file}:${hit.line} ${hit.text}`);
    }
    process.exit(1);
  }

  const { files, forbiddenHits } = scanDist();
  if (forbiddenHits.length > 0) {
    console.error(`Forbidden host "${FORBIDDEN_DIST}" found in dist:`);
    for (const hit of forbiddenHits) {
      console.error(`- ${hit.file}`);
    }
    process.exit(1);
  }

  const mismatches = assertCanonicalAndOg(files);
  if (mismatches.length > 0) {
    console.error('canonical / og:url do not match expected site origin:');
    for (const m of mismatches) {
      console.error(`- ${m.file} ${m.label}: ${m.value} (want prefix ${m.expectedPrefix})`);
    }
    process.exit(1);
  }

  console.log(
    `OK: no legacy domain in source or dist; sample article canonical/og:url use ${EXPECTED_ORIGIN}`,
  );
}

main();
