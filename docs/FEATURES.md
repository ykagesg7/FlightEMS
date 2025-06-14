# FlightAcademyTsx - 機能詳細ガイド

このドキュメントでは、FlightAcademyTsxアプリケーションの主要機能について詳しく説明します。

## 目次

1. [学習コンテンツ管理](#学習コンテンツ管理)
2. [ソーシャル機能](#ソーシャル機能)
3. [フリーミアム機能](#フリーミアム機能)
4. [認証システム](#認証システム)
5. [ユーザー管理](#ユーザー管理)
6. [UI/UX機能](#uiux機能)
7. [記事ページ機能](#記事ページ機能)

## 学習コンテンツ管理

### MDXベースの記事システム

FlightAcademyTsxでは、MDX（Markdown + JSX）形式で学習記事を管理しています。

#### 記事の構造

```mdx
---
title: "記事タイトル"
category: "カテゴリー名"
description: "記事の説明"
order: 6
---

import CalloutBox from '../components/CalloutBox';
import ImageWithComment from '../components/ImageWithComment';

# 記事タイトル

<CalloutBox type="info">
重要な情報をハイライト表示
</CalloutBox>

## セクション1

記事の内容...

<ImageWithComment 
  src="/images/example.jpg" 
  alt="説明画像"
  comment="画像の説明コメント"
/>

## まとめ

記事のまとめ...

## 試練

実践的な課題や演習...
```

#### サポートされるコンポーネント

1. **CalloutBox** - 情報ボックス
   - `type`: info, warning, success, error
   - 重要な情報の強調表示

2. **ImageWithComment** - 画像とコメント
   - 画像の下にコメントを表示
   - レスポンシブ対応

3. **Mermaid図表** - ダイアグラム描画
   - フローチャート、シーケンス図など

### カテゴリー管理

- **基礎知識**: 航空の基本概念
- **メンタリティー**: 心構えや考え方
- **技術**: 具体的な技術や手法
- **実践**: 実際の演習や事例

## ソーシャル機能

### いいね機能

学習記事に対してユーザーがいいねを付けることができます。

#### 技術仕様

```typescript
interface Like {
  id: string;
  content_id: string;
  user_id: string;
  created_at: string;
}
```

#### 機能詳細

- リアルタイムでのいいね数更新
- ユーザーごとの重複いいね防止
- ダークモード対応UI
- ログイン必須機能

### コメント機能

学習記事に対してユーザーがコメントを投稿できます。

#### 技術仕様

```typescript
interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}
```

#### 機能詳細

- マルチライン対応のコメント投稿
- ユーザープロフィール情報の表示
- 投稿日時の表示
- レスポンシブデザイン

### ソーシャル機能のUI

```typescript
// いいねボタンの例
<button
  onClick={toggleLike}
  disabled={!user}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
    isLiked
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }`}
>
  <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
  <span>{likes.length}</span>
</button>
```

## フリーミアム機能

### 概要

未ログインユーザーでも一部の記事を無料で閲覧できる機能です。

### 設定方法

1. **データベース設定**
   ```sql
   ALTER TABLE learning_contents ADD COLUMN is_freemium BOOLEAN DEFAULT FALSE;
   ```

2. **記事の設定**
   ```typescript
   // 特定の記事をフリーミアム対象に設定
   const freemiumContentIds = ['1.4_PrioritizingMostImportant', '1.5_WinWinThinking', '1.6_SeekFirstToUnderstand'];
   ```

### アクセス制御

```typescript
const canAccessContent = (contentId: string): boolean => {
  // ログインユーザーは全コンテンツにアクセス可能
  if (user) {
    return true;
  }
  
  // 未ログインユーザーはフリーミアム記事のみ
  return freemiumContentIds.includes(contentId);
};
```

### UI表示

- フリーミアム記事には「FREE」バッジを表示
- 未ログインユーザーには制限付きコンテンツリストを表示
- ログイン促進メッセージの表示

## 認証システム

### Zustand AuthStore

状態管理にZustandを使用した認証システムです。

#### 主要機能

```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  
  // アクション
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}
```

#### セッション管理

- 自動セッション更新
- ローカルストレージでの永続化
- セッション状態の監視

### Supabase Auth連携

```typescript
// 認証状態の監視
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user || null);
  
  if (session?.user?.id) {
    fetchProfile(session.user.id);
  }
});
```

## ユーザー管理

### プロフィール情報

```typescript
interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  roll: 'Student' | 'Teacher' | 'Admin' | null;
  created_at: string;
  updated_at: string;
}
```

### ロール管理

- **Student**: 一般学習者
- **Teacher**: 教師・指導者
- **Admin**: 管理者

### プロフィール取得の強化

```typescript
export const getProfileWithRetry = async (userId: string) => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    // リトライロジック
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error) return { data, error: null };
    
    retryCount++;
    if (retryCount <= maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
    }
  }
  
  // フォールバック処理
  return createFallbackProfile(userId);
};
```

## UI/UX機能

### ダークモード

全コンポーネントでダークモード対応を実装しています。

```typescript
const { theme } = useTheme();

const className = `${
  theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900'
}`;
```

### レスポンシブデザイン

- モバイルファースト設計
- Tailwind CSSによる柔軟なレイアウト
- タッチデバイス対応

### サイドバーナビゲーション

```typescript
// モバイル対応のサイドバー
const [sidebarOpen, setSidebarOpen] = useState(false);

// ハンバーガーメニュー
<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="md:hidden"
>
  <HamburgerIcon />
</button>
```

### ローディング状態

```typescript
// スケルトンローディング
if (loading) {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
}
```

## パフォーマンス最適化

### 遅延読み込み

```typescript
// React.lazy による動的インポート
const LearningContentInteraction = React.lazy(() => 
  import('./LearningContentInteraction')
);

// Suspense でラップ
<Suspense fallback={<LoadingSpinner />}>
  <LearningContentInteraction contentId={contentId} />
</Suspense>
```

### メモ化

```typescript
// useMemo でコンポーネントの最適化
const memoizedContent = useMemo(() => {
  return processContent(content);
}, [content]);

// useCallback でイベントハンドラーの最適化
const handleLike = useCallback(async () => {
  await toggleLike();
}, [toggleLike]);
```

## セキュリティ機能

### Row Level Security (RLS)

```sql
-- いいねテーブルのRLS
CREATE POLICY "Users can view all likes" ON learning_content_likes
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON learning_content_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON learning_content_likes
FOR DELETE USING (auth.uid() = user_id);
```

### 関数のセキュリティ

```sql
-- search_path の設定
ALTER FUNCTION update_timestamp_column() SET search_path = '';
```

## 記事ページ機能

### 最新記事表示機能

記事ページの上部に最新の3つの記事を表示する機能を実装しました（2025年6月）。

#### 主要機能

1. **最新記事セクション**
   - 更新日時順で最新3つの記事を表示
   - 美しいグラデーション背景
   - カテゴリバッジの表示
   - 更新日時の人間に優しい表示（「今日更新」「昨日更新」「○日前更新」）

2. **ジャンプ機能**
   - 最新記事カードをクリックすると該当記事にスムーズスクロール
   - ハイライト効果付きでユーザビリティを向上
   - 2秒間のパルスアニメーション

#### 技術実装

```typescript
// 最新記事の抽出
const latestArticles = displayContents
  .filter(content => canAccessContent(content.id))
  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  .slice(0, 3);

// ジャンプ機能
const handleJumpToArticle = (articleId: string) => {
  setTimeout(() => {
    const articleElement = document.getElementById(`article-${articleId}`);
    if (articleElement) {
      articleElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // ハイライト効果
      articleElement.classList.add('highlight-article');
      setTimeout(() => {
        articleElement.classList.remove('highlight-article');
      }, 2000);
    }
  }, 100);
};
```

#### ハイライト効果のCSS

```css
.highlight-article {
  animation: highlight-pulse 2s ease-in-out;
  transform: scale(1.02);
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
}

@keyframes highlight-pulse {
  0% {
    transform: scale(1);
    border-color: inherit;
    box-shadow: inherit;
  }
  50% {
    transform: scale(1.02);
    border-color: #8b5cf6;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
  100% {
    transform: scale(1.02);
    border-color: #8b5cf6;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
}
```

### 統一デザインシステム

全ページにわたってモダンなグラデーションデザインを統一実装しました。

#### グラデーション仕様

**ライトモード**:
```css
/* メイン背景 */
bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50

/* カード背景 */
bg-gradient-to-r from-blue-50 to-indigo-50

/* 最新記事セクション */
bg-gradient-to-r from-indigo-100 to-purple-100
```

**ダークモード**:
```css
/* メイン背景 */
bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-800

/* カード背景 */
bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900

/* 最新記事セクション */
bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900
```

#### 半透明カード設計

```typescript
// 統一されたカードスタイル
const cardStyles = `${
  theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900' 
    : 'bg-gradient-to-r from-blue-50 to-indigo-50'
} rounded-xl shadow-xl border ${
  theme === 'dark' 
    ? 'border-slate-700/50' 
    : 'border-blue-200'
} p-6`;
```

### ページ間デザイン統一

以下のページで統一デザインを適用：

1. **ArticlesPage** - 記事一覧と最新記事機能
2. **LearningPage** - 学習コンテンツページ
3. **TestPage** - クイズ・テストページ
4. **Header/Footer** - ナビゲーション要素

#### 統一された配色パレット

- **Primary**: Indigo/Purple系グラデーション
- **Secondary**: Blue/Slate系グラデーション
- **Accent**: Violet/Purple系グラデーション
- **Border**: 半透明効果で深度表現

## 最新更新履歴

### 2025年1月 - UI/UX大幅改善

#### 新機能
- 📱 最新記事3つの専用表示セクション
- 🎯 記事への直接ジャンプ機能
- ✨ ハイライト効果付きナビゲーション
- 🎨 全ページ統一グラデーションデザイン

#### 技術改善
- 🛠️ TypeScriptエラーの完全解消
- 🎭 ダークモード対応の強化
- 📐 レスポンシブデザインの最適化
- ⚡ パフォーマンス向上

#### デザイン統一
- 🌈 モダンなグラデーション背景
- 💎 半透明カード効果
- 🎪 統一されたカラーパレット
- 🖼️ 視覚的階層の明確化

## 今後の拡張予定

1. **リアルタイム機能**: Supabase Realtimeを活用したリアルタイム更新
2. **通知システム**: いいねやコメントの通知機能
3. **検索機能**: 全文検索とフィルタリング
4. **分析機能**: 学習進捗の詳細分析
5. **モバイルアプリ**: React Nativeによるネイティブアプリ
6. **記事推薦**: AIベースの個人化記事推薦システム
7. **学習進捗可視化**: インタラクティブな進捗チャート

## 関連ドキュメント

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発ガイド
- [ROADMAP.md](./ROADMAP.md) - 開発ロードマップ
- [troubleshooting/authentication-issues.md](./troubleshooting/authentication-issues.md) - 認証トラブルシューティング 