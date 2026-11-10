import { shouldEmitRobotsNoindex } from '../src/utils/articleSeoNoindex';
import { articlePrettySlug } from '../src/utils/articleCanonicalPath';
import type { ExtractedArticleMeta } from './articlesMeta';

const SITE_NAME = 'FlightAcademy';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function articleHeadTags(
  meta: ExtractedArticleMeta,
  filename: string,
  origin: string,
): string {
  const pathSlug = articlePrettySlug(meta, filename);
  const url = `${origin}/articles/${pathSlug}`;
  const description =
    meta.excerpt || `${meta.title} - ${SITE_NAME}で学ぶ航空知識`;
  const ogImage = meta.heroImage || `${origin}/images/og-default.jpg`;
  const robots = shouldEmitRobotsNoindex(meta)
    ? '\n    <meta data-rh="true" name="robots" content="noindex" />'
    : '';

  const tagLines = (meta.tags ?? [])
    .map((tag) => `    <meta data-rh="true" property="article:tag" content="${escapeAttr(tag)}" />`)
    .join('\n');

  return `    <title data-rh="true">${escapeAttr(meta.title)} | ${SITE_NAME}</title>
    <meta data-rh="true" name="description" content="${escapeAttr(description)}" />
    <link data-rh="true" rel="canonical" href="${escapeAttr(url)}" />
    <meta data-rh="true" property="og:type" content="article" />
    <meta data-rh="true" property="og:title" content="${escapeAttr(meta.title)}" />
    <meta data-rh="true" property="og:description" content="${escapeAttr(description)}" />
    <meta data-rh="true" property="og:url" content="${escapeAttr(url)}" />
    <meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />
    <meta data-rh="true" property="og:image" content="${escapeAttr(ogImage)}" />
    <meta data-rh="true" property="og:locale" content="ja_JP" />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <meta data-rh="true" name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta data-rh="true" name="twitter:description" content="${escapeAttr(description)}" />
    <meta data-rh="true" name="twitter:image" content="${escapeAttr(ogImage)}" />${robots}
${tagLines}`;
}
