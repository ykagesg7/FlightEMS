import { isWithdrawnArticle } from '../constants/withdrawnArticleIds';
import { isArticleReleased } from './articlePublishGate';

/** Reader-visible dev id patterns (whole token). */
export const DEV_CODE_PATTERN =
  /\b(?:L1-Q\d-\d|L2-Q\d-\d|PPL-\d-\d-\d|CP-\d-\d|FMT-\d-\d|IF-\d-\d)\b/g;

const DEV_CODE_CAPTURE =
  /\b(L1-Q\d-\d|L2-Q\d-\d|PPL-\d-\d-\d|CP-\d-\d|FMT-\d-\d|IF-\d-\d)\b/;

/** Spiral node display titles (scripts/database/20261012_spiral_lms_seed_l1_l2_nodes.sql). */
export const SPIRAL_NODE_TITLES: Readonly<Record<string, string>> = {
  'L1-Q1-1': '揚力・推力',
  'L1-Q1-2': '操縦桿と動翼の関係',
  'L1-Q2-1': '空港の構造・滑走路',
  'L1-Q2-2': '管制塔の役割',
  'L1-Q3-1': 'パイロットへの道',
  'L1-Q3-2': '身体検査基準',
  'L1-Q3-3': 'G とは',
  'L1-Q4-1': '道真公のブリーフィング',
  'L1-Q4-2': 'アビエーターの心構え',
  'L2-Q1-1': 'CP（場周経路）',
  'L2-Q1-2': '離着陸',
  'L2-Q1-3': 'ストールリカバリー',
  'L2-Q2-1': '目視地標の把握',
  'L2-Q2-2': 'See & Avoid',
  'L2-Q3-1': 'VFR 気象判定',
  'L2-Q3-2': '航空力学の基礎',
  'L2-Q3-3': '基本航空法',
  'L2-Q4-1': '「自分で飛ばす」責任感',
  'L2-Q4-2': '基本手順の徹底',
};

/** Primary required lesson slug per spiral node (sort_order = 1, is_required). */
export const SPIRAL_NODE_PRIMARY_SLUG: Readonly<Record<string, string>> = {
  'L1-Q1-1': 'ppl-1-1-3-bernoulli-principle',
  'L1-Q1-2': 'ppl-1-1-11-control-surfaces',
  'L1-Q2-1': 'ppl-5-4-6-aerodrome-ground-operations-basics',
  'L1-Q2-2': 'ppl-4-1-1-air-traffic-services-overview',
  'L1-Q3-1': 'l1-q3-1-path-to-pilot',
  'L1-Q3-2': 'ppl-5-3-2-medical-certificate-basics',
  'L1-Q3-3': 'ppl-1-1-7-vn-diagram',
  'L1-Q4-1': 'l1-q4-1-michizane-briefing',
  'L1-Q4-2': 'l1-q4-2-aviator-mindset',
  'L2-Q1-1': 'cp-3-2-pattern-ats',
  'L2-Q1-2': 'ppl-1-1-10-takeoff-landing-performance',
  'L2-Q1-3': 'ppl-1-1-6-stall-spin',
  'L2-Q2-1': 'ppl-3-2-1-pilotage-and-position-fix',
  'L2-Q2-2': 'ppl-3-3-1-vfr-operations-and-airspace',
  'L2-Q3-1': 'ppl-2-3-2-metar-taf-and-weather-reports',
  'L2-Q3-2': 'ppl-1-1-1-temperature-basics',
  'L2-Q3-3': 'ppl-5-1-1-aviation-law-definitions',
  'L2-Q4-1': 'ppl-5-4-2-captain-authority-and-preflight',
  'L2-Q4-2': 'chores-are-the-job',
};

export interface ArticleCatalogEntry {
  filename: string;
  title: string;
  slug: string;
  publishedAt?: string;
  published: boolean;
  linkable: boolean;
}

export interface ArticleCatalog {
  byCodePrefix: Map<string, ArticleCatalogEntry>;
  bySlug: Map<string, ArticleCatalogEntry>;
  byFilename: Map<string, ArticleCatalogEntry>;
}

export interface DevCodeResolution {
  title: string;
  articleId?: string;
  published: boolean;
  linkable: boolean;
}

export interface SanitizeMdxResult {
  body: string;
  unresolvedCodes: string[];
}

export function buildArticleCatalog(
  articles: ReadonlyArray<{
    filename: string;
    meta: { title: string; slug: string; publishedAt?: string };
  }>,
  now: Date = new Date(),
): ArticleCatalog {
  const byCodePrefix = new Map<string, ArticleCatalogEntry>();
  const bySlug = new Map<string, ArticleCatalogEntry>();
  const byFilename = new Map<string, ArticleCatalogEntry>();

  for (const { filename, meta } of articles) {
    const published = isArticleReleased(meta.publishedAt, now);
    const withdrawn = isWithdrawnArticle(filename);
    const entry: ArticleCatalogEntry = {
      filename,
      title: meta.title,
      slug: meta.slug,
      publishedAt: meta.publishedAt,
      published,
      linkable: published && !withdrawn,
    };
    byFilename.set(filename, entry);
    if (meta.slug) {
      bySlug.set(meta.slug.toLowerCase(), entry);
    }

    const prefixMatch = filename.match(
      /^(L1-Q\d-\d|L2-Q\d-\d|PPL-\d-\d-\d|CP-\d-\d|FMT-\d-\d|IF-\d-\d)(?:_|$)/,
    );
    if (prefixMatch) {
      byCodePrefix.set(prefixMatch[1], entry);
    }
  }

  return { byCodePrefix, bySlug, byFilename };
}

export function articleIdFromHref(href: string): string | undefined {
  const m = href.match(/\/articles\/([^)\s#?]+)/);
  return m?.[1];
}

export function resolveDevCode(
  code: string,
  catalog: ArticleCatalog,
  hintArticleId?: string,
): DevCodeResolution | null {
  if (hintArticleId) {
    const hinted = catalog.byFilename.get(hintArticleId);
    if (hinted) {
      return {
        title: hinted.title,
        articleId: hinted.filename,
        published: hinted.published,
        linkable: hinted.linkable,
      };
    }
  }

  const direct = catalog.byCodePrefix.get(code);
  if (direct) {
    return {
      title: direct.title,
      articleId: direct.filename,
      published: direct.published,
      linkable: direct.linkable,
    };
  }

  if (/^L[12]-Q\d-\d$/.test(code)) {
    const slug = SPIRAL_NODE_PRIMARY_SLUG[code];
    if (slug) {
      const normalized = slug.replace(/^\/articles\//, '').toLowerCase();
      const bySlug = catalog.bySlug.get(normalized);
      if (bySlug) {
        return {
          title: bySlug.title,
          articleId: bySlug.filename,
          published: bySlug.published,
          linkable: bySlug.linkable,
        };
      }
    }
    const nodeTitle = SPIRAL_NODE_TITLES[code];
    if (nodeTitle) {
      return {
        title: nodeTitle,
        published: false,
        linkable: false,
      };
    }
  }

  return null;
}

function formatDevCodeReplacement(res: DevCodeResolution): string {
  if (res.linkable && res.articleId) {
    return `[${res.title}](/articles/${res.articleId})`;
  }
  return res.title;
}

function stripDevCodesFromLinkLabel(label: string): string {
  let text = label;
  const code = '(?:L1-Q\\d-\\d|L2-Q\\d-\\d|PPL-\\d-\\d-\\d|CP-\\d-\\d|FMT-\\d-\\d|IF-\\d-\\d)';
  text = text.replace(new RegExp(`（\\s*${code}\\s*）`, 'g'), '');
  text = text.replace(new RegExp(`\\(\\s*${code}\\s*\\)`, 'g'), '');
  text = text.replace(new RegExp(`（\\s*${code}\\s*[：:]\\s*予定\\s*）`, 'g'), '（予定）');
  text = text.replace(new RegExp(`\\(\\s*${code}\\s*[：:]\\s*予定\\s*\\)`, 'g'), '（予定）');
  return text.trim();
}

export function sanitizeMdxBodyForDevCodes(
  body: string,
  catalog: ArticleCatalog,
  unresolved: Set<string>,
): string {
  let text = body;

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label: string, href: string) => {
    const articleId = articleIdFromHref(href);
    const codeOnly = label.trim().match(DEV_CODE_CAPTURE);
    if (codeOnly && codeOnly[0] === label.trim()) {
      const res = resolveDevCode(codeOnly[1], catalog, articleId);
      if (!res) {
        unresolved.add(codeOnly[1]);
        return full;
      }
      if (res.linkable && res.articleId) {
        return `[${res.title}](${href})`;
      }
      return res.title;
    }

    const stripped = stripDevCodesFromLinkLabel(label);
    if (stripped && stripped !== label.trim()) {
      return `[${stripped}](${href})`;
    }
    return full;
  });

  const codeAlt = '(?:L1-Q\\d-\\d|L2-Q\\d-\\d|PPL-\\d-\\d-\\d|CP-\\d-\\d|FMT-\\d-\\d|IF-\\d-\\d)';
  text = text.replace(
    new RegExp(`[（(]\\s*${codeAlt}\\s*[：:]\\s*予定\\s*[）)]`, 'g'),
    '（予定）',
  );

  text = text.replace(
    new RegExp(`\\*\\*\\s*(${codeAlt})\\s*\\*\\*`, 'g'),
    (_full, code: string) => {
      const res = resolveDevCode(code, catalog);
      if (!res) {
        unresolved.add(code);
        return '**執筆予定の記事**';
      }
      return `**${res.title}**`;
    },
  );

  text = text.replace(
    new RegExp(`\\*\\*「\\s*${codeAlt}\\s*[：:]\\s*([^」]+?)」\\*\\*`, 'g'),
    (_full, inlineTitle: string) => `**「${inlineTitle.trim()}」**`,
  );

  text = text.replace(
    /「\s*(L1-Q\d-\d|L2-Q\d-\d|PPL-\d-\d-\d|CP-\d-\d|FMT-\d-\d|IF-\d-\d)\s*[：:]\s*([^」]+?)」/g,
    (full, code: string, inlineTitle: string) => {
      const res = resolveDevCode(code, catalog);
      const title = res?.title ?? inlineTitle.trim();
      if (!res && !inlineTitle.trim()) {
        unresolved.add(code);
        return full;
      }
      if (res?.linkable && res.articleId) {
        return `「[${title}](/articles/${res.articleId})」`;
      }
      return `「${title}」`;
    },
  );

  text = text.replace(
    /[（(]\s*(L1-Q\d-\d|L2-Q\d-\d|PPL-\d-\d-\d|CP-\d-\d|FMT-\d-\d|IF-\d-\d)\s*[）)]/g,
    (full, code: string) => {
      const res = resolveDevCode(code, catalog);
      if (!res) {
        unresolved.add(code);
        return full;
      }
      if (res.linkable && res.articleId) {
        return `（[${res.title}](/articles/${res.articleId})）`;
      }
      return `（${res.title}）`;
    },
  );

  text = text.replace(DEV_CODE_PATTERN, (code) => {
    const res = resolveDevCode(code, catalog);
    if (!res) {
      unresolved.add(code);
      return code;
    }
    return formatDevCodeReplacement(res);
  });

  return text;
}

export function splitMdxMetaAndBody(source: string): { meta: string; body: string } {
  const match = source.match(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\};\s*/);
  if (!match || match.index === undefined) {
    return { meta: '', body: source };
  }
  const end = match.index + match[0].length;
  return {
    meta: source.slice(0, end),
    body: source.slice(end),
  };
}

export function sanitizeMdxSource(
  source: string,
  catalog: ArticleCatalog,
): SanitizeMdxResult {
  const unresolved = new Set<string>();
  const { meta, body } = splitMdxMetaAndBody(source);
  const sanitizedBody = sanitizeMdxBodyForDevCodes(body, catalog, unresolved);
  return {
    body: meta + sanitizedBody,
    unresolvedCodes: [...unresolved],
  };
}

/** Strip non-reader regions before scanning for dev codes. */
export function extractReaderVisibleText(source: string): string {
  const { body } = splitMdxMetaAndBody(source);
  let text = body;
  text = text.replace(/^import\s+.+$/gm, '');
  text = text.replace(/^export\s+default\s+.+$/gm, '');
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]*`/g, '');
  text = text.replace(/https?:\/\/[^\s)\]>"]+/g, '');
  text = text.replace(/\/articles\/[^\s)\]>"]+/g, '');
  return text;
}

export function findReaderVisibleDevCodes(source: string): string[] {
  const text = extractReaderVisibleText(source);
  const matches = text.match(DEV_CODE_PATTERN);
  return matches ? [...matches] : [];
}

export function findDevCodesInMdxFiles(
  files: ReadonlyArray<{ path: string; source: string }>,
): Array<{ path: string; codes: string[] }> {
  const violations: Array<{ path: string; codes: string[] }> = [];
  for (const file of files) {
    const codes = [...new Set(findReaderVisibleDevCodes(file.source))];
    if (codes.length > 0) {
      violations.push({ path: file.path, codes });
    }
  }
  return violations;
}
