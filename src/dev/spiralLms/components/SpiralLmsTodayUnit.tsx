import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import type { SpiralLmsNode } from '../../../types/spiralLms';
import {
  pickTodaySpiralUnit,
  resolveSpiralNodeDisplayStatus,
  spiralLmsDisplayStatusLabel,
  spiralLmsLevelLabel,
  spiralLmsQuadrantLabel,
  type SpiralLmsNodeDisplayContext,
} from '../../../utils/spiralLmsNodeDisplay';

type SpiralLmsTodayUnitProps = {
  nodes: readonly SpiralLmsNode[];
  displayContext: SpiralLmsNodeDisplayContext;
  isSignedIn: boolean;
};

function articleHref(slug: string, slugToArticleId: Readonly<Record<string, string>>): string | null {
  const contentId = slugToArticleId[slug];
  if (!contentId) {
    return null;
  }
  return `/articles/${contentId}`;
}

export const SpiralLmsTodayUnit: React.FC<SpiralLmsTodayUnitProps> = ({
  nodes,
  displayContext,
  isSignedIn,
}) => {
  const todayNode = isSignedIn ? pickTodaySpiralUnit(nodes, displayContext) : null;

  return (
    <Card variant="brand">
      <CardHeader>
        <CardTitle className="text-xl">今日の1単元</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSignedIn ? (
          <p className="text-sm text-[color:var(--text-secondary)]">
            ログインすると、次に学ぶべき1単元が表示されます。
          </p>
        ) : null}

        {isSignedIn && !todayNode ? (
          <p className="text-sm text-[color:var(--text-secondary)]" role="status">
            いま「学習中」または「学習可能」な単元はありません。整備点検一覧で状態を確認してください。
          </p>
        ) : null}

        {todayNode ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
                {spiralLmsLevelLabel(todayNode.z_level)} · {spiralLmsQuadrantLabel(todayNode.quadrant)} ·{' '}
                {todayNode.id}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{todayNode.title}</h3>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                状態: {spiralLmsDisplayStatusLabel(resolveSpiralNodeDisplayStatus(todayNode, displayContext))}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--text-primary)]">必須記事</p>
              <ul className="space-y-1 text-sm">
                {todayNode.contents
                  .filter((row) => row.is_required)
                  .map((row) => {
                    const href = articleHref(row.content_slug, displayContext.slugToArticleId);
                    return (
                      <li key={row.content_slug}>
                        {href ? (
                          <Link
                            to={href}
                            className="text-brand-primary underline-offset-2 hover:underline"
                          >
                            {row.content_slug}
                          </Link>
                        ) : (
                          <span className="text-[color:var(--text-secondary)]">{row.content_slug}</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>

            {displayContext.progressByNodeId[todayNode.id] ? (
              <p className="text-xs text-[color:var(--text-secondary)]">
                試行 {displayContext.progressByNodeId[todayNode.id]?.attempts ?? 0} 回
                {displayContext.progressByNodeId[todayNode.id]?.last_attempt_at
                  ? ` · 最終: ${new Date(displayContext.progressByNodeId[todayNode.id]!.last_attempt_at!).toLocaleString('ja-JP')}`
                  : ''}
              </p>
            ) : (
              <p className="text-xs text-[color:var(--text-secondary)]">まだ試行記録はありません。</p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
