-- PPL/CPL 出題レベル（applicable_exams）
-- 適用: Supabase SQL Editor または MCP apply_migration（本ファイルは正本・再実行安全）
-- Project: FlightAcademy

BEGIN;

ALTER TABLE public.unified_cpl_questions
  ADD COLUMN IF NOT EXISTS applicable_exams text[] NOT NULL DEFAULT ARRAY['CPL']::text[];

ALTER TABLE public.unified_cpl_questions
  DROP CONSTRAINT IF EXISTS unified_cpl_questions_applicable_exams_check;

ALTER TABLE public.unified_cpl_questions
  ADD CONSTRAINT unified_cpl_questions_applicable_exams_check
  CHECK (
    applicable_exams <@ ARRAY['PPL','CPL','ATPL']::text[]
    AND COALESCE(array_length(applicable_exams, 1), 0) >= 1
  );

CREATE INDEX IF NOT EXISTS idx_unified_cpl_applicable_exams_gin
  ON public.unified_cpl_questions USING gin (applicable_exams);

COMMENT ON COLUMN public.unified_cpl_questions.applicable_exams IS '出題対象試験レベル。例: {PPL,CPL} は両方。PPL モードは PPL を含む行のみ。';

COMMIT;
