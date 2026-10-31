import { buildArticleCanonicalPath } from './articleCanonicalPath';
import {
  getArticles,
  isLessonContentId,
} from './articlesIndex';

export type GuestHomeLatestItem = {
  id: string;
  title: string;
  date: string;
  href: string;
};

const DEFAULT_LIMIT = 5;

/** ゲスト HOME「最新情報」: 公開済みレッスンを publishedAt 降順で返す。 */
export async function getGuestHomeLatestItems(
  limit: number = DEFAULT_LIMIT,
): Promise<GuestHomeLatestItem[]> {
  const articles = await getArticles({
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    publishedOnly: true,
  });

  return articles
    .filter(
      (entry) => entry.meta.type === 'lesson' || isLessonContentId(entry.filename),
    )
    .slice(0, limit)
    .map((entry) => ({
      id: entry.filename,
      title: entry.meta.title,
      date: entry.meta.publishedAt ?? entry.meta.slug,
      href: buildArticleCanonicalPath(entry.meta, entry.filename),
    }));
}
