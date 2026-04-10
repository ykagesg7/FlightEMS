/**
 * 20260410_cpl_stub_lessons_contents_and_mapping.sql を execute_sql 向けチャンクに分割する。
 * 使用: node scripts/split-cpl-stub-sql-chunks.mjs [index]  — index 省略時は件数のみ
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.join(__dirname, 'database', '20260410_cpl_stub_lessons_contents_and_mapping.sql');

const raw = fs.readFileSync(SQL_PATH, 'utf8');
const noComments = raw
  .split('\n')
  .filter((l) => !l.trim().startsWith('--'))
  .join('\n')
  .trim();

const withoutOuter = noComments.replace(/^BEGIN;\s*/i, '').replace(/;\s*COMMIT;\s*$/i, ';');

const lcMatch = withoutOuter.match(
  /^(INSERT INTO learning_contents[\s\S]+?ON CONFLICT \(id\) DO NOTHING;)/,
);
if (!lcMatch) {
  throw new Error('learning_contents INSERT not found');
}

const chunks = [];
chunks.push(`BEGIN;\n${lcMatch[1]}\nCOMMIT;`);

let tail = withoutOuter.slice(lcMatch[0].length).trim();
const mappingParts = tail.split(/(?=INSERT INTO learning_test_mapping)/).filter((s) => s.trim());
for (const m of mappingParts) {
  const t = m.trim();
  if (!t) continue;
  chunks.push(`BEGIN;\n${t.endsWith(';') ? t : `${t};`}\nCOMMIT;`);
}

const idx = process.argv[2];
if (idx === undefined) {
  console.log(JSON.stringify({ chunkCount: chunks.length }));
} else if (idx === 'write-all') {
  const outDir = path.join(__dirname, 'sql-chunks-cpl-stub');
  fs.mkdirSync(outDir, { recursive: true });
  chunks.forEach((c, i) => {
    fs.writeFileSync(path.join(outDir, `chunk-${i}.sql`), c, 'utf8');
  });
  console.log(JSON.stringify({ wrote: chunks.length, dir: outDir }));
} else {
  const i = Number(idx);
  if (!Number.isFinite(i) || i < 0 || i >= chunks.length) {
    process.exit(1);
  }
  process.stdout.write(chunks[i]);
}
