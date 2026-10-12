import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DB_DIR = join(process.cwd(), 'scripts/database');
const SCHEMA_PATH = join(DB_DIR, '20261012_spiral_lms_schema_rls.sql');
const SEED_PATH = join(DB_DIR, '20261012_spiral_lms_seed_l1_l2_nodes.sql');
const CONTENT_ROOT = join(process.cwd(), 'src/content');

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

function collectMdxSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const file of walkMdxFiles(CONTENT_ROOT)) {
    const text = readFileSync(file, 'utf8');
    const match = text.match(/slug:\s*['"]([^'"]+)['"]/);
    if (match) {
      slugs.add(match[1]);
    }
  }
  return slugs;
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
  const mdxSlugs = collectMdxSlugs();

  it('schema enables RLS on all spiral tables', () => {
    for (const table of [
      'nodes',
      'node_prerequisites',
      'node_contents',
      'user_progress',
      'user_attempts',
    ]) {
      expect(schema).toContain(
        `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`,
      );
    }
  });

  it('schema does not grant client DML on user_progress or user_attempts', () => {
    expect(schema).not.toMatch(/GRANT\s+INSERT[\s\S]*user_progress/);
    expect(schema).not.toMatch(/GRANT\s+UPDATE[\s\S]*user_progress/);
    expect(schema).not.toMatch(/GRANT\s+DELETE[\s\S]*user_progress/);
    expect(schema).not.toMatch(/user_progress[\s\S]*FOR INSERT/);
    expect(schema).not.toMatch(/user_attempts[\s\S]*FOR INSERT/);
  });

  it('seed node_contents slugs exist in MDX meta', () => {
    const missing: string[] = [];
    for (const slug of extractSeedContentSlugs(seed)) {
      if (!mdxSlugs.has(slug)) {
        missing.push(slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it('seed defines 19 L1/L2 nodes', () => {
    const nodeIds = [
      ...seed.matchAll(
        /\('(L[12]-Q[1-4]-\d+)',\s*'[^']+',\s*\d,\s*\d,\s*\d+/g,
      ),
    ].map((match) => match[1]);
    expect(new Set(nodeIds).size).toBe(19);
  });
});
