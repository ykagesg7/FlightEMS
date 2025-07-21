# 03 API仕様書

本ドキュメントでは、Web4択問題アプリのバックエンドAPI（主にSupabase RPC関数とRLSポリシー）の仕様を定義します。

## 1. 認証 (Supabase Auth)
*   Supabaseの組み込み認証機能 (Supabase Auth) を全面的に利用します。
*   **対応フロー**:
    *   メールアドレスとパスワードによるサインアップ
    *   メールアドレスとパスワードによるサインイン
    *   パスワードリセット (Magic Link または 確認メール経由)
    *   サインアウト
    *   セッション管理 (JWTベース、Supabaseクライアントが自動処理)
*   **ユーザー情報**: 認証されたユーザーの情報は `auth.uid()` や `auth.user()` で取得可能です。`profiles` テーブルと `auth.users` テーブルは `id` で紐づきます。

## 2. RPC (Remote Procedure Call) 関数
SupabaseのPostgreSQL関数をRPCとして呼び出し、複雑なビジネスロジックやデータ操作を実行します。各関数は `public` スキーマまたは専用のAPIスキーマに作成します。
フロントエンドからは `supabase.rpc('function_name', { param1: value1, ... })` の形式で呼び出します。

---
### 2.1 `get_quiz_session`
*   **目的**: 指定されたカードデッキから、学習セッション用の問題群を取得する。SRSロジックを考慮し、復習時期の問題や未学習の問題を優先的に含める。
*   **パラメータ**:
    *   `p_deck_id` (uuid): 対象のカードデッキID。
    *   `p_user_id` (uuid): 現在のユーザーID。
    *   `p_num_questions` (integer): 取得する問題数 (例: 10問、20問など。デッキの問題数上限も考慮)。
*   **レスポンス**:
    *   成功時 (200 OK):
        ```json
        [
          {
            "question_id": "uuid",
            "question_text": "string",
            "options": ["string", "string", "string", "string"],
            "difficulty_level": "string" // 'easy', 'medium', 'hard'
            // 解説や正解はここでは返さない (解答後に取得)
          },
          // ... 他の問題オブジェクト
        ]
        ```
    *   エラー時 (4xx, 5xx): 標準的なエラーレスポンス。
*   **ロジック概要**:
    1.  `p_user_id` と `p_deck_id` に紐づく問題を取得。
    2.  `user_question_srs_status` を参照し、`next_review_date` が今日以前の問題を優先リストに追加。
    3.  次に、まだ一度も解答していない (`learning_records` に記録がない) 問題をリストに追加。
    4.  上記で `p_num_questions` に満たない場合、残りの問題をランダムに追加（または最終解答日が古い順など）。
    5.  最終的に `p_num_questions` 分の問題を選択して返す。
*   **RLS**: 呼び出しユーザーが `p_deck_id` を閲覧できる権限があること。

---
### 2.2 `submit_answer`
*   **目的**: ユーザーの解答を記録し、SRS情報を更新する。
*   **パラメータ**:
    *   `p_user_id` (uuid): ユーザーID。
    *   `p_question_id` (uuid): 解答した問題ID。
    *   `p_is_correct` (boolean): 解答が正解だったかどうか。
    *   `p_response_time_ms` (integer, nullable): 解答にかかった時間 (ミリ秒)。
    *   `p_marked_status` (text, nullable): ユーザーが付与したマーク状態 ('checked', 'unknown')。
*   **レスポンス**:
    *   成功時 (200 OK or 201 Created):
        ```json
        {
          "learning_record_id": "uuid", // 作成されたlearning_recordsのID
          "srs_status_updated": true,
          "next_review_date": "timestamp with time zone", // 更新後の次回レビュー日
          "correct_option_index": "smallint", // 問題の正解の選択肢インデックス
          "explanation": "string", // 問題の解説文
          "explanation_image_url": "string" // 問題の解説画像URL
        }
        ```
    *   エラー時 (4xx, 5xx): 標準的なエラーレスポンス。
*   **ロジック概要 (トランザクション内で実行)**:
    1.  `p_user_id` と `p_question_id` で `learning_records` から最新の `attempt_number` を取得し、+1する (存在しなければ1)。
    2.  `learning_records` に新しい解答履歴を挿入。
    3.  `user_question_srs_status` から該当ユーザー・問題のSRS情報を取得 (なければデフォルト値で初期化)。
    4.  簡略版SM-2アルゴリズムに基づき、`p_is_correct` を使って `ease_factor`, `repetitions`, `interval_days`, `next_review_date` を計算。
        *   正解の場合: `repetitions` をインクリメント。`interval_days` を `previous_interval * ease_factor` で計算 (初回は1日、2回目は3-6日など)。`ease_factor` は微調整。
        *   不正解の場合: `repetitions` を0にリセット。`interval_days` を1日 (または短い固定値) に設定。
    5.  `user_question_srs_status` を更新。
    6.  `questions` テーブルから正解の選択肢インデックス、解説文、解説画像URLを取得して返す。
*   **RLS**: 呼び出しユーザーが `p_user_id` と一致すること。

---
### 2.3 `get_review_questions`
*   **目的**: ユーザーが今日またはそれ以前に復習すべき問題のリストを取得する (SRSに基づく)。
*   **パラメータ**:
    *   `p_user_id` (uuid): ユーザーID。
    *   `p_limit` (integer, optional, default 20): 取得する最大問題数。
*   **レスポンス**:
    *   成功時 (200 OK): `get_quiz_session` と同様の問題オブジェクトの配列。
        ```json
        [
          {
            "question_id": "uuid",
            "question_text": "string",
            "options": ["string", "string", "string", "string"],
            "difficulty_level": "string",
            "deck_id": "uuid", // どのデッキの問題か
            "deck_title": "string"
          },
          // ...
        ]
        ```
    *   エラー時 (4xx, 5xx): 標準的なエラーレスポンス。
*   **ロジック概要**:
    1.  `user_question_srs_status` テーブルで、`user_id = p_user_id` かつ `next_review_date <= NOW()` のレコードを検索。
    2.  対応する `questions` テーブルの情報をJOINして取得。
    3.  `p_limit` に基づいて結果を制限。
*   **RLS**: 呼び出しユーザーが `p_user_id` と一致すること。

---
### 2.4 `get_recommended_categories`
*   **目的**: ユーザーの苦手な可能性のある問題カテゴリを推薦する。
*   **パラメータ**:
    *   `p_user_id` (uuid): ユーザーID。
    *   `p_threshold_correct_rate` (real, optional, default 0.6): 正答率の閾値 (この値以下をおすすめ)。
    *   `p_min_attempts` (integer, optional, default 10): カテゴリをおすすめするための最小解答数。
    *   `p_recommend_limit` (integer, optional, default 3): 推薦するカテゴリの最大数。
*   **レスポンス**:
    *   成功時 (200 OK):
        ```json
        [
          {
            "category_id": "uuid",
            "category_name": "string",
            "correct_rate": "real", // 0.0 - 1.0
            "total_attempts": "integer"
          },
          // ...
        ]
        ```
    *   エラー時 (4xx, 5xx): 標準的なエラーレスポンス。
*   **ロジック概要**:
    1.  `learning_records` と `questions`, `card_decks`, `question_categories` をJOIN。
    2.  `p_user_id` でフィルタリングし、カテゴリごとに総解答数と正解数を集計。
    3.  正答率を計算。
    4.  `total_attempts >= p_min_attempts` かつ `correct_rate <= p_threshold_correct_rate` のカテゴリを抽出。
    5.  正答率が低い順、または解答数が多い順などでソートし、`p_recommend_limit` 件を返す。
*   **RLS**: 呼び出しユーザーが `p_user_id` と一致すること。

---
### 2.5 `import_deck_from_csv`
*   **目的**: CSVデータから新しいカードデッキと問題を一括でインポートする。
*   **パラメータ**:
    *   `p_user_id` (uuid): デッキ作成者となるユーザーID (Admin権限が必要)。
    *   `p_deck_title` (text): 作成するデッキのタイトル。
    *   `p_category_name` (text): 紐付けるカテゴリ名 (既存ならそれを利用、なければ新規作成)。
    *   `p_csv_data` (text): CSV形式の文字列データ。
        *   フォーマット: `question_text,option1,option2,option3,option4,correct_option_index,explanation,difficulty_level`
        *   ヘッダー行はあってもなくても良い (パース時に考慮)。
*   **レスポンス**:
    *   成功時 (201 Created):
        ```json
        {
          "deck_id": "uuid",
          "questions_imported_count": "integer"
        }
        ```
    *   エラー時 (4xx, 5xx): CSVパースエラー、データバリデーションエラーなど詳細なエラーメッセージ。
*   **ロジック概要 (トランザクション内で実行)**:
    1.  呼び出しユーザーがAdmin権限を持つか確認。
    2.  `p_category_name` で `question_categories` を検索。なければ新規作成 (この時の `user_id` はAdminのIDまたはNULL)。
    3.  `card_decks` に新しいデッキを挿入。
    4.  `p_csv_data` を行ごとにパース。
    5.  各行をバリデーション (カラム数、`correct_option_index` の範囲、`difficulty_level` の値など)。
    6.  バリデーションが通った問題を `questions` テーブルに挿入 (作成したデッキのIDを紐付け)。
    7.  インポートした問題数をカウントして返す。
*   **RLS**: 呼び出しユーザーがAdminであること。

---
### 2.6 `get_category_performance_stats`
*   **目的**: ユーザーのカテゴリ別パフォーマンス（解答数、正解数、正答率）を取得し、レーダーチャート表示などに利用する。
*   **パラメータ**:
    *   `p_user_id` (uuid): ユーザーID。
    *   `p_target_categories` (text[], optional): 対象とするカテゴリ名の配列。NULLの場合は事業用操縦士（飛行機）関連の主要カテゴリをデフォルトとする。
*   **レスポンス**:
    *   成功時 (200 OK):
        ```json
        [
          {
            "category_id": "uuid",
            "category_name": "string",
            "total_questions_in_category": "integer", // (任意) カテゴリ全体の総問題数
            "attempted_questions": "integer", // カテゴリ内で解答したユニークな問題数
            "correct_answers": "integer", // カテゴリ内での総正解数 (ユニーク問題ベースか全試行ベースかは要件定義)
            "total_attempts_in_category": "integer", // カテゴリ内での総試行回数
            "accuracy": "real" // (correct_answers / attempted_questions) または (correct_answers / total_attempts_in_category)
          },
          // ... 他のカテゴリの統計
        ]
        ```
*   **ロジック概要**:
    1.  `p_user_id` の `learning_records` を集計。
    2.  `questions`, `card_decks`, `question_categories` とJOINし、カテゴリごとにグルーピング。
    3.  各カテゴリについて、総試行回数、総正解数、ユニーク解答問題数などを計算。
    4.  `p_target_categories` が指定されていれば、それらのカテゴリのみの結果を返す。指定がなければ、事前定義された主要カテゴリ（航法、航空法規など）の結果を返す。まだ学習していないカテゴリは解答数0として含める。
*   **RLS**: 呼び出しユーザーが `p_user_id` と一致すること、またはAdmin/Teacherであること。

---
### (追加検討) Admin/Teacher向け関数
*   `get_student_list()`: Teacher/Adminが担当する（または全）Studentのリストを取得。
*   `get_student_progress_summary(p_student_id uuid)`: 特定のStudentの学習進捗概要を取得。
*   `get_deck_performance_summary(p_deck_id uuid)`: 特定デッキの全ユーザーの平均正答率などを取得。

## 3. RLS (Row Level Security) ポリシー
各テーブルのDDLセクション ( `02_Database_Design.md` ) に、基本的なRLSポリシーの例を記載済み。
これらのポリシーは、認証されたユーザーのロール (`profiles.roll`) とID (`auth.uid()`) に基づいてアクセスを制御する。
*   **基本方針**:
    *   ユーザーは自身のデータ (profile, learning_records, user_question_srs_status, 作成したdecks/categories/questions) のみフルアクセス可能。
    *   公開情報 (共通カテゴリ、他のユーザーが作成した公開デッキなど) は読み取り可能。
    *   Teacherは担当Studentの学習記録を読み取り可能。
    *   Adminはほぼ全てのデータを読み書き可能。
*   **注意点**: RPC関数はデフォルトで作成者の権限で実行される (`SECURITY DEFINER`) か、呼び出し元の権限で実行される (`SECURITY INVOKER`) かを指定できる。機密性の高い操作や、広範なデータアクセスが必要な関数は `SECURITY DEFINER` とし、関数内で厳密な権限チェックを行う。単純なデータ取得で、RLSが適切に機能する場合は `SECURITY INVOKER` で良い。

## [追加] 4択問題機能 API設計・実装計画（2025年7月）

### 1. 問題取得API
- `GET /questions?limit=N&filter=...`
  - unified_cpl_questionsからランダム/条件付きでN問取得

### 2. 回答記録API
- `POST /user_test_results`
  - user_id, question_id, user_answer, is_correct, response_time_seconds等を保存

### 3. セッション記録API
- `POST /quiz_sessions`
  - user_id, answers(jsonb), score_percentage等を保存

### 4. 今後の拡張
- 出題条件フィルタAPI
- 学習進捗・レコメンドAPI
- 管理者用API（問題追加・編集・削除）

### 5. 備考
- Supabase JSクライアントで直接テーブル操作（APIラッパー不要）
- 詳細なパラメータ・レスポンス例は今後の実装で随時追記
