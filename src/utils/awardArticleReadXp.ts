import type { ArticleMeta } from '../types/articles';
import { calculateTotalArticleXp } from './articleXpRewards';
import { supabase } from './supabase';

export interface ArticleProgressSnapshot {
  completed?: boolean;
  scrollProgress?: number;
}

export interface AwardArticleXpResult {
  success: boolean;
  xpAwarded?: number;
  error?: string;
}

/**
 * Returns true when every article in `seriesMemberIds` is complete,
 * treating `contentId` as complete (first-time finish).
 */
export function isSeriesCompleteForMembers(
  contentId: string,
  seriesMemberIds: string[],
  progressByContentId: Record<string, ArticleProgressSnapshot>
): boolean {
  if (seriesMemberIds.length <= 1) return false;

  return seriesMemberIds.every((id) => {
    if (id === contentId) return true;
    const p = progressByContentId[id];
    return p?.completed === true || (p?.scrollProgress ?? 0) >= 95;
  });
}

export function resolveArticleMeta(
  contentId: string,
  articleIndexByFilename: Record<string, ArticleMeta>,
  articleIndexBySlug: Record<string, ArticleMeta>
): ArticleMeta | undefined {
  return (
    articleIndexByFilename[contentId] ??
    articleIndexBySlug[contentId] ??
    Object.values(articleIndexByFilename).find((m) => m.slug.includes(contentId))
  );
}

export function computeArticleReadXp(
  contentId: string,
  meta: ArticleMeta | undefined,
  isSeriesComplete: boolean
): number {
  return calculateTotalArticleXp(contentId, meta, true, isSeriesComplete);
}

/**
 * Awards XP for first-time article completion via Supabase RPC (idempotent server-side).
 */
export async function awardArticleReadXp(
  userId: string,
  contentId: string,
  meta: ArticleMeta | undefined,
  isSeriesComplete: boolean
): Promise<AwardArticleXpResult> {
  const xpAmount = computeArticleReadXp(contentId, meta, isSeriesComplete);
  if (xpAmount <= 0) {
    return { success: false, error: 'zero_xp' };
  }

  const { data, error } = await supabase.rpc('award_article_xp', {
    p_user_id: userId,
    p_article_slug: contentId,
    p_xp_amount: xpAmount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const payload = data as {
    success?: boolean;
    xp_awarded?: number;
    error?: string;
  } | null;

  if (!payload?.success) {
    return { success: false, error: payload?.error ?? 'award_failed' };
  }

  return { success: true, xpAwarded: payload.xp_awarded ?? xpAmount };
}
