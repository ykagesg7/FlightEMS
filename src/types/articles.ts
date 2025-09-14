// 記事のソーシャル機能用型定義

export interface ArticleLike {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // リレーション
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface ArticleView {
  id: string;
  article_id: string;
  user_id?: string; // 匿名ユーザーの場合はnull
  ip_address?: string;
  created_at: string;
}

export interface ArticleStats {
  article_id: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  user_liked: boolean; // 現在のユーザーがいいねしているか
}

export interface ArticleWithStats {
  id: string;
  title: string;
  description?: string;
  category: string;
  order_index: number;
  stats: ArticleStats;
}

// コメント投稿用
export interface CreateCommentRequest {
  article_id: string;
  content: string;
}

// いいね切り替え用
export interface ToggleLikeRequest {
  article_id: string;
}

// 閲覧記録用
export interface RecordViewRequest {
  article_id: string;
} 