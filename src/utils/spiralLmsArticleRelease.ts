import articleMetas from 'virtual:articles-index';
import { isArticleReleased } from './articlePublishGate';

/** `learning_contents.id` → MDX `meta.publishedAt` (build-time index). */
export function buildArticlePublishedAtByContentId(): Readonly<Record<string, string | undefined>> {
  const map: Record<string, string | undefined> = {};
  for (const [contentId, meta] of Object.entries(articleMetas)) {
    map[contentId] = meta?.publishedAt;
  }
  return map;
}

export function isSpiralRequiredContentScheduled(
  node: { contents: readonly { content_slug: string; is_required: boolean }[] },
  slugToArticleId: Readonly<Record<string, string>>,
  publishedAtByContentId: Readonly<Record<string, string | undefined>>,
  now: Date,
): boolean {
  const required = node.contents.filter((row) => row.is_required);
  if (required.length === 0) {
    return false;
  }

  return required.every((row) => {
    const contentId = slugToArticleId[row.content_slug];
    if (!contentId) {
      return true;
    }
    const publishedAt = publishedAtByContentId[contentId];
    return !isArticleReleased(publishedAt, now);
  });
}
