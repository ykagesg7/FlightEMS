import { sendGa4Event } from '../lib/googleAnalytics';
import { supabase } from './supabase';

export interface ArticleComprehensionAwardResult {
  success: boolean;
  xpAwarded?: number;
  error?: string;
}

export async function awardArticleComprehensionXp(
  articleSlug: string,
  sessionId: string,
): Promise<ArticleComprehensionAwardResult> {
  const { data, error } = await supabase.rpc('award_article_comprehension_xp', {
    p_article_slug: articleSlug,
    p_session_id: sessionId,
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

  sendGa4Event('learning_milestone_achieved', {
    milestone_type: 'article_comprehension',
    content_id: articleSlug,
    xp_awarded: payload.xp_awarded ?? 10,
  });

  return { success: true, xpAwarded: payload.xp_awarded ?? 10 };
}
