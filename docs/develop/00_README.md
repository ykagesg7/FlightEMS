# Web4択問題アプリ開発 プロジェクトドキュメント

## プロジェクト概要
本プロジェクトは、Webベースの4択問題アプリケーションを開発することを目的とします。特に、最新の脳科学や学習理論を取り入れ、効率的な暗記と長期記憶への定着を支援する機能を盛り込むことを目指します。ユーザーは問題デッキを作成・学習し、進捗や苦手分野を把握しながら効果的に知識を習得できます。既存のFlightAcademyプロジェクトに統合され、React, TypeScript, Supabase, Vite, Tailwind CSSの技術スタックで開発されます。

## ゴール
AI（例: GitHub Copilot Workspace, LLM）がMVP（Minimum Viable Product）開発を一気に進められるような、構造化されたドキュメント群をマークダウン形式で出力すること。

## ドキュメント構成と進捗
(*凡例: [x] = 完了, [p] = 部分的に完了/作業中, [ ] = 未着手*)

- [x] `00_README.md`: プロジェクト概要と進捗管理 (このファイル)
- [p] `01_Requirements_Definition.md`: 要件定義書
    - [x] 1. プロジェクト概要 (本文書に記載)
    - [x] 2. ターゲットユーザー (FlightAcademyの既存ユーザー、事業用操縦士（飛行機）学習者)
    - [p] 3. 機能要件
        - [x] 3.1 必須機能 (ユーザー登録・ログイン、カテゴリ選択、4択問題出題・回答、スコア追跡、リーダーボード、正解率表示、問題管理基本)
        - [x] 3.2 便利機能 (MVP範囲: 難易度設定(easy,medium,hard)、タイマー機能、復習機能(間違えた問題)、解説文画像添付)
        - [x] 3.3 脳科学的機能 (SRS: 間隔反復学習システム)
        - [x] 3.4 AIパーソナライズ機能 (初期: 苦手カテゴリ推薦、カテゴリ別正答率レーダーチャート)
    - [ ] 4. 非機能要件 (パフォーマンス、セキュリティ、ユーザビリティ、メンテナンス性)
    - [x] 5. ロール定義と権限 (Admin, Teacher, Student)
- [p] `02_Database_Design.md`: データベース設計書
    - [ ] 1. ER図 (Mermaid)
    - [p] 2. テーブル定義 (DDL)
        - [x] 2.1 `profiles` (既存利用確定)
        - [x] 2.2 `question_categories` (DDL定義済み)
        - [x] 2.3 `card_decks` (DDL定義済み)
        - [x] 2.4 `questions` (DDL定義済み - UUID採用)
        - [x] 2.5 `learning_records` (DDL定義済み - 全履歴、自信度削除、解答時間重視)
        - [x] 2.6 `user_question_srs_status` (DDL定義済み)
- [p] `03_API_Specification.md`: API仕様書
    - [x] 1. 認証 (Supabase Auth)
    - [p] 2. RPC関数
        - [ ] 2.1 `get_quiz_session`
        - [ ] 2.2 `submit_answer`
        - [ ] 2.3 `get_review_questions`
        - [ ] 2.4 `get_recommended_categories`
        - [ ] 2.5 `import_deck_from_csv`
        - [ ] 2.6 `get_category_performance_stats`
        - [ ] (追加のAdmin/Teacher向け関数定義)
    - [ ] 3. RLSポリシー
- [p] `04_UI_UX_Specification.md`: UI/UX仕様書
    - [p] 1. 全体的なユーザーストーリー/フロー (Mermaid)
        - [ ] 1.1 新規登録フロー
        - [ ] 1.2 ログインフロー
        - [p] 1.3 標準学習フロー
        - [ ] 1.4 問題管理フロー (Admin)
    - [p] 2. 主要画面ワイヤーフレーム
        - [ ] 2.1 A. 認証関連画面 (ログイン, 新規登録, PWリセット)
        - [p] 2.2 B. ダッシュボード画面
        - [ ] 2.3 C. デッキ一覧・選択画面
        - [p] 2.4 D. 問題解答画面
        - [ ] 2.5 E. 学習結果画面
        - [ ] 2.6 F. 問題管理画面 (Admin)
        - [ ] 2.7 G. 学習分析画面 (Admin/Teacher - MVP+)
- [p] `05_Data_Migration_Plan.md`: データ移行計画書
    - [x] 1. 移行対象データ定義 (quiz_questions, user_quiz_results)
    - [x] 2. 移行戦略概要 (新テーブルへのマッピング、UUID化)
    - [p] 3. 移行手順とスクリプト骨子
        - [ ] 3.1 `quiz_questions` -> `questions`
        - [ ] 3.2 `user_quiz_results` -> `learning_records` & `user_question_srs_status`
- [p] `06_Development_Environment_Setup.md`: 開発環境セットアップ手順
    - [x] 1. 前提ツールリスト
    - [x] 2. プロジェクトセットアップ手順 (Vite + React + TS)
    - [x] 3. Supabase CLI設定
    - [x] 4. Tailwind CSS設定
    - [x] 5. 起動方法と確認