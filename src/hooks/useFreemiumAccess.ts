import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';
import { useLearningProgress } from './useLearningProgress';

interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string | null;
  order_index: number;
  parent_id: string | null;
  content_type: string;
  created_at: string;
  updated_at: string;
}

export const useFreemiumAccess = (contentType?: 'learning' | 'articles') => {
  const { user } = useAuthStore();
  const { learningContents, isLoading: learningContentsLoading } = useLearningProgress();
  const [freemiumContentIds, setFreemiumContentIds] = useState<string[]>([]);
  const [freemiumLoading, setFreemiumLoading] = useState(true);

  // フリーミアム記事のIDを動的に取得
  useEffect(() => {
    const fetchFreemiumContents = async () => {
      try {
        setFreemiumLoading(true);
        const { data, error } = await supabase
          .from('learning_contents')
          .select('id')
          .eq('is_freemium', true);

        if (error) throw error;

        const ids = data?.map(item => item.id) || [];
        setFreemiumContentIds(ids);
      } catch (error) {
        console.error('フリーミアム記事の取得に失敗しました:', error);
        setFreemiumContentIds([]);
      } finally {
        setFreemiumLoading(false);
      }
    };

    fetchFreemiumContents();
  }, []);

  // コンテンツタイプに基づくフィルタリング
  const getFilteredContents = () => {
    if (!contentType) return learningContents;

    return learningContents.filter(content => {
      if (contentType === 'learning') {
        // LearningタブではCPL関連のコンテンツのみ
        return content.category?.includes('CPL') ||
          content.category?.includes('航空') ||
          content.id.startsWith('3.') ||
          content.id.includes('Aviation') ||
          content.id.includes('TacanApproach');
      } else if (contentType === 'articles') {
        // Articlesタブではメンタリティー・思考法関連のコンテンツのみ（CPL記事を明確に除外）
        return (content.category?.includes('メンタリティー') ||
          content.category?.includes('思考法') ||
          content.category?.includes('自己啓発') ||
          content.id.startsWith('1.') ||
          content.id.startsWith('2.') ||
          content.title?.includes('メンタリティー') ||
          content.title?.includes('思考法') ||
          content.title?.includes('７つの習慣')) &&
          // CPL記事を明確に除外
          !content.id.startsWith('3.') &&
          !content.id.includes('Aviation') &&
          !content.id.includes('TacanApproach') &&
          !content.category?.includes('CPL') &&
          !content.category?.includes('航空') &&
          !content.title?.includes('CPL') &&
          !content.title?.includes('航空法');
      }
      return true;
    });
  };

  const displayContents = getFilteredContents();

  // フリーミアム状態の情報を提供
  const freemiumInfo = {
    isLoggedIn: !!user,
    previewLimit: freemiumContentIds.length,
    totalContents: learningContents.length,
    availableContents: displayContents.length,
    lockedContents: learningContents.length - freemiumContentIds.length
  };

  const isFreemiumContent = (contentId: string): boolean => {
    return freemiumContentIds.includes(contentId);
  };

  // コンテンツへのアクセス可能性をチェック
  const canAccessContent = (contentId: string): boolean => {
    // ログインユーザーは全コンテンツにアクセス可能
    if (user) return true;

    // 未ログインユーザーはフリーミアムコンテンツのみアクセス可能
    return isFreemiumContent(contentId);
  };

  // 両方のローディング状態を組み合わせ
  const isLoading = learningContentsLoading || freemiumLoading;

  return {
    // コンテンツ情報
    displayContents,
    canAccessContent,
    isFreemiumContent,
    isLoading,
    hasAccess: !!user,
    freemiumContentIds,

    // フリーミアム状態
    freemiumInfo,

    // ヘルパー関数
    isPreviewMode: !user
  };
};
