-- 3.5.4 緊急通信：スタブ説明から本文化メタへの同期（冪等 UPDATE）
-- 適用後: MCP / Dashboard で learning_contents と MDX が一致することを確認
-- 関連 MDX: src/content/lessons/3.5.4_EmergencyProcedures.mdx

BEGIN;

UPDATE learning_contents
SET
  title = '【航空通信】緊急時の通信手順：PAN・遭難と「守る順番」',
  description = '緊急・遭難・救難の運用レイヤと学科概念の整理。PAN・遭難のニュアンス、簡潔な発話と情報の並べ方。CPL 学科向け概要（音声手順の正本は運用資料）。',
  updated_at = now()
WHERE id = '3.5.4_EmergencyProcedures';

COMMIT;
