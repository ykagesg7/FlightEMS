# 開発者向けドキュメント

このディレクトリには、FlightAcademyTsxプロジェクトの開発に関する技術的なドキュメントが含まれています。

## ドキュメント構成

### 開発プロセス
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: 開発プロセス、Git連携、Supabase連携の詳細
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: コントリビューションガイドとコーディング規約
- **[ADVANCED.md](./ADVANCED.md)**: 高度な機能、図表作成機能、AIエージェント自動化

### 詳細設計 (`process/`)
- **[00_README.md](./process/00_README.md)**: 開発プロセスドキュメントの概要
- **[01_Requirements_Definition.md](./process/01_Requirements_Definition.md)**: 要件定義書
- **[02_Database_Design.md](./process/02_Database_Design.md)**: データベース設計書
- **[03_API_Specification.md](./process/03_API_Specification.md)**: API仕様書
- **[04_UI_UX_Specification.md](./process/04_UI_UX_Specification.md)**: UI/UX仕様書
- **[05_Data_Migration_Plan.md](./process/05_Data_Migration_Plan.md)**: データ移行計画書
- **[06_Development_Environment_Setup.md](./process/06_Development_Environment_Setup.md)**: 開発環境セットアップ
- **[07_Implementation_Progress.md](./process/07_Implementation_Progress.md)**: 実装進捗管理
- **[08_ExamTab_Integration_Plan.md](./process/08_ExamTab_Integration_Plan.md)**: 試験タブ統合計画

## 対象読者

- **新規開発者**: DEVELOPMENT.md → CONTRIBUTING.md → process/00_README.md の順で読むことを推奨
- **既存開発者**: 必要に応じて個別のドキュメントを参照
- **プロジェクトマネージャー**: process/内の設計ドキュメントを中心に参照

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL), Supabase Auth
- **開発ツール**: Cursor IDE, MCP機能
- **デプロイ**: Vercel

## 関連リンク

- [プロジェクト概要](../README.md)
- [ガイド・チュートリアル](../guides/)
- [トラブルシューティング](../troubleshooting/) 