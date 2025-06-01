CREATE TABLE public.question_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- ユーザーが独自に作成したカテゴリの場合。共通カテゴリはNULL。
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLSポリシー例
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view categories." ON public.question_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories." ON public.question_categories FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));
CREATE POLICY "Users can create their own categories." ON public.question_categories FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin')); -- Adminも作成可能
CREATE POLICY "Users can update their own categories." ON public.question_categories FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));