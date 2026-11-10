/**
 * Regenerate `config/article-legacy-redirects.json` and sync `vercel.json` → `redirects`.
 *
 * Usage: npm run generate:article-redirects
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  assertArticleLegacyRedirectsValid,
  buildArticleLegacyRedirects,
} from './lib/articleLegacyRedirects.ts';

const root = process.cwd();
const redirects = buildArticleLegacyRedirects();
assertArticleLegacyRedirectsValid(redirects);

const configPath = resolve(root, 'config/article-legacy-redirects.json');
mkdirSync(dirname(configPath), { recursive: true });
writeFileSync(configPath, `${JSON.stringify(redirects, null, 2)}\n`, 'utf8');

const vercelPath = resolve(root, 'vercel.json');
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
const ordered = {
  version: vercel.version,
  cleanUrls: vercel.cleanUrls,
  headers: vercel.headers,
  redirects,
  functions: vercel.functions,
  rewrites: vercel.rewrites,
  devCommand: vercel.devCommand,
  buildCommand: vercel.buildCommand,
  installCommand: vercel.installCommand,
  ignoreCommand: vercel.ignoreCommand,
  outputDirectory: vercel.outputDirectory,
  crons: vercel.crons,
};
writeFileSync(vercelPath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');

console.log(`Wrote ${redirects.length} article legacy redirects to config/ and vercel.json`);
