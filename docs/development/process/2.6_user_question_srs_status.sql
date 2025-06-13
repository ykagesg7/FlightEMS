CREATE TABLE public.user_question_srs_status (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    next_review_date timestamp with time zone,
    interval_days integer,
    ease_factor real DEFAULT 2.5,
    repetitions integer DEFAULT 0,
    last_attempt_record_id uuid REFERENCES public.learning_records(id) ON DELETE SET NULL, -- どの解答記録に基づいてこのSRS状態が計算されたか
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, question_id)
);
CREATE INDEX idx_user_question_srs_status_next_review ON public.user_question_srs_status(user_id, next_review_date);

-- RLSポリシー例
ALTER TABLE public.user_question_srs_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own SRS status records." ON public.user_question_srs_status FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins/Teachers can view student SRS status records." ON public.user_question_srs_status FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll IN ('Admin', 'Teacher')));