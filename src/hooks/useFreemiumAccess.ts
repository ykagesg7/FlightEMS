import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLearningProgress } from './useLearningProgress';
import supabase from '../utils/supabase';

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
  const user = useAuthStore(state => state.user);
  const { learningContents } = useLearningProgress();
  const [freemiumContentIds, setFreemiumContentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // フリーミアム記事のIDを動的に取得
  useEffect(() => {
    const fetchFreemiumContents = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchFreemiumContents();
  }, []);
  
  // 無料公開記事を取得
  const previewContents = learningContents.filter(content => 
    freemiumContentIds.includes(content.id)
  );
  
  // コンテンツアクセス権限をチェック
  const canAccessContent = (contentId: string): boolean => {
    // ログインしているユーザーは全てのコンテンツにアクセス可能
    if (user) {
      return true;
    }
    
    // 未ログインユーザーはフリーミアム記事のみアクセス可能
    return freemiumContentIds.includes(contentId);
  };
  
  // 表示するコンテンツリストを決定
  const displayContents = learningContents.filter(content => 
    canAccessContent(content.id)
  );
  
  // フリーミアム状態の情報を提供
  const freemiumInfo = {
    isLoggedIn: !!user,
    previewLimit: previewContents.length,
    totalContents: learningContents.length,
    availableContents: displayContents.length,
    lockedContents: learningContents.length - previewContents.length
  };

  const isFreemiumContent = (contentId: string): boolean => {
    return freemiumContentIds.includes(contentId);
  };

  return {
    // コンテンツ情報
    previewContents,
    displayContents,
    canAccessContent,
    isFreemiumContent,
    freemiumContentIds,
    
    // フリーミアム状態
    freemiumInfo,
    
    // ヘルパー関数
    isPreviewMode: !user,
    isLoading
  };
}; 