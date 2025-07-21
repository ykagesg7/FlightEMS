# 技術スタック詳細

## 📋 概要

このドキュメントは、FlightAcademyプロジェクトで使用されている技術スタックの詳細な情報を記録します。

**最終更新**: 2025年7月19日
**バージョン**: Technical Stack v1.0

---

## 🏗️ アーキテクチャ概要

### **フロントエンド**
- **React 18**: Concurrent Mode、Suspense、useTransition
- **TypeScript**: 型安全性、開発効率向上
- **Vite**: 高速ビルドツール、動的チャンク分割

### **バックエンド**
- **Supabase**: データベース、認証、リアルタイム機能
- **PostgreSQL**: リレーショナルデータベース

### **地図・ナビゲーション**
- **Leaflet**: インタラクティブ地図ライブラリ
- **React-Leaflet**: React用Leafletラッパー
- **GeoJSON**: 地理データ形式

---

## 🛠️ フロントエンド技術スタック

### **コアフレームワーク**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

#### **React 18 の主要機能**
- **Concurrent Mode**: 非同期レンダリング
- **Suspense**: ローディング状態管理
- **useTransition**: 優先度付き更新
- **Automatic Batching**: 自動バッチング

### **ビルドツール**
```json
{
  "vite": "^4.4.0",
  "@vitejs/plugin-react": "^4.0.0"
}
```

#### **Vite の最適化機能**
- **動的チャンク分割**: コード分割の最適化
- **HMR (Hot Module Replacement)**: 高速開発
- **ESBuild**: 高速バンドリング

### **UI・スタイリング**
```json
{
  "tailwindcss": "^3.3.0",
  "react-select": "^5.7.0",
  "@headlessui/react": "^1.7.0"
}
```

#### **Tailwind CSS**
- **ユーティリティファースト**: 効率的なスタイリング
- **レスポンシブデザイン**: モバイルファースト
- **カスタムテーマ**: ダークモード対応

#### **React Select**
- **型安全**: TypeScript対応
- **カスタマイズ可能**: 高度なカスタマイズ
- **アクセシビリティ**: WCAG準拠

### **状態管理**
```json
{
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^4.29.0"
}
```

#### **Zustand**
- **軽量**: バンドルサイズ最小
- **型安全**: TypeScript対応
- **シンプル**: 学習コスト低

#### **React Query**
- **サーバー状態管理**: キャッシュ、同期
- **バックグラウンド更新**: 自動更新
- **エラーハンドリング**: 包括的エラー処理

---

## 🗺️ 地図・ナビゲーション技術

### **Leaflet エコシステム**
```json
{
  "leaflet": "^1.9.0",
  "react-leaflet": "^4.2.0",
  "@types/leaflet": "^1.9.0"
}
```

#### **主要機能**
- **インタラクティブ地図**: ズーム、パン、クリック
- **マーカー管理**: 空港、ナビゲーション支援施設
- **ルート描画**: 飛行経路の可視化
- **レイヤー管理**: 複数レイヤーの重ね合わせ

### **地理データ形式**
```typescript
// GeoJSON 型定義
interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[][];
  };
  properties: {
    name: string;
    type: string;
    [key: string]: any;
  };
}
```

---

## 🔒 認証・セキュリティ

### 【現状】
- 認証はSupabase Auth（メール/パスワード認証）＋Zustandによる一元状態管理。
- Context/Providerによる認証管理は廃止し、Zustand selectorの参照安定化を徹底。
- 外部OAuth（Google等）は今後段階的に対応予定。
- 認証関連の主要UI/ロジックは`AuthPage.tsx`・`AuthButton.tsx`に集約。
- テストはVitest＋React Testing Libraryで拡充し、Zustandのstoreモックも最新APIに対応。

### 【今後の方針】
- 外部OAuth（Google, GitHub等）対応の段階的導入
- テストカバレッジ・UI/UX品質のさらなる向上
- セッション管理・RLS・型安全性の強化

### **環境変数管理**
```typescript
// 型安全な環境変数
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GOOGLE_CLOUD_VISION_API_KEY: string;
  readonly VITE_GMAIL_SMTP_PASSWORD: string;
  readonly VITE_BREVO_API_KEY: string;
}
```

---

## 🧪 テスト・品質管理

### **テストフレームワーク**
```json
{
  "vitest": "^0.34.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.0"
}
```

#### **Vitest**
- **高速**: Viteベースの高速テスト
- **TypeScript対応**: ネイティブTSサポート
- **ESM対応**: モジュールシステム対応

#### **React Testing Library**
- **ユーザー中心**: ユーザー行動に基づくテスト
- **アクセシビリティ**: アクセシビリティテスト
- **実用的**: 実際の使用パターンに基づくテスト

### **コード品質**
```json
{
  "eslint": "^8.45.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0"
}
```

#### **ESLint 設定**
- **TypeScript対応**: 型安全性チェック
- **React対応**: React固有のルール
- **カスタムルール**: プロジェクト固有のルール

---

## 📊 パフォーマンス最適化

### **React 18 Concurrent Features**
```typescript
// Suspense 境界
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>

// useTransition
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setState(newState);
});
```

### **仮想化**
```json
{
  "react-window": "^1.8.0",
  "react-virtualized-auto-sizer": "^1.0.0"
}
```

#### **react-window**
- **大量データ**: 効率的なリスト表示
- **メモリ最適化**: 表示領域のみレンダリング
- **パフォーマンス**: 大幅なパフォーマンス向上

### **コード分割**
```typescript
// 動的インポート
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 条件付きローディング
const Component = lazy(() =>
  condition ? import('./ComponentA') : import('./ComponentB')
);
```

---

## 🔧 開発ツール

### **開発環境**
```json
{
  "@types/node": "^20.0.0",
  "prettier": "^2.8.0",
  "husky": "^8.0.0",
  "lint-staged": "^13.2.0"
}
```

#### **Prettier**
- **コードフォーマット**: 一貫したコードスタイル
- **自動フォーマット**: 保存時自動フォーマット
- **設定可能**: プロジェクト固有の設定

#### **Husky & lint-staged**
- **Git hooks**: コミット前チェック
- **品質保証**: 自動品質チェック
- **一貫性**: チーム開発での一貫性確保

### **デバッグ・ログ**
```typescript
// カスタムロガー
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

---

## 📱 レスポンシブ・アクセシビリティ

### **レスポンシブデザイン**
```css
/* Tailwind CSS ブレークポイント */
.sm: 640px   /* スマートフォン */
.md: 768px   /* タブレット */
.lg: 1024px  /* デスクトップ */
.xl: 1280px  /* 大画面 */
```

### **アクセシビリティ**
- **WCAG 2.1 AA準拠**: アクセシビリティガイドライン
- **キーボードナビゲーション**: 完全キーボード対応
- **スクリーンリーダー**: 音声読み上げ対応
- **色覚異常対応**: 色以外の識別手段

---

## 🚀 デプロイメント・CI/CD

### **ホスティング**
- **Vercel**: フロントエンドホスティング
- **Supabase**: バックエンドサービス

### **環境管理**
```bash
# 環境変数
.env.local      # ローカル開発
.env.production # 本番環境
.env.example    # テンプレート
```

### **ビルド最適化**
```typescript
// Vite 設定
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          map: ['leaflet', 'react-leaflet']
        }
      }
    }
  }
});
```

---

## 📈 パフォーマンス指標

### **Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **バンドルサイズ**
- **初期バンドル**: < 500KB
- **動的チャンク**: < 200KB
- **総バンドルサイズ**: < 2MB

### **レンダリング性能**
- **初回レンダリング**: < 1秒
- **インタラクション応答**: < 100ms
- **メモリ使用量**: < 100MB

---

## 🔮 今後の技術計画

### **短期計画（1-3ヶ月）**
- **PWA対応**: Service Worker、オフライン機能
- **パフォーマンス最適化**: さらなる最適化
- **型安全性向上**: 100%型安全性達成

### **中期計画（3-6ヶ月）**
- **マイクロフロントエンド**: モジュール化
- **リアルタイム機能**: WebSocket統合
- **高度な分析**: データ可視化

### **長期計画（6ヶ月以上）**
- **AI統合**: 機械学習機能
- **モバイルアプリ**: React Native
- **クラウドネイティブ**: マイクロサービス

---

## 📚 関連ドキュメント

- **[パフォーマンス最適化計画](./development/PERFORMANCE_OPTIMIZATION_PLAN.md)**
- **[開発ガイド](./guides/)**
- **[トラブルシューティング](./troubleshooting/)**

---

**最終更新**: 2025年7月19日
**バージョン**: Technical Stack v1.0
