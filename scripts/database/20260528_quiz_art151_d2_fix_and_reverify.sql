-- D-2: Fix 11 emergency-equipment inspection-interval questions (Art 151)
-- Fact-check: e-Gov 昭和二十七年運輸省令第五十六号 + hourei get_law_data (2026-05-28)
-- Current Art 151: inspection per 技術的基準; Art 152: 削除 (特定救急用具)
-- Exam table (unchanged in syllabus): 60d signals/lights/救急箱/parachute;
--   180d life vest/boat/rations; 12mo ELT

BEGIN;

-- 18051db7: only (c) 救急箱 60日 is correct → answer 3 (unchanged)
UPDATE public.unified_cpl_questions
SET explanation = '正しいのは(c)の1つのみです。航空法施行規則第151条（技術的基準）により、非常信号灯・携帯灯・防水携帯灯の点検期間は60日、救命胴衣・相当救急用具・救命ボートおよび非常食糧は180日、救急箱は60日と定められています。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = '18051db7-4b4a-4e9a-a43e-ddcb85880720';

-- 27ab60f8: (a)(c) correct → 2つ
UPDATE public.unified_cpl_questions
SET correct_answer = 2,
    explanation = '正しいのは(a)と(c)の2つです。(a)非常信号灯・携帯灯・防水携帯灯は60日、(c)救急箱も60日です。(b)救命胴衣等は180日、(d)非常食糧も180日と定められています（規則第151条・技術的基準）。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = '27ab60f8-fa2f-429f-ba5b-3d91d7e18aa0';

-- 43943690: duplicate of 9648b962 (same question_text + correct_answer=2) — keep needs_review
UPDATE public.unified_cpl_questions
SET explanation = '【重複・出題停止】正しいのは(a)と(c)の2つ（9648b962 と同一問題文）。非常信号灯・携帯灯・防水携帯灯および救急箱は60日、救命胴衣・救命ボート・非常食糧は180日（規則第151条・技術的基準）。',
    is_canonical = false,
    duplicate_group_id = '9648b962-bcdd-4436-abd8-5ec61057598d'::uuid,
    verification_status = 'needs_review',
    updated_at = now(),
    tags = (SELECT array_agg(DISTINCT t) FROM unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['duplicate_superseded']) AS t)
WHERE id = '43943690-c691-402c-8349-b62d780828bf';

-- 6da02c74: all four correct → 4つ
UPDATE public.unified_cpl_questions
SET correct_answer = 4,
    explanation = '4つすべて正しいです。非常信号灯・携帯灯・防水携帯灯と救急箱は60日、救命胴衣・相当救急用具・救命ボートと非常食糧は180日ごとの点検が規則第151条（技術的基準）で定められています。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = '6da02c74-3045-49bb-a852-cb11aed01ae9';

-- 7990a0c8: (a)(c) correct → 2つ
UPDATE public.unified_cpl_questions
SET correct_answer = 2,
    explanation = '正しいのは(a)と(c)の2つです。非常信号灯・携帯灯・防水携帯灯および救急箱は60日ごとです。(b)救命胴衣等と(d)非常食糧は180日ごとの点検です（規則第151条・技術的基準）。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = '7990a0c8-de14-48d6-80f0-9dffab42e24d';

-- 9fe2eec5: duplicate of b7aeb6a2 — keep needs_review
UPDATE public.unified_cpl_questions
SET explanation = '【重複・出題停止】4つすべて正しい（b7aeb6a2 と同一問題文）。非常信号灯等60日、救命胴衣等180日、救急箱60日、非常食糧180日（規則第151条・技術的基準）。',
    is_canonical = false,
    duplicate_group_id = 'b7aeb6a2-21ad-406a-b5ce-2a31e507290d'::uuid,
    verification_status = 'needs_review',
    updated_at = now(),
    tags = (SELECT array_agg(DISTINCT t) FROM unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['duplicate_superseded']) AS t)
WHERE id = '9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e';

-- a873245e: only (エ) 非常食糧180日 → 1つ (unchanged)
UPDATE public.unified_cpl_questions
SET explanation = '正しいのは(エ)の1つだけです。非常食糧の点検期間は180日です。非常信号灯・携帯灯・防水携帯灯および救急箱は60日、救命胴衣・救命ボートは180日と定められています（規則第151条・技術的基準）。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = 'a873245e-7fcd-437e-8772-21d7302d586c';

-- b469cd6d: only (d) → answer 4 (unchanged)
UPDATE public.unified_cpl_questions
SET explanation = '正しいのは(d)の1つのみです。非常食糧の点検期間は180日です。非常信号灯・携帯灯・防水携帯灯および救急箱は60日、救命胴衣・救命ボートも180日と定められています（規則第151条・技術的基準）。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = 'b469cd6d-5532-40af-bd97-bc7055074b81';

-- bd91f261: all four correct → 4つ
UPDATE public.unified_cpl_questions
SET correct_answer = 4,
    explanation = '4つすべて正しいです。(ア)非常信号灯等60日、(イ)救命胴衣等180日、(ウ)救急箱60日、(エ)非常食糧180日は、規則第151条（技術的基準）の点検期間と一致します。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = 'bd91f261-b509-489f-af56-cabcf88ddb68';

-- eaec3f3e: only (ウ) 救急箱60日 → 1つ
UPDATE public.unified_cpl_questions
SET correct_answer = 1,
    explanation = '正しいのは(ウ)の1つのみです。救急箱は60日ごとの点検です。(ア)非常信号灯等は60日（180日ではない）、(イ)救命胴衣等および(エ)非常食糧は180日が正しい期間です（規則第151条・技術的基準）。',
    verification_status = 'verified',
    updated_at = now(),
    tags = array_remove(COALESCE(tags, ARRAY[]::text[]), 'wrong_art151_inspection_intervals')
WHERE id = 'eaec3f3e-875a-4756-a0a6-f44b4af35f97';

-- f0e30596: duplicate of 44af9836 — keep needs_review
UPDATE public.unified_cpl_questions
SET explanation = '【重複・出題停止】正しいのは(a)と(c)の2つ（44af9836 と同一問題文）。非常信号灯・携帯灯・防水携帯灯および救急箱は60日、救命胴衣等・非常食糧は180日（規則第151条・技術的基準）。',
    is_canonical = false,
    duplicate_group_id = '44af9836-06c0-4746-91c2-92c540e66830'::uuid,
    verification_status = 'needs_review',
    updated_at = now(),
    tags = (SELECT array_agg(DISTINCT t) FROM unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['duplicate_superseded']) AS t)
WHERE id = 'f0e30596-4d06-406b-9286-7c91a1b3f59f';

-- Post-check
SELECT id, correct_answer, verification_status, left(explanation, 80) AS expl
FROM public.unified_cpl_questions
WHERE id IN (
  '18051db7-4b4a-4e9a-a43e-ddcb85880720','27ab60f8-fa2f-429f-ba5b-3d91d7e18aa0',
  '43943690-c691-402c-8349-b62d780828bf','6da02c74-3045-49bb-a852-cb11aed01ae9',
  '7990a0c8-de14-48d6-80f0-9dffab42e24d','9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e',
  'a873245e-7fcd-437e-8772-21d7302d586c','b469cd6d-5532-40af-bd97-bc7055074b81',
  'bd91f261-b509-489f-af56-cabcf88ddb68','eaec3f3e-875a-4756-a0a6-f44b4af35f97',
  'f0e30596-4d06-406b-9286-7c91a1b3f59f'
)
ORDER BY id;

COMMIT;
