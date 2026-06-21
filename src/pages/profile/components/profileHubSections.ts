import type { ProfileHubSection } from '../../../auth/profileCompletion';

export type ProfileHubSectionMeta = {
  id: ProfileHubSection;
  label: string;
  description: string;
};

export const PROFILE_HUB_SECTIONS: ProfileHubSectionMeta[] = [
  { id: 'profile', label: 'プロフィール', description: '名前・アバター・SNS' },
  { id: 'learning', label: '学習・受験', description: '試験月・週次バッジ' },
  { id: 'privacy', label: '通知と公開', description: '通知とランキング' },
  { id: 'account', label: 'アカウント', description: 'ログインとセキュリティ' },
];

export function getProfileHubSectionMeta(id: ProfileHubSection): ProfileHubSectionMeta {
  const meta = PROFILE_HUB_SECTIONS.find((s) => s.id === id);
  if (!meta) {
    return PROFILE_HUB_SECTIONS[0];
  }
  return meta;
}
