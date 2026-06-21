import React from 'react';
import type { ProfileHubSection, ProfilePanelId } from '../../../auth/profileCompletion';

export const PROFILE_HUB_SECTIONS: Array<{ id: ProfileHubSection; label: string; description: string }> = [
  { id: 'public', label: 'プロフィール', description: '名前・アバター・SNS' },
  { id: 'cohort', label: '受験予定', description: '学科試験の試験月' },
  { id: 'preferences', label: '通知・公開', description: '通知とランキング' },
  { id: 'account', label: 'アカウント', description: 'ログインとセキュリティ' },
];

export const PROFILE_PANELS: Partial<Record<ProfileHubSection, Array<{ id: ProfilePanelId; label: string }>>> = {
  public: [
    { id: 'profile', label: '基本情報' },
    { id: 'social', label: 'ソーシャル' },
  ],
  preferences: [
    { id: 'notifications', label: '通知' },
    { id: 'leaderboard', label: 'ランキング' },
  ],
  account: [
    { id: 'account', label: '基本' },
    { id: 'security', label: 'セキュリティ' },
  ],
};

interface ProfileSectionNavProps {
  activeSection: ProfileHubSection;
  activePanel: ProfilePanelId;
  onSelectSection: (section: ProfileHubSection) => void;
  onSelectPanel: (panel: ProfilePanelId) => void;
}

export const ProfileSectionNav: React.FC<ProfileSectionNavProps> = ({
  activeSection,
  activePanel,
  onSelectSection,
  onSelectPanel,
}) => {
  const subPanels = PROFILE_PANELS[activeSection];

  return (
    <div className="mb-6 space-y-3">
      <nav
        aria-label="プロフィール設定"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {PROFILE_HUB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`rounded-xl px-3 py-3 text-left transition-all sm:px-4 ${
              activeSection === section.id
                ? 'bg-brand-primary text-[var(--bg)] shadow-lg'
                : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
            }`}
            aria-current={activeSection === section.id ? 'page' : undefined}
          >
            <span className="block text-sm font-semibold">{section.label}</span>
            <span
              className={`mt-0.5 block text-xs ${
                activeSection === section.id ? 'text-[var(--bg)]/80' : 'text-[var(--text-muted)]'
              }`}
            >
              {section.description}
            </span>
          </button>
        ))}
      </nav>

      {subPanels && subPanels.length > 1 && (
        <nav
          aria-label={`${PROFILE_HUB_SECTIONS.find((s) => s.id === activeSection)?.label ?? ''}の詳細`}
          className="flex flex-wrap gap-2 border-b border-brand-primary/15 pb-3"
        >
          {subPanels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              onClick={() => onSelectPanel(panel.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                activePanel === panel.id
                  ? 'bg-brand-primary/20 text-brand-primary'
                  : 'text-[var(--text-muted)] hover:bg-brand-primary/10 hover:text-[var(--text-primary)]'
              }`}
              aria-current={activePanel === panel.id ? 'page' : undefined}
            >
              {panel.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export { PROFILE_HUB_SECTIONS as SECTIONS };
