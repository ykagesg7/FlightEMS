/**
 * Shared schedule for drip publish (learning_contents) and weekly digest email.
 * Keep in sync with MDX meta.publishedAt / series「訓練の当たり前」.
 */

export interface ScheduledArticle {
  id: string;
  publishDate: string; // YYYY-MM-DD (JST)
  title: string;
  slug: string; // pretty path used in digest email, e.g. /articles/chores-are-the-job (resolved to MDX id in app)
  hook: string; // X-style one-liner
}

export interface WeeklyArticleDigest {
  isoWeek: string;
  seriesTitle: string;
  intro: string;
  articles: ScheduledArticle[];
  checklistNote?: string;
}

export const WEEKLY_ARTICLE_DIGESTS: Record<string, WeeklyArticleDigest> = {
  '2026-W32': {
    isoWeek: '2026-W32',
    seriesTitle: '訓練の当たり前',
    intro:
      '今週は、訓練の現場で「当たり前」に見える作法を、月〜金で一本ずつ置いていく。合格点ちょうどで満足して止まらないための、短い回顧録ばい。',
    checklistNote:
      '週末の自己点検は Public Wiki「訓練の当たり前チェック」もどうぞ（アプリ Articles が正本）。',
    articles: [
      {
        id: '4.1.1_ChoresAreTheJob',
        publishDate: '2026-08-03',
        title: '雑用こそ、仕事ばい',
        slug: '/articles/chores-are-the-job',
        hook: '座れただけじゃ「客の顔」。後始末までが仕事ばい。',
      },
      {
        id: '4.1.2_SpeakBeforeAsked',
        publishDate: '2026-08-04',
        title: '聞かるる前に、言え',
        slug: '/articles/speak-before-asked',
        hook: '聞かれてから動くのは後手。詰まる前に一言渡せ。',
      },
      {
        id: '4.1.3_AnswerFirstWord',
        publishDate: '2026-08-05',
        title: '答えは、最初の一言',
        slug: '/articles/answer-first-word',
        hook: '前置きで逃げんな。結論は最初の一言ばい。',
      },
      {
        id: '4.1.4_SayExpectations',
        publishDate: '2026-08-06',
        title: '期待は、言葉にせよ',
        slug: '/articles/say-expectations',
        hook: '「察せ」はギャンブル。役割と期待は一文で渡せ。',
      },
      {
        id: '4.1.5_JustEnoughIsNotEnough',
        publishDate: '2026-08-07',
        title: 'ちょうど、では足りん',
        slug: '/articles/just-enough-is-not-enough',
        hook: '合格点ちょうどでノートば閉じるな。自衛の半歩ば置け。',
      },
    ],
  },
};

export function getDigestForIsoWeek(isoWeek: string): WeeklyArticleDigest | null {
  return WEEKLY_ARTICLE_DIGESTS[isoWeek] ?? null;
}

export function listScheduledArticles(): ScheduledArticle[] {
  return Object.values(WEEKLY_ARTICLE_DIGESTS).flatMap((d) => d.articles);
}

export function articlesDueOnOrBefore(jstDate: string): ScheduledArticle[] {
  return listScheduledArticles().filter((a) => a.publishDate <= jstDate);
}
