import type { Profile } from '../stores/authStore';

export interface ProfileCompletionAction {
  id: string;
  label: string;
  href: string;
  benefit: string;
}

export interface ProfileCompletion {
  percent: number;
  completedFields: string[];
  nextAction: ProfileCompletionAction | null;
}

export interface ProfileCompletionInput {
  profile: Profile | null;
  hasNotificationSettings?: boolean;
}

const FIELD_WEIGHTS: Array<{
  id: string;
  weight: number;
  label: string;
  href: string;
  benefit: string;
  isComplete: (profile: Profile) => boolean;
}> = [
  {
    id: 'username',
    weight: 20,
    label: 'ユーザー名を設定',
    href: '/profile?tab=public',
    benefit: '学習記録やコメントに名前が表示されます',
    isComplete: (p) => Boolean(p.username?.trim()),
  },
  {
    id: 'avatar_url',
    weight: 25,
    label: 'プロフィール画像を追加',
    href: '/profile?tab=public',
    benefit: 'ダッシュボードやメニューがパーソナルになります',
    isComplete: (p) => Boolean(p.avatar_url?.trim()),
  },
  {
    id: 'bio',
    weight: 20,
    label: '学習目標を書く',
    href: '/profile?tab=public',
    benefit: '仲間にあなたの目標が伝わります',
    isComplete: (p) => Boolean(p.bio?.trim()),
  },
  {
    id: 'social_links',
    weight: 15,
    label: 'ソーシャルリンクを追加',
    href: '/profile?tab=public&panel=social',
    benefit: 'SNS でつながりやすくなります',
    isComplete: (p) => hasAnySocialLink(p.social_links),
  },
  {
    id: 'website',
    weight: 10,
    label: 'Webサイトを追加',
    href: '/profile?tab=public',
    benefit: 'ポートフォリオやブログを共有できます',
    isComplete: (p) => Boolean(p.website?.trim()),
  },
  {
    id: 'notifications',
    weight: 10,
    label: '通知設定を確認',
    href: '/profile?tab=preferences',
    benefit: '学習リマインダーを受け取れます',
    isComplete: () => false,
  },
];

function hasAnySocialLink(raw: Profile['social_links']): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  return Object.values(raw as Record<string, unknown>).some(
    (v) => typeof v === 'string' && v.trim().length > 0,
  );
}

export function computeProfileCompletion({
  profile,
  hasNotificationSettings = false,
}: ProfileCompletionInput): ProfileCompletion {
  if (!profile) {
    return { percent: 0, completedFields: [], nextAction: null };
  }

  let earned = 0;
  const completedFields: string[] = [];
  let nextAction: ProfileCompletionAction | null = null;

  for (const field of FIELD_WEIGHTS) {
    const done = field.id === 'notifications'
      ? hasNotificationSettings
      : field.isComplete(profile);

    if (done) {
      earned += field.weight;
      completedFields.push(field.id);
    } else if (!nextAction) {
      nextAction = {
        id: field.id,
        label: field.label,
        href: field.href,
        benefit: field.benefit,
      };
    }
  }

  return {
    percent: Math.min(100, earned),
    completedFields,
    nextAction,
  };
}

/** Top-level Profile Hub sections (4 groups) */
export type ProfileHubSection = 'public' | 'cohort' | 'preferences' | 'account';

/** Sub-panels within a hub section */
export type ProfilePanelId =
  | 'profile'
  | 'social'
  | 'notifications'
  | 'leaderboard'
  | 'account'
  | 'security';

/** @deprecated Use ProfileHubSection — kept for gradual migration */
export type ProfileSectionId = ProfileHubSection;

export interface ResolvedProfileRoute {
  section: ProfileHubSection;
  panel: ProfilePanelId;
}

const DEFAULT_PANEL: Record<ProfileHubSection, ProfilePanelId> = {
  public: 'profile',
  cohort: 'profile',
  preferences: 'notifications',
  account: 'account',
};

/** Legacy ?tab= values mapped to hub section + panel */
const LEGACY_TAB_MAP: Record<string, ResolvedProfileRoute> = {
  profile: { section: 'public', panel: 'profile' },
  public: { section: 'public', panel: 'profile' },
  social: { section: 'public', panel: 'social' },
  cohort: { section: 'cohort', panel: 'profile' },
  notifications: { section: 'preferences', panel: 'notifications' },
  leaderboard: { section: 'preferences', panel: 'leaderboard' },
  account: { section: 'account', panel: 'account' },
  security: { section: 'account', panel: 'security' },
  'ppl-ranks': { section: 'public', panel: 'profile' },
};

const VALID_PANELS: Record<ProfileHubSection, readonly ProfilePanelId[]> = {
  public: ['profile', 'social'],
  cohort: ['profile'],
  preferences: ['notifications', 'leaderboard'],
  account: ['account', 'security'],
};

export function resolveProfileRoute(
  tabParam: string | null,
  panelParam: string | null,
): ResolvedProfileRoute {
  const legacy = tabParam && tabParam in LEGACY_TAB_MAP ? LEGACY_TAB_MAP[tabParam] : null;
  const section = legacy?.section
    ?? (tabParam && tabParam in DEFAULT_PANEL ? (tabParam as ProfileHubSection) : 'public');

  const allowedPanels = VALID_PANELS[section];
  if (panelParam && allowedPanels.includes(panelParam as ProfilePanelId)) {
    return { section, panel: panelParam as ProfilePanelId };
  }
  return { section, panel: legacy?.panel ?? DEFAULT_PANEL[section] };
}

/** @deprecated Use resolveProfileRoute */
export function resolveProfileSection(tabParam: string | null): ProfileHubSection {
  return resolveProfileRoute(tabParam, null).section;
}

export function buildProfileSearchParams(
  section: ProfileHubSection,
  panel?: ProfilePanelId,
): Record<string, string> {
  const resolvedPanel = panel ?? DEFAULT_PANEL[section];
  if (section === 'cohort') {
    return { tab: 'cohort' };
  }
  if (resolvedPanel === DEFAULT_PANEL[section]) {
    return { tab: section };
  }
  return { tab: section, panel: resolvedPanel };
}

export function profileSectionToTabParam(section: ProfileHubSection): string {
  return section;
}
