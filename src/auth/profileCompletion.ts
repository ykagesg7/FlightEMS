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
    href: '/profile?tab=social',
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
    href: '/profile?tab=notifications',
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

/** Legacy ?tab= values mapped to Profile Hub section ids */
export type ProfileSectionId = 'public' | 'account' | 'social' | 'notifications' | 'leaderboard' | 'security';

const LEGACY_TAB_MAP: Record<string, ProfileSectionId> = {
  profile: 'public',
  public: 'public',
  account: 'account',
  social: 'social',
  notifications: 'notifications',
  leaderboard: 'leaderboard',
  security: 'security',
  'ppl-ranks': 'public',
};

export function resolveProfileSection(tabParam: string | null): ProfileSectionId {
  if (tabParam && tabParam in LEGACY_TAB_MAP) {
    return LEGACY_TAB_MAP[tabParam];
  }
  return 'public';
}

export function profileSectionToTabParam(section: ProfileSectionId): string {
  return section;
}
