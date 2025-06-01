CREATE TABLE public.learning_records (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    attempt_number integer NOT NULL, -- 同一問題に対する試行回数 (user_id, question_id ごとに1から開始、アプリケーションロジックまたはトリガーで採番)
    attempt_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_correct boolean NOT NULL,
    response_time_ms integer, -- 解答にかかった時間 (ミリ秒)
    marked_status text CHECK (marked_status IN ('checked', 'unknown')), -- この試行時のマーク状態 (ユーザーが付与)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_learning_records_user_question_date ON public.learning_records(user_id, question_id, attempt_date DESC);
CREATE INDEX idx_learning_records_user_attempt_date ON public.learning_records(user_id, attempt_date DESC);

-- RLSポリシー例
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own learning records." ON public.learning_records FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins/Teachers can view student learning records." ON public.learning_records FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll IN ('Admin', 'Teacher')));