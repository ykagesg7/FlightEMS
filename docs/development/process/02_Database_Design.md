# 02 データベース設計書

## 1. ER図 (Mermaid)
(*DDL定義後に整合性を確認しながら作成します。現在はプレースホルダーです。*)
```mermaid
erDiagram
    profiles {
        uuid id PK
        text username
        text full_name
        text email
        timestamptz updated_at
        text avatar_url
        text website
        text roll
        timestamptz created_at
    }

    question_categories {
        uuid id PK
        text name
        uuid user_id FK "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    card_decks {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        text title
        text description "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    questions {
        uuid id PK
        uuid deck_id FK
        text question_text
        text[] options
        smallint correct_option_index
        text explanation "nullable"
        text explanation_image_url "nullable"
        text difficulty_level
        timestamptz created_at
        timestamptz updated_at
    }

    learning_records {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        integer attempt_number
        timestamptz attempt_date
        boolean is_correct
        integer response_time_ms "nullable"
        text marked_status "nullable"
        timestamptz created_at
    }

    user_question_srs_status {
        uuid user_id PK_FK
        uuid question_id PK_FK
        timestamptz next_review_date "nullable"
        integer interval_days "nullable"
        real ease_factor "nullable"
        integer repetitions "nullable"
        uuid last_attempt_record_id FK "nullable"
        timestamptz updated_at
    }

    profiles ||--o{ card_decks : "creates"
    profiles ||--o{ learning_records : "has_attempts_for"
    profiles ||--o{ user_question_srs_status : "has_srs_status_for"
    profiles ||--o{ question_categories : "can_create_custom"

    question_categories ||--o{ card_decks : "belongs_to"

    card_decks ||--o{ questions : "contains"

    questions ||--o{ learning_records : "is_attempt_of"
    questions ||--o{ user_question_srs_status : "has_srs_status_for_question"

    learning_records }o..o| user_question_srs_status : "updates_srs_via"

    unified_cpl_questions {
        uuid id PK
        text main_subject
        text sub_subject
        text question_text
        jsonb options
        int correct_answer
        text explanation
        int difficulty_level
        timestamptz created_at
        timestamptz updated_at
    }
    quiz_sessions {
        uuid id PK
        uuid user_id FK
        text session_type
        jsonb settings
        jsonb answers
        numeric score_percentage
        timestamptz created_at
        timestamptz updated_at
    }
    user_test_results {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        int user_answer
        int correct_answer
        bool is_correct
        int response_time_seconds
        timestamptz created_at
    }

---

### 【2025/07更新】user_weak_areasテーブル設計・4択テスト保存仕様アップデート
- カラム名をtotal_attempts→attempt_countに統一（DB・型・設計書すべて）
- ER図・DDL・設計書もattempt_countで統一、total_attempts記載は廃止
- 未ログイン時はテスト結果保存をスキップし、UIでログイン/新規登録を促す
