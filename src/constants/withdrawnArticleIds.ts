/**
 * Blog / self-help MDX under src/content/articles — temporarily withheld from the site
 * while content is reviewed. Pair with Supabase learning_contents.is_published = false.
 * After review: clear this list and run the republish SQL in scripts/database.
 */
export const WITHDRAWN_ARTICLE_IDS: readonly string[] = [
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
  '2.4.4_MillionaireTeaching4',
] as const;

const withdrawnSet = new Set<string>(WITHDRAWN_ARTICLE_IDS);

export function isWithdrawnArticle(contentId: string): boolean {
  return withdrawnSet.has(contentId);
}

/** User-facing copy (JP) */
export const WITHDRAWN_ARTICLE_MESSAGE =
  'この記事は現在、内容を精査中のため表示できません。しばらくしてから記事一覧をご確認ください。';
