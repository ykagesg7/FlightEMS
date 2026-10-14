import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WITHDRAWN_ARTICLE_IDS } from '../constants/withdrawnArticleIds';

const DB_DIR = join(process.cwd(), 'scripts/database');
const SCHEMA_PATH = join(DB_DIR, '20261012_spiral_lms_schema_rls.sql');
const SEED_PATH = join(DB_DIR, '20261012_spiral_lms_seed_l1_l2_nodes.sql');
const RECORD_ATTEMPT_PATH = join(
  DB_DIR,
  '20261012_spiral_lms_record_attempt.sql',
);
const SLUG_MAP_PATH = join(DB_DIR, '20261012_spiral_lms_content_slug_map.sql');
const MINI_QUIZ_PATH = join(DB_DIR, '20261012_spiral_lms_mdx_mini_quiz.sql');
const MINI_QUIZ_DEV_SEED_PATH = join(
  DB_DIR,
  'dev/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql',
);
const MINI_QUIZ_VERSION_PATH = join(
  DB_DIR,
  '20261013_spiral_lms_mini_quiz_version_pass.sql',
);
const MINI_QUIZ_VERSION_DOWN_PATH = join(
  DB_DIR,
  '20261013_spiral_lms_mini_quiz_version_pass.down.sql',
);
const FK_INDEX_PATH = join(DB_DIR, '20261013_spiral_lms_fk_support_indexes.sql');
const FK_INDEX_DOWN_PATH = join(DB_DIR, '20261013_spiral_lms_fk_support_indexes.down.sql');
const MAINTENANCE_PATH = join(DB_DIR, '20261014_spiral_lms_maintenance_prerequisites.sql');
const MAINTENANCE_DOWN_PATH = join(
  DB_DIR,
  '20261014_spiral_lms_maintenance_prerequisites.down.sql',
);
const CONTENT_ROOT = join(process.cwd(), 'src/content');

const SPIRAL_TABLES = [
  'nodes',
  'node_prerequisites',
  'node_contents',
  'user_progress',
  'user_attempts',
] as const;

function walkMdxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkMdxFiles(full, acc);
    } else if (entry.endsWith('.mdx')) {
      acc.push(full);
    }
  }
  return acc;
}

function collectMdxSlugToContentId(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of walkMdxFiles(CONTENT_ROOT)) {
    const text = readFileSync(file, 'utf8');
    const match = text.match(/slug:\s*['"]([^'"]+)['"]/);
    if (match) {
      const contentId = basename(file, '.mdx');
      map.set(match[1], contentId);
    }
  }
  return map;
}

function extractSeedContentSlugs(seedSql: string): string[] {
  const slugs: string[] = [];
  const rowRe =
    /\('L[12]-Q[1-4]-\d+',\s*'([^']+)',\s*'(article|lesson)'/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(seedSql)) !== null) {
    slugs.push(m[1]);
  }
  return slugs;
}

function extractPublishedNodeIds(seedSql: string): Set<string> {
  const ids = new Set<string>();
  const nodeRe =
    /\('(L[12]-Q[1-4]-\d+)',\s*'[^']*',\s*\d+,\s*\d+,\s*\d+,\s*true,\s*NULL\)/g;
  let m: RegExpExecArray | null;
  while ((m = nodeRe.exec(seedSql)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

function extractRequiredContentCountByNode(seedSql: string): Map<string, number> {
  const counts = new Map<string, number>();
  const rowRe =
    /\('(L[12]-Q[1-4]-\d+)',\s*'[^']+',\s*'(article|lesson)',\s*true,\s*\d+\)/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(seedSql)) !== null) {
    counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  }
  return counts;
}

describe('spiral LMS migrations (static)', () => {
  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  const seed = readFileSync(SEED_PATH, 'utf8');
  const slugToContentId = collectMdxSlugToContentId();
  const withdrawn = new Set<string>(WITHDRAWN_ARTICLE_IDS);

  it('schema enables RLS on all spiral tables', () => {
    for (const table of SPIRAL_TABLES) {
      expect(schema).toContain(
        `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`,
      );
    }
  });

  it('schema revokes anon/authenticated DML and grants SELECT only', () => {
    for (const table of SPIRAL_TABLES) {
      expect(schema).toContain(
        `REVOKE ALL ON TABLE public.${table} FROM PUBLIC, anon, authenticated`,
      );
    }
    expect(schema).toContain(
      'GRANT SELECT ON TABLE public.nodes TO anon, authenticated',
    );
    expect(schema).toContain(
      'GRANT SELECT ON TABLE public.node_prerequisites TO anon, authenticated',
    );
    expect(schema).toContain(
      'GRANT SELECT ON TABLE public.node_contents TO anon, authenticated',
    );
    expect(schema).toContain(
      'GRANT SELECT ON TABLE public.user_progress TO authenticated',
    );
    expect(schema).toContain(
      'GRANT SELECT ON TABLE public.user_attempts TO authenticated',
    );
    expect(schema).not.toMatch(/GRANT\s+INSERT\s+ON\s+TABLE\s+public\.nodes/);
    expect(schema).not.toMatch(
      /GRANT\s+(INSERT|UPDATE|DELETE)\s+ON\s+TABLE\s+public\.user_progress/,
    );
    expect(schema).not.toMatch(/user_progress[\s\S]*FOR INSERT/);
    expect(schema).not.toMatch(/user_attempts[\s\S]*FOR INSERT/);
  });

  it('node_prerequisites policy requires both endpoints published', () => {
    expect(schema).toMatch(
      /node_prerequisites_select_published[\s\S]*prerequisite_node_id[\s\S]*is_published = true/,
    );
  });

  it('seed node_contents slugs exist in MDX meta', () => {
    const missing: string[] = [];
    for (const slug of extractSeedContentSlugs(seed)) {
      if (!slugToContentId.has(slug)) {
        missing.push(slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it('seed node_contents slugs are not withdrawn articles', () => {
    const blocked: string[] = [];
    for (const slug of extractSeedContentSlugs(seed)) {
      const contentId = slugToContentId.get(slug);
      if (contentId && withdrawn.has(contentId)) {
        blocked.push(`${slug} (${contentId})`);
      }
    }
    expect(blocked).toEqual([]);
  });

  it('seed defines 19 L1/L2 nodes', () => {
    const nodeIds = [
      ...seed.matchAll(
        /\('(L[12]-Q[1-4]-\d+)',\s*'[^']+',\s*\d,\s*\d,\s*\d+/g,
      ),
    ].map((match) => match[1]);
    expect(new Set(nodeIds).size).toBe(19);
  });

  it('schema defines opens_at on nodes and spiral_set_updated_at triggers', () => {
    expect(schema).toMatch(/opens_at timestamptz/);
    expect(schema).toMatch(/FUNCTION public\.spiral_set_updated_at\(\)/);
    expect(schema).toMatch(/SECURITY INVOKER/);
    expect(schema).not.toMatch(/set_question_issue_reports_updated_at/);
    expect(schema).toMatch(/trg_spiral_nodes_updated_at/);
    expect(schema).toMatch(/trg_spiral_user_progress_updated_at/);
  });

  it('every published seed node has at least one required content link', () => {
    const published = extractPublishedNodeIds(seed);
    const requiredCounts = extractRequiredContentCountByNode(seed);
    const missing: string[] = [];
    for (const nodeId of published) {
      if ((requiredCounts.get(nodeId) ?? 0) < 1) {
        missing.push(nodeId);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('spiral LMS record_attempt migration (static)', () => {
  const recordAttempt = readFileSync(RECORD_ATTEMPT_PATH, 'utf8');

  it('extends user_attempts for slug-shared content_view vs mini_quiz', () => {
    expect(recordAttempt).toMatch(/ADD COLUMN IF NOT EXISTS content_slug text/);
    expect(recordAttempt).toMatch(/ADD COLUMN IF NOT EXISTS attempt_kind text/);
    expect(recordAttempt).toMatch(
      /ADD COLUMN IF NOT EXISTS client_attempt_id uuid/,
    );
    expect(recordAttempt).toMatch(
      /attempt_kind IN \('content_view', 'mini_quiz'\)/,
    );
  });

  it('seed L1-Q2-1 and L2-Q1-2 have required node_contents', () => {
    const seed = readFileSync(SEED_PATH, 'utf8');
    const requiredCounts = extractRequiredContentCountByNode(seed);
    expect((requiredCounts.get('L1-Q2-1') ?? 0) >= 1).toBe(true);
    expect((requiredCounts.get('L2-Q1-2') ?? 0) >= 1).toBe(true);
  });

  it('defines SECURITY DEFINER record_attempt with fixed search_path', () => {
    expect(recordAttempt).toMatch(
      /CREATE OR REPLACE FUNCTION public\.record_attempt/,
    );
    expect(recordAttempt).toMatch(
      /FUNCTION public\.record_attempt[\s\S]*SECURITY DEFINER/,
    );
    expect(recordAttempt).toMatch(
      /FUNCTION public\.record_attempt[\s\S]*SET search_path = public/,
    );
  });

  it('requires auth.uid and writes only for the caller', () => {
    expect(recordAttempt).toMatch(/v_uid uuid := auth\.uid\(\)/);
    expect(recordAttempt).toMatch(/IF v_uid IS NULL THEN/);
    expect(recordAttempt).toMatch(/user_id,\s*\n\s*node_id,\s*\n\s*content_slug/);
    expect(recordAttempt).toMatch(/VALUES \(\s*\n\s*v_uid,/);
  });

  it('revokes PUBLIC/anon and grants EXECUTE to authenticated only', () => {
    expect(recordAttempt).toMatch(
      /REVOKE ALL ON FUNCTION public\.record_attempt\(text, text, uuid, text, numeric\) FROM PUBLIC/,
    );
    expect(recordAttempt).toMatch(
      /REVOKE ALL ON FUNCTION public\.record_attempt\(text, text, uuid, text, numeric\) FROM anon/,
    );
    expect(recordAttempt).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.record_attempt\(text, text, uuid, text, numeric\) TO authenticated/,
    );
  });

  it('uses server-side score validation without p_passed', () => {
    expect(recordAttempt).not.toMatch(/p_passed/);
    expect(recordAttempt).toMatch(/spiral_lms_validate_score/);
    expect(recordAttempt).toMatch(/v_score = 100::numeric/);
    expect(recordAttempt).toMatch(/ua\.score IS NOT NULL/);
  });

  it('declares private schema and postgres owners', () => {
    expect(recordAttempt).toMatch(/CREATE SCHEMA IF NOT EXISTS private/);
    expect(recordAttempt).toMatch(
      /ALTER FUNCTION public\.record_attempt\(text, text, uuid, text, numeric\) OWNER TO postgres/,
    );
  });

  it('enforces z-level gate and zero-required cannot master', () => {
    expect(recordAttempt).toMatch(/spiral_lms_z_level_gate_met/);
    expect(recordAttempt).toMatch(/WHEN count\(\*\) = 0 THEN false/);
    expect(recordAttempt).toMatch(/z_level_gate_locked/);
  });

  it('preserves MAINTENANCE status during recompute', () => {
    expect(recordAttempt).toMatch(/v_prev_status = 'MAINTENANCE'/);
    expect(recordAttempt).toMatch(
      /WHEN user_progress\.status = 'MAINTENANCE' THEN user_progress\.status/,
    );
  });

  it('rejects unpublished learning content for content_view', () => {
    expect(recordAttempt).toMatch(/content_not_published/);
    expect(recordAttempt).toMatch(/spiral_lms_content_publishable/);
  });

  it('supports idempotent client_attempt_id with conflict detection', () => {
    expect(recordAttempt).toMatch(/client_attempt_id_required/);
    expect(recordAttempt).toMatch(/idx_user_attempts_user_client_attempt_id/);
    expect(recordAttempt).toMatch(/idempotency_conflict/);
    expect(recordAttempt).toMatch(/WHEN unique_violation/);
    expect(recordAttempt).toMatch(/spiral_lms_attempt_payload_matches/);
  });

  it('uses explicit slug map (no regex slug derivation)', () => {
    expect(recordAttempt).toMatch(/spiral_content_slug_map/);
    expect(recordAttempt).not.toMatch(
      /CREATE OR REPLACE FUNCTION private\.spiral_lms_lesson_slug_from_content_id/,
    );
    expect(recordAttempt).toMatch(
      /FUNCTION private\.spiral_lms_content_publishable\(p_content_slug text\)/,
    );
  });

  it('ignores prerequisites on unpublished nodes', () => {
    expect(recordAttempt).toMatch(/prereq\.is_published = true/);
    expect(recordAttempt).toMatch(
      /spiral_lms_published_prerequisites_met/,
    );
  });

  it('locks nodes when opens_at is in the future', () => {
    expect(recordAttempt).toMatch(/opens_at > now\(\)/);
    expect(recordAttempt).toMatch(/node_locked/);
  });

  it('recomputes progress using slug-shared completion across nodes', () => {
    expect(recordAttempt).toMatch(/spiral_lms_slug_completed/);
    expect(recordAttempt).toMatch(/spiral_lms_recompute_all_published_nodes/);
    expect(recordAttempt).toMatch(/slug-shared/i);
  });

  it('private helpers are not executable by anon/authenticated', () => {
    expect(recordAttempt).toMatch(
      /REVOKE ALL ON FUNCTION private\.spiral_lms_slug_completed\(uuid, text\) FROM PUBLIC, anon, authenticated/,
    );
  });
});

describe('spiral LMS MDX mini-quiz migration (static)', () => {
  const miniQuiz = readFileSync(MINI_QUIZ_PATH, 'utf8');
  const devSeed = readFileSync(MINI_QUIZ_DEV_SEED_PATH, 'utf8');

  it('stores answer keys in private schema without client grants', () => {
    expect(miniQuiz).toMatch(/private\.node_mini_quiz_answer_keys/);
    expect(miniQuiz).toMatch(
      /REVOKE ALL ON TABLE private\.node_mini_quiz_answer_keys FROM PUBLIC, anon, authenticated/,
    );
    expect(miniQuiz).toMatch(
      /ALTER TABLE private\.node_mini_quiz_answer_keys ENABLE ROW LEVEL SECURITY/,
    );
  });

  it('exposes stems via RLS on published nodes only (authenticated)', () => {
    expect(miniQuiz).toMatch(/node_mini_quiz_questions_select_published/);
    expect(miniQuiz).toMatch(
      /GRANT SELECT ON TABLE public\.node_mini_quiz_questions TO authenticated/,
    );
    expect(miniQuiz).not.toMatch(
      /GRANT SELECT ON TABLE public\.node_mini_quiz_questions TO anon, authenticated/,
    );
    expect(miniQuiz).toMatch(/n\.is_published IS TRUE/);
    expect(miniQuiz).not.toMatch(
      /USING \(\s*private\.spiral_lms_node_mini_quiz_ready\(node_mini_quiz_questions\.node_id\)/,
    );
  });

  it('defines submit_mini_quiz for authenticated only', () => {
    expect(miniQuiz).toMatch(/CREATE OR REPLACE FUNCTION public\.submit_mini_quiz/);
    expect(miniQuiz).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.submit_mini_quiz\(text, uuid, jsonb\) TO authenticated/,
    );
    expect(miniQuiz).toMatch(
      /REVOKE ALL ON FUNCTION public\.submit_mini_quiz\(text, uuid, jsonb\) FROM PUBLIC, anon/,
    );
  });

  it('rejects client mini_quiz scores on record_attempt', () => {
    expect(miniQuiz).toMatch(/mini_quiz_use_submit_mini_quiz/);
  });

  it('enforces rate limiting, advisory lock, and hides score/results until pass', () => {
    expect(miniQuiz).toMatch(/rate_limited/);
    expect(miniQuiz).toMatch(/pg_advisory_xact_lock/);
    expect(miniQuiz).toMatch(/spiral_lms_format_mini_quiz_response/);
    expect(miniQuiz).toMatch(/spiral_lms_mini_quiz_submissions_last_hour/);
    expect(miniQuiz).toMatch(/IF v_show_results THEN/);
  });

  it('restricts get_node_mini_quiz_questions to authenticated with node lock checks', () => {
    expect(miniQuiz).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.get_node_mini_quiz_questions\(text\) TO authenticated/,
    );
    expect(miniQuiz).toMatch(
      /REVOKE ALL ON FUNCTION public\.get_node_mini_quiz_questions\(text\) FROM PUBLIC, anon/,
    );
    expect(miniQuiz).toMatch(
      /PERFORM private\.spiral_lms_validate_mini_quiz_submission\(v_uid, p_node_id\)/,
    );
  });

  it('validates quiz readiness and answers', () => {
    expect(miniQuiz).toMatch(/quiz_not_ready/);
    expect(miniQuiz).toMatch(/empty_answers/);
    expect(miniQuiz).toMatch(/invalid_answer/);
    expect(miniQuiz).toMatch(/get_node_mini_quiz_questions/);
  });

  it('allows mini-quiz-only nodes to satisfy required content', () => {
    expect(miniQuiz).toMatch(/spiral_lms_required_content_met/);
    expect(miniQuiz).toMatch(/spiral_lms_node_mini_quiz_ready\(p_node_id\)/);
  });

  it('dev seed references SPIRAL-DEV-MINI sample node', () => {
    expect(devSeed).toMatch(/SPIRAL-DEV-MINI/);
    expect(devSeed).toMatch(/exclude_from_z_gate/);
    expect(devSeed).toMatch(/private\.node_mini_quiz_answer_keys/);
  });
});

describe('spiral LMS mini-quiz version pass migration (static)', () => {
  const versionSql = readFileSync(MINI_QUIZ_VERSION_PATH, 'utf8');

  it('stores mini_quiz_version without exposing answer key material', () => {
    expect(versionSql).toMatch(/mini_quiz_version text/);
    expect(versionSql).toMatch(/stem_revision integer/);
    expect(versionSql).toMatch(/key_revision integer/);
    expect(versionSql).toMatch(/spiral_lms_canonical_chunk/);
    expect(versionSql).toMatch(/spiral_lms_node_mini_quiz_version/);
    expect(versionSql).toMatch(/spiral_lms_mini_quiz_met/);
    expect(versionSql).toMatch(/spiral_lms_user_node_mini_quiz_ever_passed/);
    expect(versionSql).toMatch(/spiral_lms_record_attempt_core/);
    const versionFn =
      versionSql.match(
        /CREATE OR REPLACE FUNCTION private\.spiral_lms_node_mini_quiz_version[\s\S]*?\$\$;/,
      )?.[0] ?? '';
    expect(versionFn.length).toBeGreaterThan(0);
    expect(versionFn).not.toMatch(/correct_option_ids/);
    expect(versionFn).not.toMatch(/\bmd5\s*\(/i);
  });

  it('provides a down migration restoring PR ④ function bodies', () => {
    const downSql = readFileSync(MINI_QUIZ_VERSION_DOWN_PATH, 'utf8');
    expect(downSql).toMatch(/spiral_lms_mini_quiz_met/);
    expect(downSql).toMatch(/spiral_lms_user_node_mini_quiz_ever_passed/);
    expect(downSql).toMatch(/spiral_lms_record_attempt_core/);
    expect(downSql).toMatch(/DROP COLUMN IF EXISTS mini_quiz_version/);
  });
});

describe('spiral LMS maintenance prerequisites migration (static)', () => {
  const maintenanceSql = readFileSync(MAINTENANCE_PATH, 'utf8');

  it('defines maintenance_since and prerequisite targeting up to one z_level back', () => {
    expect(maintenanceSql).toMatch(/maintenance_since timestamptz/);
    expect(maintenanceSql).toMatch(/spiral_lms_two_consecutive_failed_attempts/);
    expect(maintenanceSql).toMatch(/spiral_lms_apply_maintenance_prerequisites/);
    expect(maintenanceSql).toMatch(/attempt_kind = 'mini_quiz'/);
    expect(maintenanceSql).toMatch(/prereq\.z_level <= v_node\.z_level/);
    expect(maintenanceSql).toMatch(/prereq\.z_level >= v_node\.z_level - 1/);
  });

  it('hooks record_attempt_core after failed mini_quiz attempts only', () => {
    expect(maintenanceSql).toMatch(/IF NOT p_passed AND p_attempt_kind = 'mini_quiz' THEN/);
    expect(maintenanceSql).toMatch(
      /PERFORM private\.spiral_lms_apply_maintenance_prerequisites/,
    );
  });

  it('serializes record_attempt_core writes with per-user lock before INSERTs', () => {
    const start = maintenanceSql.indexOf(
      'CREATE OR REPLACE FUNCTION private.spiral_lms_record_attempt_core',
    );
    expect(start).toBeGreaterThanOrEqual(0);
    const end = maintenanceSql.indexOf('$$;', start);
    const coreSql = maintenanceSql.slice(start, end);
    const userLock = coreSql.indexOf("hashtext('spiral_lms_user_progress')");
    const attemptInsert = coreSql.indexOf('INSERT INTO public.user_attempts');
    const progressInsert = coreSql.indexOf('INSERT INTO public.user_progress');
    expect(userLock).toBeGreaterThanOrEqual(0);
    expect(attemptInsert).toBeGreaterThan(userLock);
    expect(progressInsert).toBeGreaterThan(userLock);
    expect(coreSql.indexOf('hashtext(p_node_id)')).toBe(-1);
  });

  it('clears MAINTENANCE via maintenance_recovery_met and maintenance_since', () => {
    expect(maintenanceSql).toMatch(/spiral_lms_maintenance_recovery_met/);
    expect(maintenanceSql).toMatch(/IF v_prev_status = 'MAINTENANCE' THEN/);
    expect(maintenanceSql).toMatch(/maintenance_since = CASE/);
  });

  it('tracks recovery for re-trigger and treats MAINTENANCE prereqs as met', () => {
    expect(maintenanceSql).toMatch(/maintenance_cleared_at timestamptz/);
    expect(maintenanceSql).toMatch(/ua\.created_at > v_cutoff/);
    expect(maintenanceSql).toMatch(/max\(up\.maintenance_cleared_at\)/);
    expect(maintenanceSql).toMatch(/ORDER BY np\.prerequisite_node_id/);
    expect(maintenanceSql).toMatch(/up\.status IN \('MASTERED', 'MAINTENANCE'\)/);
    expect(maintenanceSql).toMatch(
      /WHERE status = 'MAINTENANCE'\s+AND maintenance_since IS NULL/,
    );
    expect(maintenanceSql).toMatch(/SET maintenance_since = now\(\)/);
    expect(maintenanceSql).toMatch(/IF v_required_count = 0 THEN\s+RETURN true;/);
    expect(maintenanceSql).not.toMatch(/maintenance_cleared_at = NULL/);
    expect(maintenanceSql).toMatch(/hashtext\('spiral_lms_user_progress'\)/);
  });

  it('provides a down migration restoring version_pass-era functions', () => {
    const downSql = readFileSync(MAINTENANCE_DOWN_PATH, 'utf8');
    expect(downSql).toMatch(/WHERE status = 'MAINTENANCE'/);
    expect(downSql).toMatch(/status = 'MASTERED'/);
    expect(downSql).toMatch(/DROP FUNCTION IF EXISTS private\.spiral_lms_apply_maintenance_prerequisites/);
    expect(downSql).toMatch(/DROP COLUMN IF EXISTS maintenance_since/);
    expect(downSql).toMatch(/CREATE OR REPLACE FUNCTION private\.spiral_lms_record_attempt_core/);
  });
});

describe('spiral LMS FK support indexes migration (static)', () => {
  const indexSql = readFileSync(FK_INDEX_PATH, 'utf8');

  it('adds indexes on slug map learning_content_id and user_attempts node_id', () => {
    expect(indexSql).toMatch(/idx_spiral_content_slug_map_learning_content_id/);
    expect(indexSql).toMatch(/idx_user_attempts_node_id/);
  });

  it('provides a down migration dropping FK support indexes', () => {
    const downSql = readFileSync(FK_INDEX_DOWN_PATH, 'utf8');
    expect(downSql).toMatch(/DROP INDEX IF EXISTS public\.idx_user_attempts_node_id/);
    expect(downSql).toMatch(
      /DROP INDEX IF EXISTS public\.idx_spiral_content_slug_map_learning_content_id/,
    );
  });
});

describe('spiral LMS content_slug_map (static)', () => {
  const slugMap = readFileSync(SLUG_MAP_PATH, 'utf8');
  const seed = readFileSync(SEED_PATH, 'utf8');
  const slugToContentId = collectMdxSlugToContentId();

  function extractSlugMapEntries(sql: string): Map<string, string> {
    const entries = new Map<string, string>();
    const rowRe = /\('([^']+)',\s*'([^']+)'\)/g;
    let m: RegExpExecArray | null;
    while ((m = rowRe.exec(sql)) !== null) {
      entries.set(m[1], m[2]);
    }
    return entries;
  }

  it('enables RLS and matches PR① catalog SELECT grants', () => {
    expect(slugMap).toMatch(
      /ALTER TABLE public\.spiral_content_slug_map ENABLE ROW LEVEL SECURITY/,
    );
    expect(slugMap).toMatch(
      /REVOKE ALL ON TABLE public\.spiral_content_slug_map FROM PUBLIC, anon, authenticated/,
    );
    expect(slugMap).toMatch(
      /GRANT SELECT ON TABLE public\.spiral_content_slug_map TO anon, authenticated/,
    );
  });

  it('maps every seed node_contents slug to MDX learning_contents id', () => {
    const map = extractSlugMapEntries(slugMap);
    const seedSlugs = [...new Set(extractSeedContentSlugs(seed))];
    const missing: string[] = [];
    const mismatched: string[] = [];
    for (const slug of seedSlugs) {
      const mapped = map.get(slug);
      const mdxId = slugToContentId.get(slug);
      if (!mapped) {
        missing.push(slug);
        continue;
      }
      if (mdxId && mapped !== mdxId) {
        mismatched.push(`${slug}: map=${mapped} mdx=${mdxId}`);
      }
    }
    expect(missing).toEqual([]);
    expect(mismatched).toEqual([]);
    expect(map.get('ppl-5-4-7-ifr-minimum-altitude-intro-for-ppl')).toBe(
      'PPL-5-4-7_IFRMinimumAltitudeIntroForPPL',
    );
    expect(map.get('cp-1-3-controls-g-pio')).toBe('CP-1-3_ControlsGPio');
  });
});
