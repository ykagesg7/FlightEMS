/**
 * Generate docs/ops/Article_Canonical_URLs.md (mapping table + metadata).
 * Usage: node scripts/generate-article-canonical-url-doc.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildArticleLegacyRedirects } from './lib/articleLegacyRedirects.ts';
import { collectArticleMetas } from '../vite/articlesMeta.ts';
import {
  articlePrettySlug,
  buildArticleCanonicalPath,
} from '../src/utils/articleCanonicalPath.ts';
import { ARTICLE_ROUTE_ALIASES } from '../src/config/articleRouteAliases.ts';
import reservedSlugs from '../config/article-reserved-slugs.json' with { type: 'json' };

const root = process.cwd();
const redirects = buildArticleLegacyRedirects();
const metas = collectArticleMetas(resolve(root, 'src/content'));

const aliasesByCanonical = new Map();

for (const { filename, meta } of metas) {
  const canonical = buildArticleCanonicalPath(meta, filename);
  const pretty = articlePrettySlug(meta, filename);
  const rows = aliasesByCanonical.get(canonical) ?? [];
  if (filename !== pretty) {
    rows.push({
      alias: `/articles/${filename}`,
      reason: `MDX basename (\`${filename}.mdx\`)`,
    });
  }
  for (const [alias, target] of Object.entries(ARTICLE_ROUTE_ALIASES)) {
    if (target === filename || target === pretty) {
      rows.push({ alias: `/articles/${alias}`, reason: 'route alias (CTX→CP 等)' });
    }
  }
  if (rows.length > 0) {
    aliasesByCanonical.set(canonical, rows);
  }
}

for (const [contentId, slug] of Object.entries(reservedSlugs)) {
  const canonical = `/articles/${slug}`;
  const rows = aliasesByCanonical.get(canonical) ?? [];
  rows.push({
    alias: `/articles/${contentId}`,
    reason: '予約 slug（`config/article-reserved-slugs.json`、MDX 未整備）',
  });
  rows.push({
    alias: `/learning/${contentId}`,
    reason: 'learning_contents 導線（MDX 未整備）',
  });
  aliasesByCanonical.set(canonical, rows);
}

for (const rule of redirects) {
  const rows = aliasesByCanonical.get(rule.destination) ?? [];
  if (!rows.some((row) => row.alias === rule.source)) {
    rows.push({
      alias: rule.source,
      reason: 'legacy redirect 定義（`config/article-legacy-redirects.json`）',
    });
  }
  aliasesByCanonical.set(rule.destination, rows);
}

const mappingRows = [
  ...metas.map(({ filename, meta }) => {
    const canonical = buildArticleCanonicalPath(meta, filename);
    const aliases = aliasesByCanonical.get(canonical) ?? [];
    return { filename, canonical, aliases };
  }),
  ...Object.entries(reservedSlugs).map(([contentId, slug]) => ({
    filename: contentId,
    canonical: `/articles/${slug}`,
    aliases: aliasesByCanonical.get(`/articles/${slug}`) ?? [],
  })),
].sort((a, b) => a.canonical.localeCompare(b.canonical));

let aliasCount = 0;
const tableLines = mappingRows.flatMap(({ filename, canonical, aliases }) => {
  if (aliases.length === 0) {
    return [
      `| ${canonical} | （正本のみ） | MDX \`meta.slug\` + \`${filename}.mdx\` |`,
    ];
  }
  return aliases.map((alias) => {
    aliasCount += 1;
    return `| ${canonical} | ${alias.alias} | ${alias.reason} |`;
  });
});

const body = `# 記事 URL 正本（canonical）設計

最終更新: 2026-11-18（GA4 計測分裂対策）

## 背景

同一記事が **MDX ファイル名（\`PPL-1-1-1_Topic.mdx\`）** と **\`meta.slug\`（ケバブケース）** の2系統で開けると、GA4 の \`page_path\` が分裂する。さらに SPA 内遷移では Vercel の恒久リダイレクトより先にクライアントルータが動き、レガシー URL で \`page_view\` が送られることがあった。

## 正本 URL の決め方

1. **正本パス**は \`/articles/<segment>\`（末尾スラッシュなし）。
2. **\`<segment>\`** は MDX の \`export const meta.slug\` を優先する（先頭の \`/articles/\` は付けない）。slug 未設定時のみ MDX ファイル名（拡張子なし）をそのまま使う。
3. **ケバブケース**（小文字 + ハイフン）を標準とする。PPL/CPL コードプレフィックス（\`ppl-2-1-6-\` など）は slug に含めてよい。
4. **MDX ファイル名は変更しない**（\`learning_contents.id\`・Supabase 進捗・テスト紐付けのキー）。URL 正本は slug のみ。
5. **別記事の注意**: \`3-3-10-cloud-types\`（CPL）と \`ppl-2-1-6-cloud-types-and-formation\`（PPL）は内容が関連しても **別 MDX・別正本**。相互リダイレクトはしない。

## URL が決まるレイヤ

| レイヤ | 役割 |
|--------|------|
| MDX \`meta.slug\` | 正本 segment のソース |
| MDX ファイル名 | \`learning_contents.id\`、モジュール import キー |
| \`virtual:articles-index\` | ビルド時メタ索引 |
| React Router \`/articles/:contentId\` | 表示。レガシー param は \`ArticleDetailRoute\` で即時 replace |
| \`config/article-legacy-redirects.json\` | アプリ同期用 +（生成時）Vercel 恒久 308 の正本リスト |
| Vercel \`redirects\` | 直アクセス・クローラ向け（**本 PR では vercel.json 本体は未変更**。既存ルールが正本） |
| \`/learning/:contentId\` | \`learning_contents.id\` から正本 slug へ replace |
| sitemap / prerender | \`articlePrettySlug\` 基準（\`vite/prerenderArticlesPlugin.ts\`） |
| GA4 \`page_path\` | \`canonicalizeAnalyticsPagePath\` で正本に正規化 |

## リダイレクト方式（優先順）

1. **アプリ内（優先）**: \`ArticleDetailRoute\` がレンダー時に \`Navigate replace\`。\`GoogleAnalyticsTracker\` も正本 path を送信。
2. **Vercel 恒久リダイレクト**: \`/articles/<mdx-basename>\` → 正本（直リンク・未 JS 環境向け）。件数: ${redirects.length}。
3. **学習導線**: \`/learning/<id>\` → \`articleHrefForContentId\`。

## canonical の入れ方（SPA）

- クライアント: \`ArticleMetaTags\`（react-helmet-async）が \`buildArticleCanonicalPath\` 由来の絶対 URL を \`<link rel="canonical">\` に出力。
- 静的クローラ向け: ビルド時 prerender の \`vite/articleHeadTags.ts\` が同名タグを HTML に埋め込み（主要記事）。
- **効き方**: 検索エンジンは prerender / 初回 HTML の canonical を参照。SPA 遷移後も Helmet で正本が上書きされる。レガシー URL で HTML が生成された場合は Vercel 308 が正本へ誘導する。

## 内部リンクとサイトマップ

- 内部リンクは \`buildArticleCanonicalPath\` / \`articleHrefForContentId\` を使用（UI コンポーネントは対応済み）。
- MDX 本文内の \`/articles/<filename>\` は \`npm run fix:article-links\` で正本へ一括置換（本文の文章は変更しない）。
- サイトマップ: \`vite/generateSitemap.ts\` → \`api/sitemap.xml.ts\`（正本 slug のみ列挙）。

## DB 変更案（実行しない）

\`learning_contents\` に slug 列はなく、\`id\` = MDX basename で整合。**本件のための本番 UPDATE は不要**。

履歴の \`user_progress.content_id\` / GA 以外で URL 文字列を保存している場合のみ、正本 path への正規化を検討:

\`\`\`sql
-- 案（要事前 SELECT で件数確認）: 旧 URL 形式が content_id に入っている場合
-- SELECT content_id, count(*) FROM user_article_progress GROUP BY 1 HAVING content_id LIKE '/articles/%';
\`\`\`

\`\`\`sql
-- ロールバック案（バックアップテーブル経由を推奨）
-- UPDATE user_article_progress SET content_id = '<legacy>' WHERE content_id = '<canonical>';
\`\`\`

## GA4 への影響

- リリース後、新規セッションの記事 \`page_path\` は正本 slug に集約される。
- 過去データはレガシー path が残る。Explore で \`page_path\` 正規表現または手動合算が必要（GA4 側の canonical URL マージは設定しない）。
- クライアント内遷移の二重ヒット（レガシー→正本）は \`ArticleDetailRoute\` + \`canonicalizeAnalyticsPagePath\` で抑止。

## 確認手順（本番）

1. \`https://flight-lms.vercel.app/articles/IF-1-3_IMC_Scan\` → 表示 URL が \`/articles/if-1-3-imc-scan\`（ネットワークで 308 または replace）。
2. ページソースまたは Elements で \`link rel="canonical"\` が正本の絶対 URL。
3. 同様に \`3.3.10_CloudTypes\`、\`CPL-Hub-Navigation\`。
4. \`ppl-2-1-6-cloud-types-and-formation\` は **リダイレクトされない**（PPL 正本のまま）。

## 別名 → 正本 対応表（全件）

対応行数（別名あり）: **${aliasCount}** / 記事数: **${mappingRows.length}** / 恒久リダイレクト: **${redirects.length}**

| 正本 URL | 別名 URL | 根拠 |
|----------|----------|------|
${tableLines.join('\n')}
`;

const outPath = resolve(root, 'docs/ops/Article_Canonical_URLs.md');
writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${outPath} (${aliasCount} alias rows, ${mappingRows.length} articles)`);