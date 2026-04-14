-- Blog / self-help MDX: src/content/articles/*.mdx (28 rows)
-- Pair with app gate: src/constants/withdrawnArticleIds.ts
-- Idempotent: safe to re-run.

-- === Unpublish (content review) ===
UPDATE public.learning_contents
SET is_published = false
WHERE id IN (
  '1.1.1_UnconsciousSuccess',
  '1.1.2_EndWithFuture',
  '1.1.3_PrioritizingMostImportant',
  '1.1.4_WinWinThinking',
  '1.1.5_SeekFirstToUnderstand',
  '1.1.6_Synergize',
  '1.2.5_RightPeopleOnBoard',
  '1.2.6_GiveAndTake',
  '1.2.7_GiveAndTake2',
  '1.3.1_SingleSeatMentality',
  '1.3.2_WingmanMentality',
  '1.3.3_DebriefingMentality',
  '1.3.4_ShurabaMentality',
  '1.3.5_ResultsAreEverything',
  '1.3.6_BlessingAndAdmonition',
  '2.1.1_Thinking',
  '2.1.2_ConcreteAbstract',
  '2.2.1_LogicalPresentation1',
  '2.2.2_LogicalPresentation2',
  '2.2.3_LogicalPresentation3',
  '2.2.4_LogicalPresentation4',
  '2.3.1_AnalogyThinking1',
  '2.3.2_AnalogyThinking2',
  '2.3.3_AnalogyThinking3',
  '2.4.1_MillionaireTeaching1',
  '2.4.2_MillionaireTeaching2',
  '2.4.3_MillionaireTeaching3',
  '2.4.4_MillionaireTeaching4'
);

-- === Republish after review ===
-- See: 20260414_blog_articles_republish_learning_contents.sql
