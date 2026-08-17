-- CP public titles. Title/description only; do not touch is_published (1-1 is live on W34).

UPDATE learning_contents
SET
  title = '【操縦】第1話：形を描く前に、エリアにいろ ～CPの目的とエリア維持～',
  description = 'CPは包線の学校。最初の契約はエリア維持。地上参照がprimary。20 radialsでCenter RadialとPie-in-the-Sky。T-38のCSW/CDIは読み替え。Area 16 / Att 6。',
  updated_at = NOW()
WHERE id = 'CTX-1-1_AreaAndPurpose';
