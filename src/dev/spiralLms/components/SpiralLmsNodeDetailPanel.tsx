import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui';
import type { SpiralLmsNode } from '../../../types/spiralLms';
import {
  resolveSpiralNodeDisplayStatus,
  spiralLmsDisplayStatusLabel,
  spiralLmsLevelLabel,
  spiralLmsQuadrantLabel,
  type SpiralLmsNodeDisplayContext,
} from '../../../utils/spiralLmsNodeDisplay';
import { spiralLmsDisplayStatusBadgeClass } from '../../../utils/spiralLmsDisplayStatusStyle';

type SpiralLmsNodeDetailPanelProps = {
  node: SpiralLmsNode;
  displayContext: SpiralLmsNodeDisplayContext;
  onClose: () => void;
};

function articleHref(slug: string, slugToArticleId: Readonly<Record<string, string>>): string | null {
  const contentId = slugToArticleId[slug];
  if (!contentId) {
    return null;
  }
  return `/articles/${contentId}`;
}

export const SpiralLmsNodeDetailPanel: React.FC<SpiralLmsNodeDetailPanelProps> = ({
  node,
  displayContext,
  onClose,
}) => {
  const status = resolveSpiralNodeDisplayStatus(node, displayContext);
  const progress = displayContext.progressByNodeId[node.id];

  return (
    <div
      className="absolute bottom-4 left-4 right-4 z-10 max-h-[45%] overflow-y-auto rounded-lg border border-[color:var(--semantic-border)] bg-[color:var(--surface-primary)] p-4 shadow-lg md:left-auto md:right-4 md:max-w-md"
      role="dialog"
      aria-labelledby="spiral-lms-node-detail-title"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-secondary)]">
            {spiralLmsLevelLabel(node.z_level)} · {spiralLmsQuadrantLabel(node.quadrant)} · {node.id}
          </p>
          <h3 id="spiral-lms-node-detail-title" className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">
            {node.title}
          </h3>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
          ×
        </Button>
      </div>

      <p className="mt-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${spiralLmsDisplayStatusBadgeClass(status)}`}
        >
          {spiralLmsDisplayStatusLabel(status)}
        </span>
      </p>

      <div className="mt-3">
        <p className="mb-1 text-sm font-medium text-[color:var(--text-primary)]">必須記事</p>
        <ul className="space-y-1 text-sm">
          {node.contents.filter((row) => row.is_required).length === 0 ? (
            <li className="text-[color:var(--text-secondary)]">（必須記事なし）</li>
          ) : (
            node.contents
              .filter((row) => row.is_required)
              .map((row) => {
                const href = articleHref(row.content_slug, displayContext.slugToArticleId);
                return (
                  <li key={row.content_slug}>
                    {href ? (
                      <Link to={href} className="text-brand-primary underline-offset-2 hover:underline">
                        {row.content_slug}
                      </Link>
                    ) : (
                      <span className="text-[color:var(--text-secondary)]">{row.content_slug}</span>
                    )}
                  </li>
                );
              })
          )}
        </ul>
      </div>

      {progress ? (
        <p className="mt-3 text-xs text-[color:var(--text-secondary)]">
          試行 {progress.attempts} 回
          {progress.last_attempt_at
            ? ` · 最終: ${new Date(progress.last_attempt_at).toLocaleString('ja-JP')}`
            : ''}
        </p>
      ) : (
        <p className="mt-3 text-xs text-[color:var(--text-secondary)]">まだ試行記録はありません。</p>
      )}
    </div>
  );
};
