-- Phase 3: Fix answer/explanation bugs + restore verified for needs_review audit survivors
-- Targets: 13 rows (4 fix + 9 verify-only)
-- Report: artifacts/quiz_cbt_deletion_candidates_2026-05-28.md

BEGIN;

-- Fix correct_answer mismatches
UPDATE public.unified_cpl_questions
SET
  correct_answer = 3,
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'd7fca726-2ecd-4a9a-a1e1-f9b5cfdb6793';

UPDATE public.unified_cpl_questions
SET
  correct_answer = 1,
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'a48c6f58-1f1f-4369-bff3-1e5698fb677c';

UPDATE public.unified_cpl_questions
SET
  correct_answer = 4,
  explanation = '同じ緯度（35°20''N）で経度が10度（140°Eから130°E）西へ移動するため、日没は40分（経度15度で1時間）遅くなります。B空港の日没は19時00分。その30分前は18時30分。飛行時間1時間30分を引くと、離陸時刻は17時00分（選択肢4）となります。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '4181cbd9-b398-413a-80da-267db7087e03';

UPDATE public.unified_cpl_questions
SET
  explanation = 'ETOPS（Extended-range Twin-engine Operational Performance Standards）運航において最も重要な要素は、双発機の長距離運航を支えるエンジン信頼性です。エンジン故障時にも適切な代替空港へ到達できる性能・保守体制が前提となり、代替空港選定や燃料計画もこの信頼性の上に成り立ちます。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '01c08418-2121-4281-b471-4dd4ef45adfd';

-- Verify-only (content OK)
UPDATE public.unified_cpl_questions
SET
  verification_status = 'verified',
  updated_at = now()
WHERE id IN (
  '66276f09-bc92-4550-b0b0-2355686c7f65',
  '98073d7e-a2ff-4c27-859f-ce9fc1cec4f6',
  '2869fd4e-6bd4-4212-8f9d-d3cc68a07de8',
  'f9b9d811-6c4f-4ea5-86c1-6a00696c24f5',
  '6de6164d-e685-41ac-9c3f-fa915b515f7d',
  '80e3a0d5-bd78-4609-aa82-b43b6bd8aff7',
  '9235a21e-630d-49f3-95fd-a654212f4209',
  'f4735938-e815-475c-85a2-eecb9e700d92',
  '0a1bad07-dc21-4a59-8289-9bbc3b2b0459'
);

SELECT
  (SELECT count(*) FROM public.unified_cpl_questions
   WHERE verification_status = 'verified') AS verified_total,
  (SELECT count(*) FROM public.unified_cpl_questions
   WHERE verification_status = 'needs_review') AS needs_review_total;

COMMIT;
