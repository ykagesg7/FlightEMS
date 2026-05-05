-- 3.5.5 管制用語・フレーズロジー：スタブから本文化メタへの同期（冪等 UPDATE）
-- 適用後: MCP / Dashboard で learning_contents と MDX が一致することを確認
-- 関連 MDX: src/content/lessons/3.5.5_ATCPhraseology.mdx

BEGIN;

UPDATE learning_contents
SET
  title = '【航空通信】管制用語とフレーズロジー：標準表現と「確認の文化」',
  description = '標準的な管制用語・フレーズロジーの考え方を学科目線で整理。非定型表現の罠、復唱・聞き返し・訂正、典型応答の分類。CPL 学科向け概要（正式フレーズの正本は運用資料・ICAO 等）。',
  updated_at = now()
WHERE id = '3.5.5_ATCPhraseology';

COMMIT;
