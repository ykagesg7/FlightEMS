import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SpiralLmsNode, SpiralLmsNodeStatus, SpiralLmsUserProgress } from '../../../types/spiralLms';
import { isSpiralNodeOpensAtLocked } from '../../../utils/spiralLmsOpensAt';

/** Repo root when tests run from package root (CI / npm run test:run). */
const DB_DIR = join(process.cwd(), 'scripts/database');

export const SPIRAL_PG_TEST_USER = '11111111-1111-1111-1111-111111111111';

export function spiralPgUrl(): string | undefined {
  const url = process.env.SPIRAL_LMS_PG_URL;
  return url && url.trim().length > 0 ? url : undefined;
}

export function psql(sql: string): string {
  const url = spiralPgUrl();
  if (!url) {
    throw new Error('SPIRAL_LMS_PG_URL is not set');
  }
  return execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-c', sql], {
    encoding: 'utf8',
  }).trim();
}

/** Last line of psql output (skips echoed `SET` lines when using JWT claim setup). */
export function psqlLastLine(sql: string): string {
  const lines = psql(sql)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const last = lines.at(-1);
  if (!last) {
    throw new Error('empty psql result');
  }
  return last;
}

function runSqlFile(relativePath: string): void {
  const full = join(DB_DIR, relativePath);
  const url = spiralPgUrl();
  if (!url) {
    throw new Error('SPIRAL_LMS_PG_URL is not set');
  }
  execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-f', full], { encoding: 'utf8' });
}

let migrationsApplied = false;

/** FK targets for spiral_content_slug_map seed (production DB already has these). */
function seedLearningContentsForSlugMap(): void {
  const slugMapSql = readFileSync(join(DB_DIR, '20261012_spiral_lms_content_slug_map.sql'), 'utf8');
  const ids = new Set<string>();
  const rowRe = /^\s+\('[^']+',\s*'([^']+)'\)/;
  for (const line of slugMapSql.split('\n')) {
    const match = rowRe.exec(line);
    if (match) {
      ids.add(match[1]);
    }
  }
  if (ids.size === 0) {
    return;
  }
  const values = [...ids]
    .map((id) => `('${id.replace(/'/g, "''")}','${id.replace(/'/g, "''")}','PPL',true)`)
    .join(',\n');
  psql(`
INSERT INTO public.learning_contents (id, title, category, is_published)
VALUES ${values}
ON CONFLICT (id) DO UPDATE SET is_published = true;
`);
}

export function ensureSpiralLmsMigrations(): void {
  if (migrationsApplied) {
    return;
  }

  psql(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
DO $$ BEGIN
  CREATE ROLE anon;
  CREATE ROLE authenticated;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
INSERT INTO auth.users (id) VALUES ('${SPIRAL_PG_TEST_USER}'::uuid) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.learning_contents (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  sub_category text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  parent_id text,
  content_type text NOT NULL DEFAULT 'text',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS sub_category text;
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS parent_id text;
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'text';
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.learning_contents ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
`);

  runSqlFile('20261012_spiral_lms_schema_rls.sql');
  runSqlFile('20261014_learning_contents_spiral_l1_q3_q4.sql');
  seedLearningContentsForSlugMap();
  runSqlFile('20261012_spiral_lms_content_slug_map.sql');
  runSqlFile('20261012_spiral_lms_record_attempt.sql');
  runSqlFile('20261012_spiral_lms_mdx_mini_quiz.sql');
  runSqlFile('20261012_spiral_lms_seed_l1_l2_nodes.sql');
  runSqlFile('20261013_spiral_lms_mini_quiz_version_pass.sql');
  runSqlFile('20261014_spiral_lms_seed_quiz_l1_l2.sql');
  runSqlFile('20261013_spiral_lms_fk_support_indexes.sql');
  runSqlFile('20261014_spiral_lms_maintenance_prerequisites.sql');

  migrationsApplied = true;
}

export function runSpiralLmsMiniQuizVersionPassDown(): void {
  runSqlFile('20261013_spiral_lms_mini_quiz_version_pass.down.sql');
}

export function runSpiralLmsMiniQuizVersionPassUp(): void {
  runSqlFile('20261013_spiral_lms_mini_quiz_version_pass.sql');
}

export function runSpiralLmsFkSupportIndexesDown(): void {
  runSqlFile('20261013_spiral_lms_fk_support_indexes.down.sql');
}

export function runSpiralLmsFkSupportIndexesUp(): void {
  runSqlFile('20261013_spiral_lms_fk_support_indexes.sql');
}

export function spiralMiniQuizVersionColumnExists(): boolean {
  const raw = psql(`
SELECT count(*)::text
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_attempts'
  AND column_name = 'mini_quiz_version';
`);
  return raw === '1';
}

export function sqlMiniQuizVersion(nodeId: string): string {
  return psql(`SELECT private.spiral_lms_node_mini_quiz_version('${nodeId}');`);
}

export function sqlMiniQuizMet(userId: string, nodeId: string): string {
  return psql(
    `SELECT private.spiral_lms_mini_quiz_met('${userId}'::uuid, '${nodeId}');`,
  );
}

export function sqlMiniQuizEverPassed(userId: string, nodeId: string): string {
  return psql(
    `SELECT private.spiral_lms_user_node_mini_quiz_ever_passed('${userId}'::uuid, '${nodeId}');`,
  );
}

export function resetSpiralCatalog(): void {
  psql(`
DELETE FROM public.user_attempts;
DELETE FROM public.user_progress;
DELETE FROM public.node_mini_quiz_questions;
DELETE FROM public.node_contents;
DELETE FROM public.node_prerequisites;
DELETE FROM public.nodes;
`);
}

type DbNodeRow = {
  id: string;
  title: string;
  quadrant: number;
  z_level: number;
  sort_order: number;
  passing_score: number | null;
  unlock_config: Record<string, unknown>;
  is_published: boolean;
  opens_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

export function fetchSpiralNodesFromDb(now: Date): SpiralLmsNode[] {
  const nodesJson = psql(`
SELECT coalesce(json_agg(row_to_json(n) ORDER BY n.z_level, n.quadrant, n.sort_order), '[]'::json)
FROM public.nodes n;
`);
  const rows = parseJson<DbNodeRow[]>(nodesJson || '[]');

  const prereqJson = psql(`
SELECT coalesce(json_agg(json_build_object('node_id', node_id, 'prerequisite_node_id', prerequisite_node_id)), '[]'::json)
FROM public.node_prerequisites;
`);
  const prereqs = parseJson<Array<{ node_id: string; prerequisite_node_id: string }>>(prereqJson || '[]');
  const prereqByNode = new Map<string, string[]>();
  for (const row of prereqs) {
    const list = prereqByNode.get(row.node_id) ?? [];
    list.push(row.prerequisite_node_id);
    prereqByNode.set(row.node_id, list);
  }

  const contentsJson = psql(`
SELECT coalesce(json_agg(row_to_json(c)), '[]'::json)
FROM public.node_contents c;
`);
  const contents = parseJson<
    Array<{
      node_id: string;
      content_slug: string;
      content_type: string;
      is_required: boolean;
      sort_order: number;
    }>
  >(contentsJson || '[]');
  const contentsByNode = new Map<string, SpiralLmsNode['contents']>();
  for (const row of contents) {
    const list = contentsByNode.get(row.node_id) ?? [];
    list.push({
      node_id: row.node_id,
      content_slug: row.content_slug,
      content_type: row.content_type as 'article' | 'lesson',
      is_required: row.is_required,
      sort_order: row.sort_order,
    });
    contentsByNode.set(row.node_id, list);
  }

  return rows.map((row) => ({
    ...row,
    unlock_config: row.unlock_config ?? {},
    opensAtLocked: isSpiralNodeOpensAtLocked(row.opens_at, now),
    prerequisites: prereqByNode.get(row.id) ?? [],
    contents: (contentsByNode.get(row.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export function fetchSpiralProgressFromDb(userId: string, nodes: readonly SpiralLmsNode[], now: Date) {
  const progressJson = psql(`
SELECT coalesce(json_agg(row_to_json(up)), '[]'::json)
FROM public.user_progress up
WHERE up.user_id = '${userId}'::uuid;
`);
  const rows = parseJson<
    Array<{
      user_id: string;
      node_id: string;
      status: SpiralLmsNodeStatus;
      attempts: number;
      last_attempt_at: string | null;
      mastered_at: string | null;
      updated_at: string;
    }>
  >(progressJson || '[]');

  const opensAtByNodeId: Record<string, string | null> = {};
  for (const node of nodes) {
    opensAtByNodeId[node.id] = node.opens_at;
  }

  const map: Record<string, SpiralLmsUserProgress> = {};
  for (const row of rows) {
    const opensAtLocked = isSpiralNodeOpensAtLocked(opensAtByNodeId[row.node_id], now);
    map[row.node_id] = {
      ...row,
      opensAtLocked,
      effectiveStatus: row.status,
    };
  }
  return map;
}

export function sqlRecomputeAndReadStatus(userId: string, nodeId: string): SpiralLmsNodeStatus {
  psql(`SELECT private.spiral_lms_recompute_node_progress('${userId}'::uuid, '${nodeId}');`);
  const status = psql(`
SELECT status FROM public.user_progress
WHERE user_id = '${userId}'::uuid AND node_id = '${nodeId}';
`);
  if (!status) {
    return 'LOCKED';
  }
  return status as SpiralLmsNodeStatus;
}

export function upsertNode(params: {
  id: string;
  z_level: number;
  quadrant?: number;
  sort_order?: number;
  unlock_config?: Record<string, unknown>;
  opens_at?: string | null;
  passing_score?: number | null;
  is_published?: boolean;
}): void {
  const unlock = JSON.stringify(params.unlock_config ?? {});
  const opensAt = params.opens_at === undefined ? 'NULL' : `'${params.opens_at}'::timestamptz`;
  const passing =
    params.passing_score === undefined || params.passing_score === null
      ? 'NULL'
      : String(params.passing_score);
  psql(`
INSERT INTO public.nodes (id, title, quadrant, z_level, sort_order, passing_score, unlock_config, is_published, opens_at)
VALUES (
  '${params.id}',
  '${params.id}',
  ${params.quadrant ?? 1},
  ${params.z_level},
  ${params.sort_order ?? 1},
  ${passing},
  '${unlock}'::jsonb,
  ${params.is_published ?? true},
  ${opensAt}
)
ON CONFLICT (id) DO UPDATE SET
  unlock_config = EXCLUDED.unlock_config,
  opens_at = EXCLUDED.opens_at,
  passing_score = EXCLUDED.passing_score,
  is_published = EXCLUDED.is_published;
`);
}

export function upsertProgress(userId: string, nodeId: string, status: SpiralLmsNodeStatus): void {
  psql(`
INSERT INTO public.user_progress (user_id, node_id, status, attempts)
VALUES ('${userId}'::uuid, '${nodeId}', '${status}', 0)
ON CONFLICT (user_id, node_id) DO UPDATE SET status = EXCLUDED.status;
`);
}

export function linkPrerequisite(nodeId: string, prerequisiteNodeId: string): void {
  psql(`
INSERT INTO public.node_prerequisites (node_id, prerequisite_node_id)
VALUES ('${nodeId.replace(/'/g, "''")}', '${prerequisiteNodeId.replace(/'/g, "''")}')
ON CONFLICT DO NOTHING;
`);
}

export function readProgressStatus(userId: string, nodeId: string): SpiralLmsNodeStatus | null {
  const status = psql(`
SELECT status FROM public.user_progress
WHERE user_id = '${userId}'::uuid AND node_id = '${nodeId.replace(/'/g, "''")}';
`);
  return status.length > 0 ? (status as SpiralLmsNodeStatus) : null;
}

export function readMaintenanceSince(userId: string, nodeId: string): string | null {
  const raw = psql(`
SELECT maintenance_since::text
FROM public.user_progress
WHERE user_id = '${userId}'::uuid AND node_id = '${nodeId.replace(/'/g, "''")}';
`);
  if (raw.length === 0) {
    return null;
  }
  return raw;
}

export function seedPublishedContentSlug(slug: string): void {
  const esc = slug.replace(/'/g, "''");
  psql(`
INSERT INTO public.learning_contents (id, title, category, is_published)
VALUES ('${esc}', '${esc}', 'PPL', true)
ON CONFLICT (id) DO UPDATE SET is_published = true;
INSERT INTO public.spiral_content_slug_map (content_slug, learning_content_id)
VALUES ('${esc}', '${esc}')
ON CONFLICT (content_slug) DO UPDATE SET learning_content_id = EXCLUDED.learning_content_id;
`);
}

export function linkNodeContent(
  nodeId: string,
  slug: string,
  isRequired = true,
  sortOrder = 1,
): void {
  const escSlug = slug.replace(/'/g, "''");
  const escNode = nodeId.replace(/'/g, "''");
  psql(`
INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES ('${escNode}', '${escSlug}', 'lesson', ${isRequired}, ${sortOrder})
ON CONFLICT (node_id, content_slug) DO UPDATE SET is_required = EXCLUDED.is_required;
`);
}

export function recordContentView(
  nodeId: string,
  slug: string,
  score: number,
  clientId: string,
): { passed: boolean } {
  const json = psqlLastLine(`
SET request.jwt.claim.sub = '${SPIRAL_PG_TEST_USER}';
SELECT public.record_attempt(
  '${nodeId.replace(/'/g, "''")}',
  'content_view',
  '${clientId}'::uuid,
  '${slug.replace(/'/g, "''")}',
  ${score}
)::text;
`);
  const parsed = JSON.parse(json) as { passed: boolean };
  return parsed;
}

export function insertMiniQuizStem(
  nodeId: string,
  questionId: string,
  sortOrder = 1,
  prompt = 'test?',
): void {
  psql(`
INSERT INTO public.node_mini_quiz_questions (id, node_id, sort_order, prompt, question_type, options)
VALUES (
  '${questionId}'::uuid,
  '${nodeId}',
  ${sortOrder},
  '${prompt.replace(/'/g, "''")}',
  'single',
  '[{"id":"a","text":"A"},{"id":"b","text":"B"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  node_id = EXCLUDED.node_id,
  sort_order = EXCLUDED.sort_order,
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options;
INSERT INTO private.node_mini_quiz_answer_keys (question_id, correct_option_ids)
VALUES ('${questionId}'::uuid, ARRAY['a']::text[])
ON CONFLICT (question_id) DO UPDATE SET correct_option_ids = EXCLUDED.correct_option_ids;
`);
}
