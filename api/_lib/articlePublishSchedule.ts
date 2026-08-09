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
  '2026-W33': {
    isoWeek: '2026-W33',
    seriesTitle: '訓練の当たり前',
    intro:
      '来週は「学び編」。指摘・失敗・素直さを、翌回に見える行動と三行デブリーフに落とす5本ばい。',
    checklistNote:
      '週末の自己点検は Public Wiki「訓練の当たり前チェック」もどうぞ（アプリ Articles が正本）。',
    articles: [
      {
        id: '4.2.1_TurnFeedbackIntoAction',
        publishDate: '2026-08-10',
        title: '指摘は、行動に落とせ',
        slug: '/articles/turn-feedback-into-action',
        hook: '「気をつけます」は目に見えん。次に見える一文に落とせ。',
      },
      {
        id: '4.2.2_PutAFrameOnFailure',
        publishDate: '2026-08-11',
        title: '失敗に、型を置け',
        slug: '/articles/put-a-frame-on-failure',
        hook: '怒られたあとに固まるな。何が／なぜ／次の三行（失敗のレシート）ば残せ。',
      },
      {
        id: '4.2.3_TakeTheGainFromFeedback',
        publishDate: '2026-08-12',
        title: '指摘のゲインを取れ',
        slug: '/articles/take-the-gain-from-feedback',
        hook: 'ダメージの秤ばかり見るな。右側に次の一点ば乗せろ。',
      },
      {
        id: '4.2.4_YesHasAShortShelfLife',
        publishDate: '2026-08-13',
        title: '「はい」は、賞味期限が短い',
        slug: '/articles/yes-has-a-short-shelf-life',
        hook: '受付スタンプの素直さは腐る。翌週の行動差分だけが証拠ばい。',
      },
      {
        id: '4.2.5_ThinkingStamina',
        publishDate: '2026-08-14',
        title: '地頭より、思考体力',
        slug: '/articles/thinking-stamina',
        hook: '一発の切れ味で閉じるな。赤入れ後の心肺でもう一周走れ。',
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
