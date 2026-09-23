/**
 * Shared schedule for drip publish (learning_contents) and weekly digest email.
 * Keep in sync with MDX meta.publishedAt.
 * One series per ISO week (訓練の当たり前 / Contact / FMT).
 * Default drip (W39 and earlier CP): 3/week Sun·Wed·Fri.
 * Cadence from **2026-W40**: **2 CP/FN per week** (Sun·Wed) + **Friday mentality slot**
 * (not listed here until a draft exists). Digest still anchors on Sunday.
 * Stock unpublished IDs until listed here; cron only flips IDs in this file.
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
      '「学び編」。指摘・失敗・素直さを、翌回に見える行動と三行デブリーフに落とす5本ばい。',
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
  '2026-W34': {
    isoWeek: '2026-W34',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は単機の入口。月・水・金の3本。エリアにいる契約から、エネルギーの交換、操縦面とGまで。図形を描く前の学校たい。',
    articles: [
      {
        id: 'CP-1-1_AreaAndPurpose',
        publishDate: '2026-08-17',
        title: '第1話：形を描く前に、エリアにいろ ～CPの目的とエリア維持～',
        slug: '/articles/cp-1-1-area-and-purpose',
        hook: '曲技の前にエリアにいろ。地上物が primary。20 radials で方式が分かれる。',
      },
      {
        id: 'CP-1-2_Energy',
        publishDate: '2026-08-19',
        title: '第2話：足りんなら換えろ ～高度と速度の交換～',
        slug: '/articles/cp-1-2-energy',
        hook: '1,000 ft ≈ 50 kt。AB で買うな。作業空域の真ん中で 300 kt が目安たい。',
      },
      {
        id: 'CP-1-3_ControlsGPio',
        publishDate: '2026-08-21',
        title: '第3話：効く面と壊れ方 ～操縦面 / PIO / G～',
        slug: '/articles/cp-1-3-controls-g-pio',
        hook: 'ラダーは高 AOA、エルロンは低 AOA。PIO は freeze。G は warmup。',
      },
    ],
  },
  '2026-W35': {
    isoWeek: '2026-W35',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は機体を感じる3本。月・水・金。Deep stall、加速失速、効く面。図形を描く前の feel たい。',
    articles: [
      {
        id: 'CP-2-1_DeepStall',
        publishDate: '2026-08-24',
        title: '第4話：引いたままは沈む ～Deep stall～',
        slug: '/articles/cp-2-1-deep-stall',
        hook: '引いたままは沈む。戻すのは緩めること。',
      },
      {
        id: 'CP-2-2_AcceleratedStall',
        publishDate: '2026-08-26',
        title: '第5話：もっと引くな ～加速失速～',
        slug: '/articles/cp-2-2-accelerated-stall',
        hook: '曲がりきれなくてもいい。失速に入れるな。',
      },
      {
        id: 'CP-2-3_RollAuthority',
        publishDate: '2026-08-28',
        title: '第6話：効く面でロールしろ ～ラダーとエルロン～',
        slug: '/articles/cp-2-3-roll-authority',
        hook: '効きが悪いから足すな。出汁はレンゲ、麺は箸。',
      },
    ],
  },
  '2026-W36': {
    isoWeek: '2026-W36',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は Season 2 の締め。月・水・金の3本。unload、トリム、向きを返す。図形の前の feel たい。',
    articles: [
      {
        id: 'CP-2-4_Unload',
        publishDate: '2026-08-30',
        title: '第7話：抜いて増やせ ～Unloadと加速～',
        slug: '/articles/cp-2-4-unload',
        hook: '加速したければ G を抜け。サイドブレーキは引くな。',
      },
      {
        id: 'CP-2-5_TrimFailure',
        publishDate: '2026-09-02',
        title: '第8話：手放すな、retrimしろ ～模擬トリム故障～',
        slug: '/articles/cp-2-5-trim-failure',
        hook: '手放すな。終わったら retrim。',
      },
      {
        id: 'CP-2-6_PitchbackSliceback',
        publishDate: '2026-09-04',
        title: '第9話：最短で向きを返せ ～PitchbackとSliceback～',
        slug: '/articles/cp-2-6-pitchback-sliceback',
        hook: '向きは坂で返せ。Immelmann じゃない。',
      },
    ],
  },
  '2026-W37': {
    isoWeek: '2026-W37',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は Season 3 と回復の入口。1本目は今すぐ読める。configured、場周 ATS、nose-high。図形の前に、形態と戻しの feel たい。',
    articles: [
      {
        id: 'CP-3-1_ConfiguredHandling',
        publishDate: '2026-09-06',
        title: '第10話：脚を出したら遅らせろ ～Configured handling～',
        slug: '/articles/cp-3-1-configured-handling',
        hook: '脚を出したら昨日の感覚で踏むな。ラダーは遅れて来る。',
      },
      {
        id: 'CP-3-2_PatternATS',
        publishDate: '2026-09-09',
        title: '第11話：兆候を見たらリカバリー ～Pattern ATS～',
        slug: '/articles/cp-3-2-pattern-ats',
        hook: 'buffet が増えたら即リカバリー。形じゃなか。',
      },
      {
        id: 'CP-4-1_NoseHigh',
        publishDate: '2026-09-11',
        title: '第12話：Noseを上げすぎたら戻せ ～Nose-high recovery～',
        slug: '/articles/cp-4-1-nose-high',
        hook: 'Nose-high はひどさに合わせて戻せ。力任せに引くな。',
      },
    ],
  },
  '2026-W38': {
    isoWeek: '2026-W38',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は Nose-low から曲技の入口。1本目は今すぐ読める。最短半径で起こす、Contract と Box、エルロンロールの終盤。図形の前に決まりを置く週たい。',
    articles: [
      {
        id: 'CP-4-2_NoseLow',
        publishDate: '2026-09-13',
        title: '第13話：突っ込んだNoseは最短で引き起こせ ～Nose-low recovery～',
        slug: '/articles/cp-4-2-nose-low',
        hook: '近い地平線へ回せ。最短半径で起こせ。',
      },
      {
        id: 'CP-5-1_AerobaticContract',
        publishDate: '2026-09-16',
        title: '第14話：図形の前に Contract を決めろ ～Aerobatic contract～',
        slug: '/articles/cp-5-1-aerobatic-contract',
        hook: '図形の前に Contract。進入と Box を先に決めろ。',
      },
      {
        id: 'CP-5-2_AileronRoll',
        publishDate: '2026-09-18',
        title: '第15話：Nose を一点に釘付けするな ～Aileron roll～',
        slug: '/articles/cp-5-2-aileron-roll',
        hook: 'Nose を釘付けするな。終盤は力を抜け。',
      },
    ],
  },
  '2026-W39': {
    isoWeek: '2026-W39',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は Season 5 の図形3本。1本目は今すぐ読める。レイジーエイト、バレルロール、ループ。パラメータを止めず、円で回し、頂点は水平。',
    articles: [
      {
        id: 'CP-5-3_LazyEight',
        publishDate: '2026-09-20',
        title: '第16話：パラメータを止めるな ～Lazy Eight～',
        slug: '/articles/cp-5-3-lazy-eight',
        hook: 'パラメータを止めるな。左右対称につなげ。',
      },
      {
        id: 'CP-5-4_BarrelRoll',
        publishDate: '2026-09-23',
        title: '第17話：機首は円で回せ、Gは抜くな ～Barrel Roll～',
        slug: '/articles/cp-5-4-barrel-roll',
        hook: '機首は円で回せ。4点を通れ。Gは抜くな。',
      },
      {
        id: 'CP-5-5_Loop',
        publishDate: '2026-09-25',
        title: '第18話：頂点は水平、完了は進入に戻せ ～Loop～',
        slug: '/articles/cp-5-5-loop',
        hook: '頂点は水平。150を切るな。完了は進入に戻せ。',
      },
    ],
  },
  '2026-W40': {
    isoWeek: '2026-W40',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は操縦2本（日・水）。Split-S / Immelmann と Cuban Eight。金曜はメンタリティ枠（稿ができ次第別途 schedule）。',
    articles: [
      {
        id: 'CP-5-6_SplitSImmelmann',
        publishDate: '2026-09-28',
        title: '第19話：一周を前半と後半に切れ ～Split-S / Immelmann～',
        slug: '/articles/cp-5-6-split-s-immelmann',
        hook: 'Loopを切れ。Split-Sは背面から、Immelmannは頂点でhalf roll。',
      },
      {
        id: 'CP-5-7_CubanEight',
        publishDate: '2026-10-01',
        title: '第20話：45°下げで裏返せ ～Cuban Eight～',
        slug: '/articles/cp-5-7-cuban-eight',
        hook: '45°下げで裏返せ。リードして引き起こせ。2回目は逆。',
      },
    ],
  },
  '2026-W41': {
    isoWeek: '2026-W41',
    seriesTitle: 'CP（単機）',
    intro:
      '来週は CP 最終2本。Cloverleaf と Chandelle。単機シリーズ完。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'CP-5-8_Cloverleaf',
        publishDate: '2026-10-05',
        title: '第21話：同じ向きに4枚の葉を描け ～Cloverleaf～',
        slug: '/articles/cp-5-8-cloverleaf',
        hook: '同じ向きに4枚。各葉は90°。第1葉は最寄りborderへ。',
      },
      {
        id: 'CP-5-9_Chandelle',
        publishDate: '2026-10-08',
        title: '第22話：最大高度の180°を描け ～Chandelle～',
        slug: '/articles/cp-5-9-chandelle',
        hook: '180°で最大高度。翼水平だが水平飛行ではない。',
      },
    ],
  },
  '2026-W42': {
    isoWeek: '2026-W42',
    seriesTitle: 'FN（編隊）',
    intro:
      '来週は編隊の入口2本。V.F.Rの血の掟と滑走路のシンクロ。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'FMT-1-1_WingmanVFR',
        publishDate: '2026-10-12',
        title: '第1話：ウイングマンの魂 ～V.F.Rの血の掟～',
        slug: '/articles/fmt-1-1-wingman-vfr',
        hook: 'V.F.Rの順番。衝突回避が先、編隊はその次。',
      },
      {
        id: 'FMT-1-2_RunwayLineupTakeoff',
        publishDate: '2026-10-15',
        title: '第2話：滑走路のシンクロ ～的からの脱出と周辺視野～',
        slug: '/articles/fmt-1-2-runway-lineup-takeoff',
        hook: '的から脱出。周辺視野でリーダーを捉えろ。',
      },
    ],
  },
  '2026-W43': {
    isoWeek: '2026-W43',
    seriesTitle: 'FN（編隊）',
    intro:
      '来週は空中の居場所と運用チェック。Fingertip / Route、Ops check / FENCE。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'FMT-1-3_FingertipRoute',
        publishDate: '2026-10-19',
        title: '第3話：空中の居場所 ～FingertipとRoute～',
        slug: '/articles/fmt-1-3-fingertip-route',
        hook: 'helmet abeam slab bolt。Routeは2 ship widths〜500 ft。',
      },
      {
        id: 'FMT-1-4_OpsCheckFence',
        publishDate: '2026-10-22',
        title: '第4話：下を向く順番 ～Ops checkとFENCE～',
        slug: '/articles/fmt-1-4-ops-check-fence',
        hook: '居場所のあとで下を向く。FENCEは空域IN/OUT。',
      },
    ],
  },
  '2026-W44': {
    isoWeek: '2026-W44',
    seriesTitle: 'FN（編隊）',
    intro:
      '来週は Lead change と Spread。リードは渡す、広げて見る。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'FMT-1-5_LeadChange',
        publishDate: '2026-10-26',
        title: '第5話：リードは渡すもん ～Lead Change～',
        slug: '/articles/fmt-1-5-lead-change',
        hook: 'リードは奪わず渡す。ackは3/9到達後。',
      },
      {
        id: 'FMT-1-6_Spread',
        publishDate: '2026-10-29',
        title: '第6話：広いのは見るため ～Spread～',
        slug: '/articles/fmt-1-6-spread',
        hook: 'Spreadは1,000–3,000 ftの箱。見るため広げろ。',
      },
    ],
  },
  '2026-W45': {
    isoWeek: '2026-W45',
    seriesTitle: 'FN（編隊）',
    intro:
      '来週は Trail 族と Rejoin。後ろの箱と合流の型。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'FMT-1-7_TrailFamily',
        publishDate: '2026-11-02',
        title: '第7話：後ろなら全部同じはブルシット ～Trail族～',
        slug: '/articles/fmt-1-7-trail-family',
        hook: 'Close TrailとETは別箱。Fluid≠FM。',
      },
      {
        id: 'FMT-1-8_Rejoin',
        publishDate: '2026-11-05',
        title: '第8話：合流ば救うな ～Pitchout / Rejoin / Overshoot / Breakout～',
        slug: '/articles/fmt-1-8-rejoin',
        hook: '合流を救うな。Overshootは早く。Breakoutは4条件。',
      },
    ],
  },
  '2026-W46': {
    isoWeek: '2026-W46',
    seriesTitle: 'FN（編隊）',
    intro:
      '来週は FN Season 1 の締め2本。LAB と Lost Wingman。金曜はメンタリティ枠。',
    articles: [
      {
        id: 'FMT-1-9_TacticalLAB',
        publishDate: '2026-11-09',
        title: '第9話：見せ場じゃない ～LAB / Tactical Turns～',
        slug: '/articles/fmt-1-9-tactical-lab',
        hook: 'LABは4,000–6,000 ft。合図なしはdelayed 90。',
      },
      {
        id: 'FMT-1-10_LostWingman',
        publishDate: '2026-11-12',
        title: '第10話：探すな、離れろ ～Lost Wingman / KIO～',
        slug: '/articles/fmt-1-10-lost-wingman',
        hook: '見失ったら探すな。wings-levelはinformと15°×15 s。',
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
