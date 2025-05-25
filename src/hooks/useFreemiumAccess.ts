import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

export const useFreemiumAccess = () => {
  const { user } = useAuth();
  const { learningContents } = useLearningProgress();
  
  // 無料公開対象の記事ID一覧
  const freeContentIds = [
    '1.3_EndWithFuture',
    '1.4_PrioritizingMostImportant',
    '1.5_WinWinThinking'
  ];
  
  // 無料公開記事を取得
  const previewContents = useMemo((): LearningContent[] => {
    return learningContents.filter(content => 
      freeContentIds.includes(content.id)
    );
  }, [learningContents]);
  
  // コンテンツアクセス権限をチェック
  const canAccessContent = (contentId: string): boolean => {
    // ログインユーザーは全アクセス可能
    if (user) return true; 
    
    // 未ログインユーザーは指定された無料記事のみアクセス可能
    return freeContentIds.includes(contentId);
  };
  
  // 表示するコンテンツリストを決定
  const displayContents = useMemo((): LearningContent[] => {
    return user ? learningContents : previewContents;
  }, [user, learningContents, previewContents]);
  
  // フリーミアム状態の情報を提供
  const freemiumInfo = useMemo(() => ({
    isLoggedIn: !!user,
    previewLimit: freeContentIds.length,
    totalContents: learningContents.length,
    availableContents: displayContents.length,
    lockedContents: learningContents.length - previewContents.length
  }), [user, learningContents, displayContents, previewContents]);

  return {
    // コンテンツ情報
    previewContents,
    displayContents,
    canAccessContent,
    
    // フリーミアム状態
    freemiumInfo,
    
    // ヘルパー関数
    isPreviewMode: !user,
    isPremiumContent: (contentId: string) => !canAccessContent(contentId)
  };
}; 