import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LEARNING_ARTICLE_CTA_LABEL } from '../../../../constants/learningArticleNav';
import supabase from '../../../../utils/supabase';

/** セッション設問 ID とマッピング行の重なり数（同一 UUID は二重に数えない） */
function overlapCount(
  questionIds: string[],
  unified: string[] | null | undefined,
  test: string[] | null | undefined
): number {
  const want = new Set(questionIds.map(String));
  const hit = new Set<string>();
  for (const x of unified ?? []) {
    const s = String(x);
    if (want.has(s)) hit.add(s);
  }
  for (const x of test ?? []) {
    const s = String(x);
    if (want.has(s)) hit.add(s);
  }
  return hit.size;
}

export type ReviewContentLinkVariant = 'default' | 'panel';

interface ReviewContentLinkProps {
  subjectCategory: string;
  accuracy: number; // 正答率 (0-100)
  questionIds?: string[]; // 問題IDリスト
  /** 記事詳細からテストに入ったとき、推薦から除外（戻りリンクと重複しないように） */
  excludeContentId?: string | null;
  /** panel: /test 結果画面向け（テーマトークン）。default: 従来のダークカード */
  variant?: ReviewContentLinkVariant;
}

interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string;
}

function filterExcluded(
  items: LearningContent[],
  excludeContentId: string | null | undefined
): LearningContent[] {
  if (!excludeContentId) return items;
  return items.filter((c) => c.id !== excludeContentId);
}

const ReviewContentLink: React.FC<ReviewContentLinkProps> = ({
  subjectCategory,
  accuracy,
  questionIds = [],
  excludeContentId = null,
  variant = 'default',
}) => {
  const [recommendedContents, setRecommendedContents] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);

  const questionIdsKey = useMemo(
    () => [...questionIds].map(String).sort().join(','),
    [questionIds]
  );

  useEffect(() => {
    const fetchRecommendedContents = async () => {
      try {
        type MappingRow = {
          learning_content_id: string;
          topic_category: string;
          difficulty_level: number | null;
          unified_cpl_question_ids?: string[] | null;
          test_question_ids?: string[] | null;
        };
        let mappings: MappingRow[] = [];

        if (questionIds.length > 0) {
          const selectCols = `
            learning_content_id,
            topic_category,
            difficulty_level,
            unified_cpl_question_ids,
            test_question_ids
          `;
          const limit = 40;
          const [r1, r2] = await Promise.all([
            supabase.from('learning_test_mapping').select(selectCols).overlaps('test_question_ids', questionIds).limit(limit),
            supabase.from('learning_test_mapping').select(selectCols).overlaps('unified_cpl_question_ids', questionIds).limit(limit),
          ]);
          if (r1.error) console.error('Error fetching mappings (test_question_ids):', r1.error);
          if (r2.error) console.error('Error fetching mappings (unified_cpl_question_ids):', r2.error);
          const byId = new Map<string, MappingRow>();
          for (const row of [...(r1.data ?? []), ...(r2.data ?? [])] as MappingRow[]) {
            const id = row.learning_content_id;
            const score = overlapCount(questionIds, row.unified_cpl_question_ids, row.test_question_ids);
            const prev = byId.get(id);
            if (!prev || overlapCount(questionIds, prev.unified_cpl_question_ids, prev.test_question_ids) < score) {
              byId.set(id, row);
            }
          }
          const ranked = [...byId.values()].sort(
            (a, b) =>
              overlapCount(questionIds, b.unified_cpl_question_ids, b.test_question_ids) -
              overlapCount(questionIds, a.unified_cpl_question_ids, a.test_question_ids)
          );
          mappings = ranked.slice(0, 5);
        } else {
          const { data, error: mappingError } = await supabase
            .from('learning_test_mapping')
            .select(`
            learning_content_id,
            topic_category,
            difficulty_level
          `)
            .eq('topic_category', subjectCategory)
            .limit(5);
          if (mappingError) {
            console.error('Error fetching mappings:', mappingError);
            return;
          }
          mappings = (data ?? []) as MappingRow[];
        }

        if (!mappings || mappings.length === 0) {
          // マッピングがない場合: subjectCategory は main_subject（例: 航空工学）なので
          // learning_contents.sub_category と照合する（category は PPL / CPL学科 等のため不一致になりやすい）
          const { data: bySub, error: subErr } = await supabase
            .from('learning_contents')
            .select('id, title, category, description')
            .eq('sub_category', subjectCategory)
            .eq('is_published', true)
            .limit(3);

          if (subErr) {
            console.error('Error fetching contents (sub_category fallback):', subErr);
          }

          let contents = bySub ?? [];
          if (contents.length === 0) {
            const { data: byCat, error: catErr } = await supabase
              .from('learning_contents')
              .select('id, title, category, description')
              .eq('category', subjectCategory)
              .eq('is_published', true)
              .limit(3);
            if (catErr) {
              console.error('Error fetching contents (category fallback):', catErr);
            } else if (byCat?.length) {
              contents = byCat;
            }
          }

          if (contents.length > 0) {
            setRecommendedContents(filterExcluded(contents, excludeContentId));
          }
          return;
        }

        // 2. マッピングから学習記事の詳細を取得
        const contentIds = mappings.map((m: { learning_content_id: string }) => m.learning_content_id);
        const { data: contents, error: contentError } = await supabase
          .from('learning_contents')
          .select('id, title, category, description')
          .in('id', contentIds)
          .eq('is_published', true);

        if (contentError) {
          console.error('Error fetching contents:', contentError);
        } else if (contents) {
          const order = new Map(contentIds.map((id, i) => [id, i]));
          const sorted = [...contents].sort(
            (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)
          );
          setRecommendedContents(filterExcluded(sorted, excludeContentId));
        }
      } catch (error) {
        console.error('Error fetching recommended contents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedContents();
  }, [subjectCategory, questionIdsKey, questionIds, excludeContentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div
          className={`animate-spin rounded-full h-6 w-6 border-2 ${
            variant === 'panel'
              ? 'border-brand-primary/25 border-t-brand-primary'
              : 'border-green-500/30 border-t-green-500'
          }`}
        />
      </div>
    );
  }

  if (!recommendedContents.length) {
    return null;
  }

  const needsReview = accuracy < 70; // 70%未満の場合、復習推奨

  const panelOuter = needsReview
    ? 'border-l-4 border-orange-500/70 bg-orange-500/5'
    : 'border-l-4 border-hud-green/50 bg-hud-green/5';
  const defaultOuter = needsReview
    ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-400'
    : 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-400';

  const outerClass =
    variant === 'panel'
      ? `mt-6 p-6 rounded-xl border border-brand-primary/15 ${panelOuter} text-[var(--text-primary)]`
      : `mt-6 p-6 rounded-lg border-l-4 ${defaultOuter} text-white`;

  const subtextClass = variant === 'panel' ? 'text-sm text-[var(--text-muted)]' : 'text-sm text-gray-300';
  const titleClass = variant === 'panel' ? 'text-lg font-semibold text-[var(--text-primary)]' : 'text-lg font-semibold';
  const cardTitleClass = variant === 'panel' ? 'font-medium text-base mb-1 text-[var(--text-primary)]' : 'font-medium text-base mb-1 text-white';
  const descClass = variant === 'panel' ? 'text-sm text-[var(--text-muted)]' : 'text-sm text-gray-400';
  const badgeClass =
    variant === 'panel'
      ? 'inline-block mt-2 px-2 py-1 text-xs rounded-full bg-brand-primary/15 text-brand-primary'
      : 'inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300';
  const linkCardClass =
    variant === 'panel'
      ? 'block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.01] bg-[var(--panel)]/80 border-brand-primary/20 hover:border-brand-primary/40'
      : 'block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] bg-gray-800/50 border-gray-600 hover:border-gray-500';
  const chevronClass = variant === 'panel' ? 'w-5 h-5 text-[var(--text-muted)]' : 'w-5 h-5 text-gray-400';

  const tipBoxClass =
    variant === 'panel'
      ? 'mt-4 p-3 rounded-lg bg-orange-500/10 text-orange-800 dark:text-orange-200 border border-orange-500/25'
      : 'mt-4 p-3 rounded-lg bg-orange-900/20 text-orange-200';

  return (
    <div className={outerClass}>
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <svg
            className={`w-8 h-8 ${needsReview ? 'text-orange-500' : 'text-green-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                needsReview
                  ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  : 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              }
            />
          </svg>
        </div>
        <div>
          <h3 className={titleClass}>単元記事</h3>
          <p className={subtextClass}>
            {needsReview
              ? `正答率${accuracy}%。${LEARNING_ARTICLE_CTA_LABEL}で理解を深めましょう`
              : `正答率${accuracy}%。${LEARNING_ARTICLE_CTA_LABEL}で関連内容を確認できます`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendedContents.map((content) => (
          <Link
            key={content.id}
            to={`/articles/${content.id}`}
            aria-label={`${LEARNING_ARTICLE_CTA_LABEL}: ${content.title}`}
            className={linkCardClass}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cardTitleClass}>{content.title}</h4>
                {content.description && <p className={descClass}>{content.description}</p>}
                <span className={badgeClass}>{content.category}</span>
              </div>
              <div className="ml-4 flex-shrink-0">
                <svg className={chevronClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {needsReview && (
        <div className={tipBoxClass}>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            復習後、再度テストに挑戦して理解度を確認しましょう。
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewContentLink;
