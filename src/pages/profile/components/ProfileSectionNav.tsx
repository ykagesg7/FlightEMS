import React from 'react';
import type { ProfileSectionId } from '../../../auth/profileCompletion';

const SECTIONS: Array<{ id: ProfileSectionId; label: string }> = [
  { id: 'public', label: '公開プロフィール' },
  { id: 'account', label: 'アカウント' },
  { id: 'social', label: 'ソーシャル' },
  { id: 'notifications', label: '通知' },
  { id: 'leaderboard', label: 'ランキング' },
  { id: 'security', label: 'セキュリティ' },
];

interface ProfileSectionNavProps {
  activeSection: ProfileSectionId;
  onSelect: (section: ProfileSectionId) => void;
}

export const ProfileSectionNav: React.FC<ProfileSectionNavProps> = ({ activeSection, onSelect }) => (
  <nav aria-label="プロフィール設定" className="mb-6 flex flex-wrap gap-2">
    {SECTIONS.map((section) => (
      <button
        key={section.id}
        type="button"
        onClick={() => onSelect(section.id)}
        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          activeSection === section.id
            ? 'bg-brand-primary text-[var(--bg)] shadow-lg'
            : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
        }`}
        aria-current={activeSection === section.id ? 'page' : undefined}
      >
        {section.label}
      </button>
    ))}
  </nav>
);

export { SECTIONS };
