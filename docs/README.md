# FlightAcademyTsx

## 概要
FlightAcademyTsxは、航空機パイロット向けの包括的な学習・計画プラットフォームです。React+TypeScript+Supabaseを基盤とし、学習コンテンツ管理、進捗・テスト連携、ソーシャル機能、フリーミアム公開、認証、SPAルーティング、パフォーマンス最適化などを実現しています。

---

## 主な機能
- **学習コンテンツ管理**（MDXベース、カテゴリ・進捗・タグ管理）
- **進捗・テスト連携**（CPL試験システム統合、学習-テストマッピング、進捗ダッシュボード）
- **ソーシャル機能**（いいね・コメント、ユーザープロフィール、ロール管理）
- **フリーミアム公開**（一部記事の無料公開、未ログインユーザー向け制御）
- **認証**（Zustand+Supabase Auth、メール/パスワード、今後OAuth拡張予定）
- **SPAルーティング**（React Router、遅延読み込み、404対応）
- **パフォーマンス最適化**（仮想化、遅延読み込み、Vite/Babel最適化、Core Web Vitals指標）

詳細な機能設計・UI/UX・API仕様は[FEATURES.md](./FEATURES.md)をご参照ください。

---

## 現在の開発状況（2025年7月時点）
- **Phase 5進行中**
  - ルーティング・認証UI/UXの最適化、セキュリティ強化（APIキー・環境変数管理）、Vite/Babel/React18の最適化、型安全性・テストカバレッジ拡大
  - CPL試験システム統合準備、学習-テスト連携基盤の構築
- **品質管理**
  - 型安全性（any型ほぼ排除）、ESLint/Prettierによる静的解析、Vitest+React Testing Libraryによるテスト、CI/CD（Vercel/Supabase/GitHub Actions）
- **パフォーマンス**
  - Core Web Vitals・バンドルサイズ・レンダリング最適化指標を明示し、react-window等で大規模データも高速表示

---

## 今後の開発計画
- **直近の優先タスク**
  1. 学習進捗管理UIの実装強化（記事ごとの進捗率・完了管理・復習サポートUI）
  2. CPL試験システムの本格統合（学習-テスト連携、出題傾向分析、優先記事推薦、進捗ダッシュボード）
  3. UI/UXのさらなる改善（サイドバー・アクセシビリティ・ARIA属性強化、記事内検索・ハイライト機能）
  4. AI・モバイル対応（AIによる記事推薦、React Nativeによるモバイルアプリ化）
  5. パフォーマンス・セキュリティの継続的最適化（PWA対応、RLS/認証強化、バンドル最適化）
  6. 管理者向け機能拡充（コンテンツ管理・同期機能、外部LMS連携）
- **長期的な拡張予定・リスク管理・定期レビュー**
  - 詳細は[ROADMAP.md](./ROADMAP.md)を参照

---

## 技術スタック
- **フロント**：React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Router
- **バックエンド**：Supabase（PostgreSQL, Auth, Edge Functions, RLS）
- **テスト・CI/CD**：Vitest, React Testing Library, ESLint, Prettier, Vercel, Supabase Cloud, GitHub Actions
- **地図・ナビゲーション**：Leaflet, React-Leaflet, GeoJSON
- **品質指標**：型安全性、テストカバレッジ、Core Web Vitals、バンドルサイズ、アクセシビリティ
- 詳細は[TECHNICAL_STACK.md](./TECHNICAL_STACK.md)参照

---

## 品質管理・開発フロー
- 型安全性・テスト・CI/CD・ドキュメント自動更新
- コントリビューションガイド・改善提案の流れ（[improvement-proposals/](./improvement-proposals/)）
- トラブルシューティング・開発ガイド（[troubleshooting/](./troubleshooting/), [guides/](./guides/)）

---

## 参照リンク
- [機能詳細・設計仕様（FEATURES.md）](./FEATURES.md)
- [開発計画・優先順位（ROADMAP.md）](./ROADMAP.md)
- [技術スタック詳細（TECHNICAL_STACK.md）](./TECHNICAL_STACK.md)
- [改善提案・議論（improvement-proposals/）](./improvement-proposals/)
- [トラブルシューティング](./troubleshooting/)
- [開発ガイド](./guides/)
- [ドキュメント自動更新システム（AUTOMATED_DOCS_SYSTEM.md）](./AUTOMATED_DOCS_SYSTEM.md)
- [パフォーマンス改善計画（PERFORMANCE_IMPROVEMENTS.md）](./PERFORMANCE_IMPROVEMENTS.md)
- [会話履歴・議論要約（CONVERSATION_SUMMARY.md）](./CONVERSATION_SUMMARY.md)
- [開発詳細ガイド・設計書（development/）](./development/)
- [コントリビューションガイド（CONTRIBUTING.md）](./development/CONTRIBUTING.md)
- [開発ガイド（DEVELOPMENT.md）](./development/DEVELOPMENT.md)
- [高度な機能・トラブルシューティング（ADVANCED.md）](./development/ADVANCED.md)
- [学習-テスト連携ガイド（LEARNING_TEST_INTEGRATION.md）](./development/LEARNING_TEST_INTEGRATION.md)
- [パフォーマンス最適化ガイド（PERFORMANCE_OPTIMIZATION_PLAN.md）](./development/PERFORMANCE_OPTIMIZATION_PLAN.md)
- [設計・仕様・開発プロセス（development/process/）](./development/process/)

---

## 更新履歴
- 最終更新日：2025年7月23日
- バージョン：ドキュメント統合版
- UIテーマ・HUDライン仕様変更（2025年7月23日）
  - Dayテーマ時はHeader/Main/Footerの背景をNavy Blue単色（#14213d）に統一
  - Darkテーマ時はHeader/Main/Footerの背景をダークグレー（#1f2937等）に統一
  - Header下・Footer上にHUDラインを追加（DayはHUDグリーン #39FF14、Darkは赤 #FF3B3B）
  - HUDラインは高さ0.5pxで極細表示
  - Footerのテキスト色もテーマに応じて切り替え（DayはHUDグリーン、Darkは赤）
