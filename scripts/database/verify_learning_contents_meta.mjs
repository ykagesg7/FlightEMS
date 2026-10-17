/**
 * Read-back verifier for learning_contents meta UPDATE SQL files.
 * Read-only toward Supabase: SELECT only, never INSERT/UPDATE/DELETE.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * @typedef {{ id: string, title?: string, description?: string }} LearningContentsMetaExpectation
 */

/**
 * Parse `UPDATE learning_contents ... WHERE id = '...'` meta scripts.
 * @param {string} sqlText
 * @returns {LearningContentsMetaExpectation}
 */
export function parseMetaUpdateSql(sqlText) {
  const idMatch = sqlText.match(/WHERE\s+id\s*=\s*'((?:''|[^'])*)'/is);
  if (!idMatch) {
    throw new Error('Could not parse WHERE id = ... from SQL file');
  }

  const unescapeSqlString = (raw) => raw.replace(/''/g, "'");

  const readField = (field) => {
    const re = new RegExp(`\\b${field}\\s*=\\s*'((?:''|[^'])*)'`, 'is');
    const match = sqlText.match(re);
    if (!match) return undefined;
    return unescapeSqlString(match[1]);
  };

  const id = unescapeSqlString(idMatch[1]);
  const title = readField('title');
  const description = readField('description');

  if (title === undefined && description === undefined) {
    throw new Error('SQL must set at least one of title or description');
  }

  return { id, title, description };
}

/**
 * @param {unknown} payload
 * @returns {{ id: string, title: string | null, description: string | null, updated_at?: string | null }}
 */
export function normalizeRowPayload(payload) {
  let row = payload;
  if (Array.isArray(row)) {
    if (row.length !== 1) {
      throw new Error(`Expected exactly one row in JSON array, got ${row.length}`);
    }
    row = row[0];
  } else if (row && typeof row === 'object' && Array.isArray(row.data)) {
    if (row.data.length !== 1) {
      throw new Error(`Expected exactly one row in data[], got ${row.data.length}`);
    }
    row = row.data[0];
  }

  if (!row || typeof row !== 'object') {
    throw new Error('JSON must be a row object, a one-element array, or { data: [row] }');
  }

  const record = row;
  if (typeof record.id !== 'string' || record.id.length === 0) {
    throw new Error('Row JSON must include string id');
  }

  return {
    id: record.id,
    title: record.title == null ? null : String(record.title),
    description: record.description == null ? null : String(record.description),
    updated_at: record.updated_at == null ? null : String(record.updated_at),
  };
}

/**
 * @param {LearningContentsMetaExpectation} expected
 * @param {{ id: string, title: string | null, description: string | null }} actual
 */
export function compareLearningContentsMeta(expected, actual) {
  const failures = [];

  if (actual.id !== expected.id) {
    failures.push({
      field: 'id',
      expected: expected.id,
      actual: actual.id,
    });
  }

  if (expected.title !== undefined && actual.title !== expected.title) {
    failures.push({
      field: 'title',
      expected: expected.title,
      actual: actual.title,
    });
  }

  if (expected.description !== undefined && actual.description !== expected.description) {
    failures.push({
      field: 'description',
      expected: expected.description,
      actual: actual.description,
    });
  }

  return { pass: failures.length === 0, failures };
}

export function buildSelectSql(id) {
  const escaped = id.replace(/'/g, "''");
  return `SELECT id, title, description, updated_at FROM learning_contents WHERE id = '${escaped}';`;
}

function loadSupabaseConfig() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  try {
    const envPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        if (line.startsWith('VITE_SUPABASE_URL=') && !supabaseUrl) {
          supabaseUrl = line.split('=').slice(1).join('=').trim();
        } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=') && !supabaseKey) {
          supabaseKey = line.split('=').slice(1).join('=').trim();
        } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=') && !supabaseKey) {
          supabaseKey = line.split('=').slice(1).join('=').trim();
        }
      }
    }
  } catch {
    // fall through to env-only
  }

  return { supabaseUrl, supabaseKey };
}

/**
 * @param {string} id
 */
export async function fetchRowReadOnly(id) {
  const { supabaseUrl, supabaseKey } = loadSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase config. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY).',
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('learning_contents')
    .select('id, title, description, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase read failed: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No learning_contents row for id=${id}`);
  }

  return normalizeRowPayload(data);
}

function printFailures(failures) {
  for (const f of failures) {
    console.error(`  field: ${f.field}`);
    console.error(`  expected: ${f.expected}`);
    console.error(`  actual:   ${f.actual}`);
  }
}

function printExpectation(expected) {
  console.log(`id: ${expected.id}`);
  if (expected.title !== undefined) console.log(`expected title: ${expected.title}`);
  if (expected.description !== undefined) console.log(`expected description: ${expected.description}`);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf-8').trim();
  if (!text) return null;
  return JSON.parse(text);
}

function usage() {
  console.error(`Usage: node scripts/database/verify_learning_contents_meta.mjs <meta-update.sql> [--run]

  Parses title/description/id from a learning_contents UPDATE SQL file, prints the
  read-back SELECT, and compares exact strings when:
    - JSON is piped on stdin (row, [row], or { data: [row] }), or
    - --run is passed (read-only Supabase SELECT; requires env vars).

  Never writes to the database.`);
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const runFlag = args.includes('--run');
  const fileArgs = args.filter((a) => a !== '--run');

  if (fileArgs.length !== 1) {
    usage();
    process.exit(2);
  }

  const sqlPath = path.resolve(process.cwd(), fileArgs[0]);
  const sqlText = fs.readFileSync(sqlPath, 'utf-8');
  const expected = parseMetaUpdateSql(sqlText);

  console.log(`Meta SQL: ${sqlPath}`);
  printExpectation(expected);
  console.log('');
  console.log('Read-back query (run manually if not using --run):');
  console.log(buildSelectSql(expected.id));

  let row = null;
  if (!process.stdin.isTTY) {
    const payload = await readStdin();
    if (payload) row = normalizeRowPayload(payload);
  }

  if (runFlag) {
    row = await fetchRowReadOnly(expected.id);
    if (row.updated_at) {
      console.log(`\nactual updated_at: ${row.updated_at}`);
    }
  }

  if (!row) {
    console.log('\nNo row data supplied (pipe JSON on stdin or pass --run). Comparison skipped.');
    process.exit(0);
  }

  const result = compareLearningContentsMeta(expected, row);
  if (result.pass) {
    console.log('\nPASS');
    process.exit(0);
  }

  console.error('\nFAIL');
  printFailures(result.failures);
  process.exit(1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  });
}
