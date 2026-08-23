import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ExtractedArticleMeta {
  title: string;
  slug: string;
  tags: string[];
  series?: string;
  order?: number;
  readingTime?: number;
  excerpt?: string;
  publishedAt?: string;
  type?: 'article' | 'lesson';
  author?: string;
  heroImage?: string;
}

export interface CollectedArticleMeta {
  filename: string;
  dir: 'articles' | 'lessons';
  meta: ExtractedArticleMeta;
}

const META_START = /export\s+const\s+meta\s*=\s*\{/;

/** Extract the `{ ... }` object literal after `export const meta =`. */
export function extractMetaObjectText(source: string): string | null {
  const match = source.match(META_START);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[0].length - 1;
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && (inSingle || inDouble || inTemplate)) {
      escaped = true;
      continue;
    }
    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === "'") {
        inSingle = true;
        continue;
      }
      if (ch === '"') {
        inDouble = true;
        continue;
      }
      if (ch === '`') {
        inTemplate = true;
        continue;
      }
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) return source.slice(start, i + 1);
      }
    } else if (inSingle && ch === "'") {
      inSingle = false;
    } else if (inDouble && ch === '"') {
      inDouble = false;
    } else if (inTemplate && ch === '`') {
      inTemplate = false;
    }
  }
  return null;
}

export function parseArticleMeta(source: string): Record<string, unknown> | null {
  const objText = extractMetaObjectText(source);
  if (!objText) return null;
  try {
    return new Function(`"use strict"; return (${objText});`)() as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isUuidFilename(filename: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    filename,
  );
}

function normalizeMeta(raw: Record<string, unknown>): ExtractedArticleMeta | null {
  const title = typeof raw.title === 'string' ? raw.title : '';
  if (!title) return null;
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  return {
    title,
    slug: typeof raw.slug === 'string' ? raw.slug : '',
    tags,
    series: typeof raw.series === 'string' ? raw.series : undefined,
    order: typeof raw.order === 'number' ? raw.order : undefined,
    readingTime: typeof raw.readingTime === 'number' ? raw.readingTime : undefined,
    excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : undefined,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : undefined,
    type: raw.type === 'lesson' || raw.type === 'article' ? raw.type : undefined,
    author: typeof raw.author === 'string' ? raw.author : undefined,
    heroImage: typeof raw.heroImage === 'string' ? raw.heroImage : undefined,
  };
}

function readDirMetas(
  contentRoot: string,
  dir: 'articles' | 'lessons',
): CollectedArticleMeta[] {
  const folder = join(contentRoot, dir);
  let names: string[];
  try {
    names = readdirSync(folder);
  } catch {
    return [];
  }

  const collected: CollectedArticleMeta[] = [];
  for (const name of names) {
    if (!name.endsWith('.mdx')) continue;
    const filename = name.replace(/\.mdx$/, '');
    if (isUuidFilename(filename)) continue;
    let source: string;
    try {
      source = readFileSync(join(folder, name), 'utf8');
    } catch {
      continue;
    }
    const parsed = parseArticleMeta(source);
    if (!parsed) continue;
    const meta = normalizeMeta(parsed);
    if (!meta) continue;
    collected.push({ filename, dir, meta });
  }
  return collected;
}

export function collectArticleMetas(
  contentRoot = join(process.cwd(), 'src/content'),
): CollectedArticleMeta[] {
  return [...readDirMetas(contentRoot, 'articles'), ...readDirMetas(contentRoot, 'lessons')];
}

export function articleMetasRecord(
  collected: CollectedArticleMeta[] = collectArticleMetas(),
): Record<string, ExtractedArticleMeta> {
  const record: Record<string, ExtractedArticleMeta> = {};
  for (const entry of collected) {
    record[entry.filename] = entry.meta;
  }
  return record;
}
