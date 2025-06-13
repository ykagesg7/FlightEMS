CREATE TABLE public.card_decks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- デッキ作成者
    category_id uuid NOT NULL REFERENCES public.question_categories(id) ON DELETE RESTRICT, -- カテゴリ削除時はデッキが残っているとエラー
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_card_decks_user_id ON public.card_decks(user_id);
CREATE INDEX idx_card_decks_category_id ON public.card_decks(category_id);

-- RLSポリシー例
ALTER TABLE public.card_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can view all decks." ON public.card_decks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own decks." ON public.card_decks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own decks." ON public.card_decks FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own decks." ON public.card_decks FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all decks." ON public.card_decks FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));