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

const DASHBOARD_LATEST_NEWS_LIMIT = 3;

/** ログイン HOME「最新情報」: コース続きと重複しないよう除外して先頭 N 件。 */
export function selectDashboardLatestNewsItems(
  items: GuestHomeLatestItem[],
  options?: { excludeContentId?: string | null; limit?: number },
): GuestHomeLatestItem[] {
  const limit = options?.limit ?? DASHBOARD_LATEST_NEWS_LIMIT;
  const exclude = options?.excludeContentId?.trim();
  const filtered = exclude
    ? items.filter((item) => item.id !== exclude)
    : items;
  return filtered.slice(0, limit);
}
