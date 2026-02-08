import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLearningProgress } from '../../../hooks/useLearningProgress';

const articleCategories = ['メンタリティー', '思考法', '操縦', 'CPL学科', 'PPL'];

function prefetchMDX(id: string) {
  // 存在しないファイルのインポートエラーを静かに無視
  // @ts-expect-error - best-effort prefetch; Vite will ignore unknown
  import(`../../content/articles/${id}.mdx`)
    .catch(() => {
      // articlesにない場合はlessonsを試す
      return import(`../../content/lessons/${id}.mdx`);
    })
    .catch(() => {
      // narratorも試す
      return import(`../../content/narrator/${id}.mdx`);
    })
    .catch(() => {
      // すべて失敗した場合は静かに無視（ファイルが存在しない可能性）
      // エラーをコンソールに表示しない
    });
}

export const PrevNextNav: React.FC<{ currentId: string; listPath?: string }> = ({ currentId, listPath = '/articles' }) => {
  const { learningContents } = useLearningProgress();
  const navigate = useNavigate();

  const list = useMemo(() => {
    return learningContents
      .filter(c => articleCategories.includes(c.category))
      .slice()
      .sort((a, b) => (a.category === b.category ? a.order_index - b.order_index : a.category.localeCompare(b.category)));
  }, [learningContents]);

  const idx = useMemo(() => list.findIndex(c => c.id === currentId), [list, currentId]);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;

  useEffect(() => {
    if ((navigator as any)?.connection?.saveData) return;
    if (prev) prefetchMDX(prev.id);
    if (next) prefetchMDX(next.id);
  }, [prev, next]);

  return (
    <nav aria-label="前後の記事" className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          {prev ? (
            <Link
              to={`/articles/${prev.id}`}
              aria-label={`前の記事: ${prev.title}`}
              onMouseEnter={() => prefetchMDX(prev.id)}
              className="text-sm underline hud-text hover:text-[color:var(--hud-primary)]"
            >
              ← {prev.title}
            </Link>
          ) : <span className="text-sm text-[color:var(--text-muted)]">先頭です</span>}
        </div>
        <button
          aria-label="記事一覧へ"
          onClick={() => navigate(listPath)}
          className="px-3 py-2 rounded-md border hud-border hud-surface hud-text text-sm"
        >
          一覧
        </button>
        <div className="text-right">
          {next ? (
            <Link
              to={`/articles/${next.id}`}
              aria-label={`次の記事: ${next.title}`}
              onMouseEnter={() => prefetchMDX(next.id)}
              className="text-sm underline hud-text hover:text-[color:var(--hud-primary)]"
            >
              {next.title} →
            </Link>
          ) : <span className="text-sm text-[color:var(--text-muted)]">最後です</span>}
        </div>
      </div>
    </nav>
  );
};


