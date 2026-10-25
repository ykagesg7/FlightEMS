-- FMT-1-4 MDX T-4 Ops Check 版に合わせる。title / description のみ。is_published は触らない。
-- 本番は上様承認後に別途適用。再実行しても title / description は同じ値になる。

UPDATE learning_contents
SET
  title = '【操縦】第4話：下を向く順番 ～Ops Check～',
  description = '居場所のあとで初めて下を向く。Ops Checkはfuelを含む定期確認、項目はCabin altitude・Oxygen・Fuel・Engine。コックピットタスクは優先順位の4番目。',
  updated_at = NOW()
WHERE id = 'FMT-1-4_OpsCheckFence';
