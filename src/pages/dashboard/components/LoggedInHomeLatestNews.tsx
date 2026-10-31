import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useGuestHomeLatestItems } from '../../../hooks/useGuestHomeLatestItems';
import {
  selectDashboardLatestNewsItems,
  type GuestHomeLatestItem,
} from '../../../utils/guestHomeLatestItems';

export interface LoggedInHomeLatestNewsProps {
  /** コース「続き」リンクと同じ記事 ID（表示上のレッスンバナー） */
  excludeContentId?: string | null;
}

function LatestNewsList({ items }: { items: GuestHomeLatestItem[] }) {
  return (
    <ul className="space-y-2" data-testid="home-latest-news-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={item.href}
            className="block truncate text-sm font-medium text-brand-primary underline decoration-brand-primary/40 hover:decoration-brand-primary"
            title={item.title}
            data-testid="home-latest-news-item"
            data-content-id={item.id}
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export const LoggedInHomeLatestNews: React.FC<LoggedInHomeLatestNewsProps> = ({
  excludeContentId = null,
}) => {
  const { items, isLoading, error } = useGuestHomeLatestItems();
  const visibleItems = selectDashboardLatestNewsItems(items, { excludeContentId });

  if (isLoading) {
    return (
      <Card
        variant="hud"
        padding="md"
        className="mb-6 border-brand-primary/60"
        data-testid="home-latest-news"
      >
        <CardContent>
          <div className="mb-3 h-5 w-28 animate-pulse rounded bg-gray-700/30" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-700/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <Card
      variant="hud"
      padding="md"
      className="mb-6 border-brand-primary/60"
      data-testid="home-latest-news"
    >
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Typography variant="h4" color="hud">
            最新情報
          </Typography>
          <Link
            to="/articles"
            className="text-sm font-semibold text-brand-primary underline decoration-brand-primary/40 hover:decoration-brand-primary"
            data-testid="home-latest-news-view-all"
          >
            すべて見る
          </Link>
        </div>
        <LatestNewsList items={visibleItems} />
      </CardContent>
    </Card>
  );
};

export default LoggedInHomeLatestNews;
