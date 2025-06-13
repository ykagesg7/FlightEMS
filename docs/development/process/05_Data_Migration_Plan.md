
---

最後に **`05_Data_Migration_Plan.md`** です。これはまだ骨子レベルで、具体的なスクリプトはこれからになります。

---

`05_Data_Migration_Plan.md`

```markdown
# 05 データ移行計画書

本ドキュメントでは、既存のFlightAcademyプロジェクトのデータベース（`quiz_questions`テーブル、`user_quiz_results`テーブル）から、新しいクイズアプリのテーブル構造へデータを移行するための計画を記述します。

## 1. 移行対象データ定義
*   **移行元テーブル1**: `quiz_questions`
    *   主なカラム: `id(int8)`, `category(text)`, `question(text)`, `answer1(text)`, `answer2(text)`, `answer3(text)`, `answer4(text)`, `correct(int8)`, `explanation(text)`
*   **移行元テーブル2**: `user_quiz_results`
    *   主なカラム: `id(uuid)`, `user_id(uuid)`, `question_id(int4)`, `category(text)`, `is_correct(bool)`, `answered_at(timestamptz)`

*   **移行先テーブル**:
    *   `question_categories`
    *   `card_decks`
    *   `questions` (新 `id` は `uuid`)
    *   `learning_records`
    *   `user_question_srs_status`

## 2. 移行戦略概要
*   **トランザクション管理**: 可能な限り一連の移行処理はトランザクション内で行い、データの整合性を保つ。
*   **スクリプト**: SupabaseのSQLエディタで実行可能なSQLスクリプト、またはNode.js等で`supabase-js`を使用した外部スクリプトで実行。
*   **IDマッピング**: 旧 `quiz_questions.id (int8)` から新 `questions.id (uuid)` へのマッピング情報を一時的に保持し、`learning_records` の `question_id` 移行時に参照する。
*   **デフォルト値の割り当て**:
    *   既存の問題は、カテゴリごとに1つのデフォルトデッキに所属させるか、`quiz_questions.category` を基にデッキ名を自動生成して割り当てる。
    *   `difficulty_level` は、既存データにないため、全て 'medium' に設定するか、何らかのロジックで割り当てる（例：`explanation` の文字数など。基本は 'medium'）。
    *   `user_question_srs_status` の初期値は、最終解答履歴に基づいて簡易的に設定するか、NULLとして初回学習時に計算されるようにする。
*   **実行順序**:
    1.  `question_categories` の作成 (旧 `quiz_questions.category` からユニークなものを抽出)。
    2.  `card_decks` の作成 (上記カテゴリと、デフォルト作成者 `user_id` を紐付け)。
    3.  `quiz_questions` -> `questions` への移行 (IDマッピング表作成)。
    4.  `user_quiz_results` -> `learning_records` への移行 (マッピング表利用)。
    5.  `learning_records` -> `user_question_srs_status` へのSRS初期状態設定。

## 3. 移行手順とスクリプト骨子 (SQLベースのイメージ)

### 3.1 `quiz_questions` -> `questions` (+ `question_categories`, `card_decks`)

```sql
-- 事前準備: 一時的なIDマッピングテーブル作成 (任意)
-- CREATE TEMP TABLE old_to_new_question_id_map (
--     old_id BIGINT PRIMARY KEY,
--     new_id UUID
-- );

DO $$
DECLARE
    -- 変数宣言
    v_category_name TEXT;
    v_category_id UUID;
    v_admin_user_id UUID; -- 事前にAdminユーザーのIDを取得しておく
    v_default_deck_id UUID;
    r_old_question RECORD;
    v_new_question_id UUID;
    v_options TEXT[];
BEGIN
    -- 0. AdminユーザーID設定 (手動で設定するか、profilesテーブルから取得)
    SELECT id INTO v_admin_user_id FROM profiles WHERE roll = 'Admin' LIMIT 1;
    IF v_admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    -- 1. 旧quiz_questionsのカテゴリからquestion_categoriesを作成
    FOR v_category_name IN SELECT DISTINCT category FROM public.quiz_questions LOOP
        INSERT INTO public.question_categories (name, user_id)
        VALUES (v_category_name, NULL) -- システム共通カテゴリとしてuser_idはNULL
        ON CONFLICT (name) DO NOTHING; -- 既に存在する場合は何もしない
    END LOOP;

    -- 2. 各カテゴリに対してデフォルトのカードデッキを作成
    FOR r_old_question IN SELECT DISTINCT category FROM public.quiz_questions LOOP
        SELECT id INTO v_category_id FROM public.question_categories WHERE name = r_old_question.category;

        INSERT INTO public.card_decks (user_id, category_id, title, description)
        VALUES (v_admin_user_id, v_category_id, r_old_question.category || ' - Imported Deck', 'Imported from old system')
        RETURNING id INTO v_default_deck_id;

        -- 3. 旧questionsを新questionsテーブルに移行 (カテゴリごと、デッキごとにループ)
        FOR r_old_question IN SELECT * FROM public.quiz_questions WHERE category = r_old_question.category LOOP
            -- options配列の作成
            v_options := ARRAY[
                r_old_question.answer1,
                r_old_question.answer2,
                r_old_question.answer3,
                r_old_question.answer4
            ];

            INSERT INTO public.questions (
                deck_id,
                question_text,
                options,
                correct_option_index,
                explanation,
                difficulty_level -- デフォルト 'medium'
                -- created_at, updated_at はデフォルト値
            )
            VALUES (
                v_default_deck_id,
                r_old_question.question,
                v_options,
                r_old_question.correct::smallint, -- 型キャスト
                r_old_question.explanation,
                'medium'
            )
            RETURNING id INTO v_new_question_id;

            -- (任意) IDマッピングを一時テーブルに保存
            -- INSERT INTO old_to_new_question_id_map (old_id, new_id) VALUES (r_old_question.id, v_new_question_id);
            RAISE NOTICE 'Migrated old question ID % to new ID %', r_old_question.id, v_new_question_id;
        END LOOP;
    END LOOP;
END $$;

### 3.2 `user_quiz_results` -> `learning_records` & `user_question_srs_status`
-- このステップでは、old_to_new_question_id_map テーブル（またはそれに代わるマッピング手段）が必須。
-- attempt_number の計算ロジックが必要。
-- user_question_srs_status の初期値計算ロジックが必要。
-- (これはさらに複雑なため、Node.jsスクリプトでの処理が現実的かもしれない)
-- SQLでの骨子イメージ:
DO $$
DECLARE
    r_old_result RECORD;
    v_new_question_id UUID;
    v_attempt_count INTEGER;
    v_new_learning_record_id UUID;
BEGIN
    FOR r_old_result IN SELECT * FROM public.user_quiz_results ORDER BY user_id, question_id, answered_at LOOP
        -- 1. 旧question_idを新question_id (UUID)に変換 (マッピングテーブル参照)
        -- SELECT new_id INTO v_new_question_id FROM old_to_new_question_id_map WHERE old_id = r_old_result.question_id;
        -- (上記マッピングができていないと失敗するので、前段の確実な実行が前提)
        -- 仮に、マッピングが name ベースなどで一時的に行えるとすると (非推奨だがデモ用)
        -- SELECT q.id INTO v_new_question_id FROM questions q JOIN card_decks cd ON q.deck_id = cd.id JOIN question_categories qc ON cd.category_id = qc.id WHERE qc.name = r_old_result.category AND q.question_text LIKE (SELECT oq.question FROM quiz_questions oq WHERE oq.id = r_old_result.question_id) LIMIT 1;


        IF v_new_question_id IS NOT NULL THEN
            -- 2. attempt_numberを計算
            SELECT COUNT(*) + 1 INTO v_attempt_count
            FROM public.learning_records
            WHERE user_id = r_old_result.user_id AND question_id = v_new_question_id;

            -- 3. learning_recordsに挿入
            INSERT INTO public.learning_records (
                user_id,
                question_id,
                attempt_number,
                attempt_date,
                is_correct,
                response_time_ms -- 既存データにないためNULL
                -- marked_status -- 既存データにないためNULL
            )
            VALUES (
                r_old_result.user_id,
                v_new_question_id,
                v_attempt_count,
                r_old_result.answered_at,
                r_old_result.is_correct,
                NULL
            )
            RETURNING id INTO v_new_learning_record_id;

            -- 4. user_question_srs_status の初期状態を設定 (最新の解答履歴に基づいて簡易的に)
            INSERT INTO public.user_question_srs_status (
                user_id,
                question_id,
                next_review_date,
                interval_days,
                ease_factor,
                repetitions,
                last_attempt_record_id,
                updated_at
            )
            VALUES (
                r_old_result.user_id,
                v_new_question_id,
                CASE WHEN r_old_result.is_correct THEN r_old_result.answered_at + INTERVAL '1 day' ELSE r_old_result.answered_at + INTERVAL '1 hour' END, -- 簡易的な初期値
                CASE WHEN r_old_result.is_correct THEN 1 ELSE 0 END,
                2.5,
                CASE WHEN r_old_result.is_correct THEN 1 ELSE 0 END,
                v_new_learning_record_id,
                r_old_result.answered_at
            )
            ON CONFLICT (user_id, question_id) DO UPDATE SET
                next_review_date = EXCLUDED.next_review_date,
                interval_days = EXCLUDED.interval_days,
                ease_factor = EXCLUDED.ease_factor,
                repetitions = EXCLUDED.repetitions,
                last_attempt_record_id = EXCLUDED.last_attempt_record_id,
                updated_at = EXCLUDED.updated_at
            WHERE EXCLUDED.updated_at > user_question_srs_status.updated_at; -- 最新の記録で更新

        ELSE
            RAISE WARNING 'Could not find new question ID for old result ID % (old question_id: %)', r_old_result.id, r_old_result.question_id;
        END IF;
    END LOOP;
END $$;