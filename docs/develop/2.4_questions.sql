CREATE TABLE public.questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id uuid NOT NULL REFERENCES public.card_decks(id) ON DELETE CASCADE, -- デッキ削除時は問題も削除
    question_text text NOT NULL,
    options text[] NOT NULL, -- 例: ARRAY['選択肢A', '選択肢B', '選択肢C', '選択肢D']
    correct_option_index smallint NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3), -- 0から3 (4択の場合)
    explanation text,
    explanation_image_url text, -- 画像はSupabase Storageに保存し、そのURLを格納
    difficulty_level text NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_questions_deck_id ON public.questions(deck_id);

-- RLSポリシー例
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can view all questions." ON public.questions FOR SELECT TO authenticated USING (true); -- デッキの閲覧権限に依存させることも検討
CREATE POLICY "Users can manage questions in their own decks (or Admins)." ON public.questions FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM card_decks cd WHERE cd.id = deck_id AND cd.user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM card_decks cd WHERE cd.id = deck_id AND cd.user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin')
    );