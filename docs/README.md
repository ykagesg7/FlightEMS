# FlightAcademy ドキュメント

## 📚 ドキュメント構成

### **📋 概要・計画**
- **[README.md](./README.md)** - このファイル（ドキュメント概要）
- **[ROADMAP.md](./ROADMAP.md)** - プロジェクト全体のロードマップ
- **[FEATURES.md](./FEATURES.md)** - 機能仕様書
- **[CONVERSATION_SUMMARY.md](./CONVERSATION_SUMMARY.md)** - 会話履歴要約と今後の方向性

### **🔧 開発・技術**
- **[TECHNICAL_STACK.md](./TECHNICAL_STACK.md)** - 技術スタック詳細
- **[PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md)** - パフォーマンス改善計画
- **[AUTOMATED_DOCS_SYSTEM.md](./AUTOMATED_DOCS_SYSTEM.md)** - 自動ドキュメント更新システム
- **[development/](./development/)** - 開発関連ドキュメント
- **[guides/](./guides/)** - 開発ガイド

### **📈 改善提案・実装報告**
- **[improvement-proposals/](./improvement-proposals/)** - 改善提案と実装報告

### **🛠️ トラブルシューティング**
- **[troubleshooting/](./troubleshooting/)** - トラブルシューティングガイド

---

## 🎯 現在の状況

### **✅ Phase 1 完了（2025年1月27日）**
- **TypeScript型安全性の確立**
  - 70%のany型削除（30箇所 → 9箇所）
  - 45個の新規型定義追加
  - 外部ライブラリ型定義の整備
- **詳細**: [Phase 1包括的改善報告](./improvement-proposals/phase1-comprehensive-improvement-report.md)

### **🔄 ドキュメント統廃合完了（2025年7月19日）**
- **ファイル統合**: 20個のファイルを9個に統合（55%削減）
- **型安全性改善**: 主要コンポーネントの型エラー解決
- **自動ドキュメント更新システム**: 実装完了
- **詳細**: [会話履歴要約](./CONVERSATION_SUMMARY.md)

### **🔄 Phase 2 準備中**
- **パフォーマンス最適化**
- **UX改善**
- **継続的改善**

---

## 📊 プロジェクト概要

FlightAcademyは、航空機パイロット向けの包括的な学習・計画プラットフォームです。

### **主要機能**
- 🗺️ **経路計画**: インタラクティブな地図ベースの飛行計画
- 📚 **学習システム**: 適応型学習と進捗管理
- 🌤️ **気象情報**: リアルタイム気象データ統合
- 📊 **分析・レポート**: 学習進捗と飛行データの分析

### **技術スタック**
- **フロントエンド**: React 18 + TypeScript + Vite
- **地図**: Leaflet + React-Leaflet
- **UI**: Tailwind CSS + React Select
- **バックエンド**: Supabase
- **認証**: Zustand＋Supabase Auth（メール/パスワード認証のみ、Context/Providerや外部認証は未使用）
- **テスト**: Vitest + React Testing Library

---

## 🚀 開発環境セットアップ

### **前提条件**
- Node.js 18+
- npm または yarn
- Git

### **セットアップ手順**
```bash
# リポジトリのクローン
git clone <repository-url>
cd FlightAcademyTsx

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集して必要なAPIキーを設定

# 開発サーバーの起動
npm run dev

# テストの実行
npm test
```

### **主要スクリプト**
- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run test` - テスト実行
- `npm run lint` - ESLint実行
- `npm run type-check` - TypeScript型チェック

---

## 📈 品質指標

### **型安全性**
- **any型削除率**: 70%達成（30箇所 → 9箇所）
- **型定義数**: 45個の新規型定義追加
- **型チェック**: 100%成功
- **主要コンポーネント型エラー**: 解決済み（PlanningTab, RoutePlanning, MapTab, NavaidSelector）

### **テスト**
- **テスト数**: 37テスト
- **カバレッジ**: 維持
- **成功率**: 100%

### **ビルド**
- **ビルド成功率**: 100%
- **開発サーバー**: 正常動作

---

## 🔄 開発フロー

### **認証機能の実装方針**
- 認証状態はZustandストアで一元管理しています。
- Context/Providerによる認証状態管理は不要なため削除済みです。
- Google OAuth等の外部認証は今後開発予定です（現状はメール/パスワード認証のみ）。
- 認証関連のUI・ロジックは`AuthPage.tsx`と`AuthButton.tsx`に集約されています。

#### 【認証機能の最新実装・品質管理】
- Zustandストアのselector・参照安定化を徹底し、無限ループやReact警告を完全解消。
- Context/Provider/外部OAuth関連の不要ファイル・コードを削除し、設計をシンプル化。
- 認証UI・ロジックの主要テスト（`AuthButton.test.tsx`, `AuthPage.test.tsx`）を拡充し、全件パスを確認。
- テストはVitest＋React Testing Libraryで実装。Zustandのstoreモックも最新APIに対応。
- 今後もUI/UX・テスト品質・外部認証対応を段階的に強化予定。

### **1. 機能開発**
1. 機能仕様の確認（[FEATURES.md](./FEATURES.md)）
2. 開発環境での実装
3. 型安全性の確保
4. テストの追加・実行

### **2. 改善提案**
1. 改善提案の作成（[improvement-proposals/](./improvement-proposals/)）
2. 実装計画の策定
3. 段階的実装
4. 結果の記録・文書化
5. 自動ドキュメント更新システムによる継続的更新

### **3. 品質管理**
1. TypeScript型チェック
2. ESLint実行
3. 単体テスト実行
4. 開発サーバーでの動作確認

---

## 📝 ドキュメント更新ガイドライン

### **改善提案の作成**
1. `docs/improvement-proposals/`に新しいファイルを作成
2. 改善内容、実装計画、結果を記録
3. 関連ドキュメントの更新

### **技術ドキュメントの更新**
1. 変更内容の記録
2. 影響範囲の明記
3. 次のステップの提示

### **READMEの更新**
1. プロジェクト状況の反映
2. 新しい機能・改善の追加
3. 品質指標の更新

---

## 🤝 コントリビューション

### **開発参加**
1. イシューの確認・作成
2. ブランチの作成
3. 実装・テスト
4. プルリクエストの作成

### **ドキュメント改善**
1. 不足している情報の特定
2. 改善提案の作成
3. 実装・更新

### **品質向上**
1. 型安全性の改善
2. テストの追加
3. パフォーマンスの最適化

---

## 📞 サポート

### **トラブルシューティング**
- [troubleshooting/](./troubleshooting/) - 一般的な問題と解決策

### **開発ガイド**
- [guides/](./guides/) - 開発に関する詳細ガイド

### **技術仕様**
- [development/](./development/) - 技術仕様とアーキテクチャ

---

## 📄 ライセンス

このプロジェクトは適切なライセンスの下で提供されています。

---

**最終更新**: 2025年7月19日
**バージョン**: ドキュメント統廃合完了版
