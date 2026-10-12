import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WITHDRAWN_ARTICLE_IDS } from '../constants/withdrawnArticleIds';

const DB_DIR = join(process.cwd(), 'scripts/database');
const SCHEMA_PATH = join(DB_DIR, '20261012_spiral_lms_schema_rls.sql');
const SEED_PATH = join(DB_DIR, '20261012_spiral_lms_seed_l1_l2_nodes.sql');
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

  it('schema defines opens_at on nodes and updated_at on user_progress', () => {
    expect(schema).toMatch(/opens_at timestamptz/);
    expect(schema).toMatch(/trg_spiral_nodes_updated_at/);
    expect(schema).toMatch(/trg_spiral_user_progress_updated_at/);
  });
});
