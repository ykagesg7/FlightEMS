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
    href: '/profile?tab=profile',
    benefit: '学習記録やコメントに名前が表示されます',
    isComplete: (p) => Boolean(p.username?.trim()),
  },
  {
    id: 'avatar_url',
    weight: 25,
    label: 'プロフィール画像を追加',
    href: '/profile?tab=profile',
    benefit: 'ダッシュボードやメニューがパーソナルになります',
    isComplete: (p) => Boolean(p.avatar_url?.trim()),
  },
  {
    id: 'bio',
    weight: 20,
    label: '学習目標を書く',
    href: '/profile?tab=profile',
    benefit: '仲間にあなたの目標が伝わります',
    isComplete: (p) => Boolean(p.bio?.trim()),
  },
  {
    id: 'social_links',
    weight: 10,
    label: 'ソーシャルリンクを追加',
    href: '/profile?tab=profile',
    benefit: 'SNS でつながりやすくなります',
    isComplete: (p) => hasAnySocialLink(p.social_links),
  },
  {
    id: 'website',
    weight: 10,
    label: 'Webサイトを追加',
    href: '/profile?tab=profile',
    benefit: 'ポートフォリオやブログを共有できます',
    isComplete: (p) => Boolean(p.website?.trim()),
  },
  {
    id: 'notifications',
    weight: 15,
    label: '通知設定を確認',
    href: '/profile?tab=privacy',
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

/** Profile Hub sections (4 groups, no sub-panels) */
export type ProfileHubSection = 'profile' | 'learning' | 'privacy' | 'account';

/** @deprecated Use ProfileHubSection */
export type ProfileSectionId = ProfileHubSection;

export interface ResolvedProfileRoute {
  section: ProfileHubSection | null;
}

const VALID_SECTIONS: readonly ProfileHubSection[] = [
  'profile',
  'learning',
  'privacy',
  'account',
];

/** Legacy ?tab= values mapped to new section ids */
const LEGACY_TAB_MAP: Record<string, ProfileHubSection> = {
  profile: 'profile',
  public: 'profile',
  social: 'profile',
  'ppl-ranks': 'profile',
  cohort: 'learning',
  preferences: 'privacy',
  notifications: 'privacy',
  leaderboard: 'privacy',
  account: 'account',
  security: 'account',
};

export function resolveProfileRoute(
  tabParam: string | null,
  _panelParam?: string | null,
): ResolvedProfileRoute {
  if (!tabParam) {
    return { section: null };
  }
  if (tabParam in LEGACY_TAB_MAP) {
    return { section: LEGACY_TAB_MAP[tabParam] };
  }
  if (VALID_SECTIONS.includes(tabParam as ProfileHubSection)) {
    return { section: tabParam as ProfileHubSection };
  }
  return { section: 'profile' };
}

/** @deprecated Use resolveProfileRoute */
export function resolveProfileSection(tabParam: string | null): ProfileHubSection | null {
  return resolveProfileRoute(tabParam).section;
}

export function buildProfileSearchParams(section: ProfileHubSection): Record<string, string> {
  return { tab: section };
}

export function profileSectionToTabParam(section: ProfileHubSection): string {
  return section;
}

export function isProfileHubSection(value: string): value is ProfileHubSection {
  return VALID_SECTIONS.includes(value as ProfileHubSection);
}
