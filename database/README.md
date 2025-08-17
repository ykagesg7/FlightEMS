# FlightAcademy データベース設定

このディレクトリには、FlightAcademyアプリケーションのデータベース設定に関するファイルが含まれています。

## 📋 概要

このプロジェクトでは、Supabaseをバックエンドとして使用しており、以下の主要なテーブルが定義されています：

### **基本テーブル**
1. **profiles**: ユーザープロフィール情報を保存
2. **progress**: ユーザーの学習進捗状況を保存

### **学習コンテンツ管理**
3. **learning_contents**: 学習記事の管理（CPL学科コンテンツ含む）
4. **learning_test_mapping**: 学習記事とテスト問題のマッピング

### **クイズ・テストシステム**
5. **question_categories**: 問題カテゴリ管理
6. **card_decks**: カードデッキ管理
7. **questions**: 一般問題管理
8. **unified_cpl_questions**: 統一CPL問題管理

### **学習記録・進捗管理**
9. **learning_records**: 学習記録
10. **learning_sessions**: 学習セッション記録
11. **user_learning_profiles**: ユーザー学習プロファイル

### **SRS（間隔反復学習）システム**
12. **user_question_srs_status**: 一般問題SRS状態
13. **user_unified_srs_status**: 統一CPL問題SRS状態

### **テスト結果管理**
14. **quiz_sessions**: クイズセッション
15. **user_test_results**: ユーザーテスト結果

### **ソーシャル機能**
16. **learning_content_views**: コンテンツ閲覧記録
17. **learning_content_likes**: コンテンツいいね
18. **learning_content_comments**: コンテンツコメント

## 🚀 セットアップ手順

### Supabaseプロジェクトでのセットアップ

1. [Supabaseダッシュボード](https://app.supabase.io)にログインします
2. 対象のプロジェクトを選択します
3. 左側のメニューから「SQL Editor」を選択します
4. 「New Query」ボタンをクリックします
5. `unified_database_schema.sql`ファイルの内容をコピーして貼り付けます
6. 「Run」ボタンをクリックしてSQLを実行します

## 🔒 セキュリティ（RLS）について

データベースはRow Level Security (RLS)ポリシーで保護されています：

### **基本テーブル**
- **profiles**: ユーザーは自分のプロフィールのみを閲覧・更新できます
- **progress**: ユーザーは自分の学習進捗のみを閲覧・更新・削除できます

### **学習コンテンツ**
- **learning_contents**: 全ユーザーが閲覧可能、教師ロールのみ管理可能

### **ソーシャル機能**
- **learning_content_views**: 全ユーザーが閲覧・追加可能
- **learning_content_likes**: 全ユーザーが閲覧・追加可能、ログインユーザーは自分のいいねのみ削除可能
- **learning_content_comments**: 全ユーザーが閲覧可能、認証済みユーザーのみ投稿・更新・削除可能

## ⚙️ 自動化機能

### **トリガー**
以下の自動化トリガーが設定されています：

1. **ユーザー登録時**: プロフィールを自動作成するトリガー
2. **レコード更新時**: `updated_at`フィールドを自動更新するトリガー

### **関数**
- **handle_new_user()**: 新規ユーザー登録時のプロフィール自動作成
- **update_modified_column()**: 更新日時の自動更新

## 📊 ビュー・インデックス

### **ビュー**
- **v_mapped_questions**: 学習記事とマッピングされた問題の結合ビュー

### **インデックス**
パフォーマンス向上のため、主要なクエリパターンに対応したインデックスが作成されています：
- カテゴリ・サブカテゴリ検索
- 学習コンテンツの公開状態
- SRS次回復習日
- ユーザーテスト結果
- ソーシャル機能

## 📁 ファイル構成

### **主要ファイル**
- **unified_database_schema.sql**: 統合されたデータベーススキーマ（推奨）
- **schema.sql**: 基本スキーマ（レガシー）
- **supabase_migration.sql**: Supabase移行用
- **quiz_system_migration.sql**: クイズシステム用
- **learning_test_mapping_migration.sql**: 学習・テスト連携用
- **learning_test_integration_functions.sql**: 学習・テスト連携関数
- **learning_test_mapping_data.sql**: 学習・テストマッピングデータ
- **learning_system_fixes.sql**: 学習システム修正
- **article_social_features_migration_v2.sql**: ソーシャル機能v2

### **CPL学科コンテンツ登録ファイル**
- **insert_3.1.x_*.sql**: 航空法規シリーズ（3.1.1〜3.1.4）
- **insert_3.2.x_*.sql**: 航空工学シリーズ（3.2.1〜3.2.6）

## 🔧 運用・保守

### **データベース更新**
1. **スキーマ変更**: `unified_database_schema.sql`を使用
2. **コンテンツ追加**: 対応するinsert_*.sqlファイルを使用
3. **SupabaseMCP**: 本番環境での安全な実行

### **バックアップ・復元**
- Supabaseの自動バックアップ機能を活用
- 重要なデータ変更前には手動バックアップを推奨

## 🐛 問題解決

セットアップ中に問題が発生した場合：

1. **SQLエラー**: エラーメッセージの詳細を確認
2. **既存テーブル**: `IF NOT EXISTS`を使用しているため、エラーは発生しません
3. **RLSポリシー**: 既存ポリシーの削除（`DROP POLICY IF EXISTS ...`）を先に実行
4. **制約エラー**: 外部キー制約の順序を確認

## 📈 パフォーマンス最適化

### **推奨設定**
- **接続プール**: 適切な接続数設定
- **クエリ最適化**: インデックスの活用
- **キャッシュ戦略**: 頻繁にアクセスされるデータのキャッシュ

### **監視**
- **クエリパフォーマンス**: 遅いクエリの特定と最適化
- **インデックス使用率**: 未使用インデックスの削除
- **テーブルサイズ**: 定期的なメンテナンス

---

**最終更新**: 2025年8月17日
**バージョン**: Database Setup Guide v2.0
**管理者**: FlightAcademy開発チーム
