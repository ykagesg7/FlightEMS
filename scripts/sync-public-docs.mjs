/**
 * Copies whitelisted Markdown from docs/ to public/docs/ for /docs/*.md static serving.
 * Single source of truth: always edit files under docs/. Run after doc changes:
 *   npm run sync:public-docs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/** Keep in sync with MDX links to /docs/*.md */
const FILES = [
  '05_Content_Pipeline.md',
  '08_Syllabus_Management_Guide.md',
  '09_CPL_Learning_Stub.md',
  '10_航空工学_学科試験攻略ブログ_ロードマップ.md',
  'Article_Coverage_Backlog.md',
];

const outDir = join(root, 'public', 'docs');
mkdirSync(outDir, { recursive: true });

for (const name of FILES) {
  const src = join(root, 'docs', name);
  const dest = join(outDir, name);
  // readFile + writeFile avoids some Windows copyFile UNKNOWN errors on locked/overwritten targets
  writeFileSync(dest, readFileSync(src));
  console.log(`sync-public-docs: ${name}`);
}
