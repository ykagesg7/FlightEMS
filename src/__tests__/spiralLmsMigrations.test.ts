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

  it('supports idempotent client_attempt_id', () => {
    expect(recordAttempt).toMatch(/client_attempt_id_required/);
    expect(recordAttempt).toMatch(/idx_user_attempts_user_client_attempt_id/);
    expect(recordAttempt).toMatch(/'idempotent', true/);
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
