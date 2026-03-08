BEGIN;

CREATE TEMP TABLE sub_subject_mapping (
    old_label text PRIMARY KEY,
    new_label text NOT NULL
) ON COMMIT DROP;

INSERT INTO sub_subject_mapping (old_label, new_label)
VALUES
    ('空力の基礎理論/二次元翼（翼型に関する理論）', '空力の基礎理論/二次元翼'),
    ('空力の基礎理論/三次元翼（翼平面形に関する理論）', '空力の基礎理論/三次元翼'),
    ('エア・データー表示計器/ピトー静圧系統', 'エア・データー表示計器/ピトー・スタティック系統'),
    ('ピトー静圧系統', 'エア・データー表示計器/ピトー・スタティック系統'),
    ('安定性', '空力の基礎理論/安定性'),
    ('揚力', '空力の基礎理論/揚力'),
    ('抗力', '空力の基礎理論/抗力'),
    ('翼理論', '空力の基礎理論/三次元翼'),
    ('プロペラ効果', '空力の基礎理論/プロペラ'),
    ('航法計算', '航法に関する一般知識/航法計算'),
    ('低気圧', '高気圧と低気圧/低気圧の種類'),
    ('前線', '前線/前線の種類と気象状態'),
    ('気団', '気団/気団の分類と性質'),
    ('大気組成', '大気の基礎/大気'),
    ('標準大気', '大気の基礎/大気'),
    ('水蒸気', '大気の基礎/水分'),
    ('露点温度', '大気の基礎/水分'),
    ('偏西風', '風/風系'),
    ('温暖前線', '前線/前線の種類と気象状態'),
    ('航空交通管制', '航空交通業務概論/航空交通業務'),
    ('航空情報業務', '航空情報業務/総合航空情報パッケージ'),
    ('ア 空力の基礎理論 / (ア) 力学の基礎', '空力の基礎理論/力学の基礎'),
    ('ア 空力の基礎理論 / (イ) 対気速度', '空力の基礎理論/対気速度'),
    ('ア 空力の基礎理論 / (ウ) 二次元翼（翼型に関する理論）', '空力の基礎理論/二次元翼'),
    ('ア 空力の基礎理論 / (エ) 三次元翼（翼平面形に関する理論）', '空力の基礎理論/三次元翼'),
    ('ア 空力の基礎理論 / (オ) 全機の空力特性', '空力の基礎理論/全機の空力特性'),
    ('ア 空力の基礎理論 / (カ) 安定性', '空力の基礎理論/安定性'),
    ('ア 空力の基礎理論 / (キ) 操縦性', '空力の基礎理論/操縦性'),
    ('ア 空力の基礎理論 / (ク) プロペラ', '空力の基礎理論/プロペラ'),
    ('ア 空力の基礎理論 / (ケ) 失速の種類', '空力の基礎理論/失速の種類'),
    ('イ 性能と耐空性 / (ア) 飛行性能', '性能と耐空性/飛行性能'),
    ('イ 性能と耐空性 / (イ) 設計強度', '性能と耐空性/設計強度'),
    ('イ 性能と耐空性 / (ウ) 離着陸性能', '性能と耐空性/離着陸性能'),
    ('イ 航空機の構造 / (ア) 機体の構造', '航空機の構造/機体の構造'),
    ('イ 航空機の構造 / (イ) 荷重と強度', '航空機の構造/荷重と強度'),
    ('イ 燃料供給系統 / (ア) 燃料供給系統', '燃料供給系統/燃料供給系統'),
    ('イ 燃料供給系統 / (イ) 燃料表示系統', '燃料供給系統/燃料表示系統'),
    ('エ エア・データー表示計器 / (ア) ピトー・スタティック系統', 'エア・データー表示計器/ピトー・スタティック系統'),
    ('エ エア・データー表示計器 / (イ) 高度計', 'エア・データー表示計器/高度計'),
    ('オ 航法計器 / (ア) 磁方位計器', '航法計器/磁方位計器'),
    ('オ 航法計器 / (イ) 無線航法計器', '航法計器/無線航法計器'),
    ('オ 航法計器 / (ウ) レーダー', '航法計器/レーダー'),
    ('カ 油圧系統 / (ア) 油圧の原理', '油圧系統/油圧の原理'),
    ('イ 重量、重心位置の測定と算出 / (ア) 重量、重心位置の算出', '重量、重心位置の測定と算出/重量、重心位置の算出'),
    ('イ 重量、重心位置の測定と算出 / (ウ) 重量、重心位置の修正', '重量、重心位置の測定と算出/重量、重心位置の修正'),
    ('ア ピストン・エンジン / (ウ) 航空燃料の燃焼', 'ピストン・エンジン/航空燃料の燃焼'),
    ('ア ピストン・エンジン / (オ) プロペラ', 'ピストン・エンジン/プロペラ'),
    ('ア ピストン・エンジン / (カ) 出力', 'ピストン・エンジン/出力'),
    ('ア ピストン・エンジン / (ケ) 潤滑油と潤滑系統', 'ピストン・エンジン/潤滑油と潤滑系統'),
    ('ア 着陸装置 / (ア) 降着装置の形式', '着陸装置/降着装置の形式'),
    ('ア 航空機電気系統の基礎 / (イ) 発電機', '航空機電気系統の基礎/発電機'),
    ('ア 航空機電気系統の基礎 / (ウ) 交流と直流の変換', '航空機電気系統の基礎/交流と直流の変換'),
    ('イ 電波の伝播 / (ウ) 電波の伝播', '電波の伝播/電波の伝播'),
    ('ウ 無線通信 / (ア) 雑音と空電', '無線通信/雑音と空電'),
    ('イ 遠隔表示計器 / (イ) 温度', '遠隔表示計器/温度'),
    ('エ 着氷 / 着氷の防止の概要', '着氷/着氷の防止の概要');

CREATE TEMP TABLE duplicate_resolution ON COMMIT DROP AS
WITH remapped AS (
    SELECT
        q.id,
        q.created_at,
        q.main_subject,
        COALESCE(m.new_label, q.sub_subject) AS normalized_sub_subject,
        q.question_text,
        q.correct_answer
    FROM public.unified_cpl_questions q
    LEFT JOIN sub_subject_mapping m
        ON q.sub_subject = m.old_label
),
ranked AS (
    SELECT
        id,
        FIRST_VALUE(id) OVER (
            PARTITION BY main_subject, normalized_sub_subject, question_text, correct_answer
            ORDER BY created_at NULLS LAST, id
        ) AS canonical_id,
        ROW_NUMBER() OVER (
            PARTITION BY main_subject, normalized_sub_subject, question_text, correct_answer
            ORDER BY created_at NULLS LAST, id
        ) AS rn
    FROM remapped
)
SELECT
    id AS duplicate_id,
    canonical_id
FROM ranked
WHERE rn > 1;

UPDATE public.user_test_results utr
SET unified_question_id = dr.canonical_id
FROM duplicate_resolution dr
WHERE utr.unified_question_id = dr.duplicate_id;

UPDATE public.user_test_results utr
SET question_id = dr.canonical_id::text
FROM duplicate_resolution dr
WHERE utr.question_id = dr.duplicate_id::text;

UPDATE public.user_unified_srs_status srs
SET question_id = dr.canonical_id
FROM duplicate_resolution dr
WHERE srs.question_id = dr.duplicate_id;

DELETE FROM public.unified_cpl_questions q
USING duplicate_resolution dr
WHERE q.id = dr.duplicate_id;

UPDATE public.unified_cpl_questions q
SET
    sub_subject = m.new_label,
    updated_at = NOW()
FROM sub_subject_mapping m
WHERE q.sub_subject = m.old_label;

COMMIT;
