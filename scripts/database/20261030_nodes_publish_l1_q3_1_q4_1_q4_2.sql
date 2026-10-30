-- Spiral LMS: nodes.is_published=true for L1-Q3-1 / L1-Q4-1 / L1-Q4-2.
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- publish-sync は learning_contents のみ触る。nodes は本 UPDATE が必要。
-- Q3-1/Q4-1: ノード公開後も MDX publishedAt 未到達なら UI は「公開予定」。
--   hub は learning_contents.is_published（ドリップ）で別ゲート。
-- Q4-2: lc は既に is_published=true。ノードだけ false だった穴を塞ぐ。

BEGIN;

UPDATE public.nodes
SET is_published = true,
    updated_at = NOW()
WHERE id IN ('L1-Q3-1', 'L1-Q4-1', 'L1-Q4-2')
  AND is_published IS DISTINCT FROM true;

COMMIT;
