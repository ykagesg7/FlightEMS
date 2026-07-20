import type { ArticleMeta } from '../types/articles';
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
  _contentId: string,
  _meta: ArticleMeta | undefined,
  _isSeriesComplete: boolean
): number {
  return 5;
}

/**
 * Awards XP for first-time article completion via Supabase RPC (idempotent server-side).
 */
export async function awardArticleReadXp(
  _userId: string,
  contentId: string,
  _meta: ArticleMeta | undefined,
  _isSeriesComplete: boolean
): Promise<AwardArticleXpResult> {
  const { data, error } = await supabase.rpc('award_article_read_xp', {
    p_article_slug: contentId,
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

  return { success: true, xpAwarded: payload.xp_awarded ?? 5 };
}
