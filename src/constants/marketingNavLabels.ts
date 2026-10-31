/** Marketing chrome nav labels (header + footer module links). */
export const MARKETING_NAV = {
  home: 'ホーム',
  articles: '記事',
  planning: '計画',
  quiz: 'クイズ',
  admin: '管理',
} as const;

export type MarketingNavItem = {
  to: string;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
};

/** Single source for desktop + mobile header nav (same Japanese labels). */
export const MARKETING_NAV_ITEMS: MarketingNavItem[] = [
  { to: '/', label: MARKETING_NAV.home, end: true },
  { to: '/articles', label: MARKETING_NAV.articles },
  { to: '/planning', label: MARKETING_NAV.planning },
  { to: '/quiz', label: MARKETING_NAV.quiz },
  { to: '/admin', label: MARKETING_NAV.admin, adminOnly: true },
];

export const MARKETING_FOOTER = {
  platformHeading: 'アカウント',
  modulesHeading: '主要機能',
  loginSignup: 'ログイン / 登録',
  profile: 'プロフィール',
  flightPlanning: 'フライトプランニング',
  articles: '学習記事',
  quiz: 'クイズ',
} as const;

/** Guest home section h2 — left-aligned primary text (matches hero). */
export const GUEST_HOME_SECTION_HEADING_CLASS =
  'mb-3 text-left text-3xl font-bold text-[var(--text-primary)] sm:text-4xl';

/** Guest home supporting copy with AA-friendly contrast on dark surfaces. */
export const GUEST_HOME_SECTION_LEAD_CLASS =
  'text-left text-base leading-relaxed text-[var(--text-primary)]/85';
