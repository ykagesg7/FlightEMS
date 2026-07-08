-- Phase 1: demote CBT-mismatched and obsolete-law quiz rows to needs_review
-- Target: unified_cpl_questions (verification_status was 'verified')
-- Run: Supabase MCP execute_sql or SQL editor
-- Report: artifacts/quiz_cbt_deletion_candidates_2026-05-28.md

BEGIN;

-- A-1: explicit 航法計算盤 (MLIT CBT handguide: not examined)
WITH tier_a_flight_computer AS (
  SELECT unnest(ARRAY[
    '23085074-8c1f-43c9-b7b8-18b5abb6a058'::uuid,
    '317728de-368f-40fc-a739-b16752278957'::uuid,
    '69bc6a6b-bdf4-4e3b-ac00-a553ac1b13c7'::uuid,
    '88111e0a-d9d4-41c9-bcb7-2184f7bf88a3'::uuid,
    'd7c2cebc-e04e-4774-8cec-e2d2435f0ab6'::uuid
  ]) AS id
)
UPDATE public.unified_cpl_questions u
SET verification_status = 'needs_review',
    updated_at = now(),
    tags = (
      SELECT array_agg(DISTINCT t)
      FROM unnest(COALESCE(u.tags, ARRAY[]::text[]) || ARRAY['cbt_mismatch_flight_computer']) AS t
    )
FROM tier_a_flight_computer s
WHERE u.id = s.id
  AND u.verification_status = 'verified';

-- A-2: options length != 4 (app assumes 4 choices)
WITH tier_a_non_four_options AS (
  SELECT unnest(ARRAY[
    '96ba47fc-ddfc-4730-9836-2093e8549e28'::uuid,
    '652b3a72-0b04-416a-b2cd-4b21c1455b97'::uuid,
    '5482dce0-be85-43b4-9ffb-79adac6e1d16'::uuid,
    'b55d3abd-9d4c-4c8c-a39e-bc6f7ae4db7e'::uuid,
    '7e7e6f26-7895-472e-871a-9df2bc946e52'::uuid,
    '8a45911a-1829-46e6-b7f4-34798d0b3083'::uuid
  ]) AS id
)
UPDATE public.unified_cpl_questions u
SET verification_status = 'needs_review',
    updated_at = now(),
    tags = (
      SELECT array_agg(DISTINCT t)
      FROM unnest(COALESCE(u.tags, ARRAY[]::text[]) || ARRAY['cbt_mismatch_non_four_options']) AS t
    )
FROM tier_a_non_four_options s
WHERE u.id = s.id
  AND u.verification_status = 'verified';

-- A-3: legacy essay stem 「説明せよ」
WITH tier_a_essay_stem AS (
  SELECT unnest(ARRAY[
    '0d7e147b-a3fe-4344-9fb5-18225ebe9899'::uuid,
    '1dd8d8d2-1f83-47f3-b8ce-17624cbc8ec7'::uuid,
    '304ba53f-a86c-4806-a948-8a7f9e8edcf6'::uuid,
    '88841c39-f174-4a14-ac43-1ea857c82e46'::uuid,
    '8f684ce4-d289-43ca-9dd2-deb44b1ac6b8'::uuid,
    '96b9fa47-0b29-48ea-b565-e619986da711'::uuid,
    '98cc55f9-b9f8-4306-9ca4-d985c5404103'::uuid,
    'a004190a-8b55-4bf6-a272-28552337b3af'::uuid,
    'a633206a-ca5a-40ad-a568-fa5b2abb67be'::uuid,
    'b2415d46-5d84-4722-a5af-b3f23532d222'::uuid,
    'd676b42f-8b8e-4068-858b-5989485e31d1'::uuid,
    '294ba61c-3bf2-427a-a767-8c2b9888dfc3'::uuid,
    '57f3068c-28a3-4cc0-8d07-1ad0eeae887d'::uuid,
    '11ab1c75-91e2-48dc-9261-32136c5b851c'::uuid,
    '7f070367-23a9-4345-840c-4a66ff441a7f'::uuid,
    'a2fa6667-d8d3-4d0d-b439-907f9a4ca671'::uuid,
    'a8936a54-1536-44ec-b846-4d75e9e4946b'::uuid
  ]) AS id
)
UPDATE public.unified_cpl_questions u
SET verification_status = 'needs_review',
    updated_at = now(),
    tags = (
      SELECT array_agg(DISTINCT t)
      FROM unnest(COALESCE(u.tags, ARRAY[]::text[]) || ARRAY['cbt_mismatch_essay_stem']) AS t
    )
FROM tier_a_essay_stem s
WHERE u.id = s.id
  AND u.verification_status = 'verified';

-- D-1: obsolete 特定救急用具 / 規則第152条 (abolished R4 Jun 2022)
WITH tier_d_obsolete_law AS (
  SELECT unnest(ARRAY[
    '57977f21-b0d7-4376-ae08-2302bc392c1a'::uuid,
    'fe22181a-26cd-4dbb-9bd1-4e51b6647a12'::uuid
  ]) AS id
)
UPDATE public.unified_cpl_questions u
SET verification_status = 'needs_review',
    updated_at = now(),
    tags = (
      SELECT array_agg(DISTINCT t)
      FROM unnest(COALESCE(u.tags, ARRAY[]::text[]) || ARRAY['obsolete_law_art152_specific_emergency_equipment']) AS t
    )
FROM tier_d_obsolete_law s
WHERE u.id = s.id
  AND u.verification_status = 'verified';

-- D-2: 救急用具点検期間 — wrong key/explanation vs current 規則第151条
WITH tier_d_wrong_art151 AS (
  SELECT unnest(ARRAY[
    '18051db7-4b4a-4e9a-a43e-ddcb85880720'::uuid,
    '27ab60f8-fa2f-429f-ba5b-3d91d7e18aa0'::uuid,
    '43943690-c691-402c-8349-b62d780828bf'::uuid,
    '6da02c74-3045-49bb-a852-cb11aed01ae9'::uuid,
    '7990a0c8-de14-48d6-80f0-9dffab42e24d'::uuid,
    '9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e'::uuid,
    'a873245e-7fcd-437e-8772-21d7302d586c'::uuid,
    'b469cd6d-5532-40af-bd97-bc7055074b81'::uuid,
    'bd91f261-b509-489f-af56-cabcf88ddb68'::uuid,
    'f0e30596-4d06-406b-9286-7c91a1b3f59f'::uuid,
    'eaec3f3e-875a-4756-a0a6-f44b4af35f97'::uuid
  ]) AS id
)
UPDATE public.unified_cpl_questions u
SET verification_status = 'needs_review',
    updated_at = now(),
    tags = (
      SELECT array_agg(DISTINCT t)
      FROM unnest(COALESCE(u.tags, ARRAY[]::text[]) || ARRAY['wrong_art151_inspection_intervals']) AS t
    )
FROM tier_d_wrong_art151 s
WHERE u.id = s.id
  AND u.verification_status = 'verified';

-- Verification snapshot (expect 41 rows demoted if all were verified)
SELECT verification_status, count(*) AS cnt
FROM public.unified_cpl_questions
WHERE id IN (
  SELECT unnest(ARRAY[
    '23085074-8c1f-43c9-b7b8-18b5abb6a058'::uuid,
    '317728de-368f-40fc-a739-b16752278957'::uuid,
    '69bc6a6b-bdf4-4e3b-ac00-a553ac1b13c7'::uuid,
    '88111e0a-d9d4-41c9-bcb7-2184f7bf88a3'::uuid,
    'd7c2cebc-e04e-4774-8cec-e2d2435f0ab6'::uuid,
    '96ba47fc-ddfc-4730-9836-2093e8549e28'::uuid,
    '652b3a72-0b04-416a-b2cd-4b21c1455b97'::uuid,
    '5482dce0-be85-43b4-9ffb-79adac6e1d16'::uuid,
    'b55d3abd-9d4c-4c8c-a39e-bc6f7ae4db7e'::uuid,
    '7e7e6f26-7895-472e-871a-9df2bc946e52'::uuid,
    '8a45911a-1829-46e6-b7f4-34798d0b3083'::uuid,
    '0d7e147b-a3fe-4344-9fb5-18225ebe9899'::uuid,
    '1dd8d8d2-1f83-47f3-b8ce-17624cbc8ec7'::uuid,
    '304ba53f-a86c-4806-a948-8a7f9e8edcf6'::uuid,
    '88841c39-f174-4a14-ac43-1ea857c82e46'::uuid,
    '8f684ce4-d289-43ca-9dd2-deb44b1ac6b8'::uuid,
    '96b9fa47-0b29-48ea-b565-e619986da711'::uuid,
    '98cc55f9-b9f8-4306-9ca4-d985c5404103'::uuid,
    'a004190a-8b55-4bf6-a272-28552337b3af'::uuid,
    'a633206a-ca5a-40ad-a568-fa5b2abb67be'::uuid,
    'b2415d46-5d84-4722-a5af-b3f23532d222'::uuid,
    'd676b42f-8b8e-4068-858b-5989485e31d1'::uuid,
    '294ba61c-3bf2-427a-a767-8c2b9888dfc3'::uuid,
    '57f3068c-28a3-4cc0-8d07-1ad0eeae887d'::uuid,
    '11ab1c75-91e2-48dc-9261-32136c5b851c'::uuid,
    '7f070367-23a9-4345-840c-4a66ff441a7f'::uuid,
    'a2fa6667-d8d3-4d0d-b439-907f9a4ca671'::uuid,
    'a8936a54-1536-44ec-b846-4d75e9e4946b'::uuid,
    '57977f21-b0d7-4376-ae08-2302bc392c1a'::uuid,
    'fe22181a-26cd-4dbb-9bd1-4e51b6647a12'::uuid,
    '18051db7-4b4a-4e9a-a43e-ddcb85880720'::uuid,
    '27ab60f8-fa2f-429f-ba5b-3d91d7e18aa0'::uuid,
    '43943690-c691-402c-8349-b62d780828bf'::uuid,
    '6da02c74-3045-49bb-a852-cb11aed01ae9'::uuid,
    '7990a0c8-de14-48d6-80f0-9dffab42e24d'::uuid,
    '9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e'::uuid,
    'a873245e-7fcd-437e-8772-21d7302d586c'::uuid,
    'b469cd6d-5532-40af-bd97-bc7055074b81'::uuid,
    'bd91f261-b509-489f-af56-cabcf88ddb68'::uuid,
    'f0e30596-4d06-406b-9286-7c91a1b3f59f'::uuid,
    'eaec3f3e-875a-4756-a0a6-f44b4af35f97'::uuid
  ])
)
GROUP BY verification_status;

COMMIT;
