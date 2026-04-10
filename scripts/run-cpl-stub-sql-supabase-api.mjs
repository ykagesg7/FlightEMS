/**
 * Supabase Management API で CPL スタブ SQL チャンクを順に実行する。
 * 必要: 環境変数 SUPABASE_ACCESS_TOKEN（database:write 相当）
 * 使用: node scripts/run-cpl-stub-sql-supabase-api.mjs
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'fstynltdfdetpyvbrswr';
const CHUNK_DIR = path.join(__dirname, 'sql-chunks-cpl-stub');

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

function postQuery(query) {
  const body = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${PROJECT_REF}/database/query`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const files = fs
  .readdirSync(CHUNK_DIR)
  .filter((f) => /^chunk-\d+\.sql$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

if (files.length === 0) {
  console.error('No chunk-*.sql in', CHUNK_DIR, '— run: node scripts/split-cpl-stub-sql-chunks.mjs write-all');
  process.exit(1);
}

for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const query = fs.readFileSync(path.join(CHUNK_DIR, f), 'utf8');
  process.stderr.write(`[${i + 1}/${files.length}] ${f} ... `);
  const { status, body } = await postQuery(query);
  if (status !== 201 && status !== 200) {
    console.error('FAIL', status, body);
    process.exit(1);
  }
  process.stderr.write(`ok (${status})\n`);
}

console.log(JSON.stringify({ ok: true, chunks: files.length }));
