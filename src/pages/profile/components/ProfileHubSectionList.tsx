import React from 'react';
import type { ProfileHubSection } from '../../../auth/profileCompletion';
import { PROFILE_HUB_SECTIONS } from './profileHubSections';

interface ProfileHubSectionListProps {
  onSelect: (section: ProfileHubSection) => void;
}

export const ProfileHubSectionList: React.FC<ProfileHubSectionListProps> = ({ onSelect }) => (
  <nav aria-label="プロフィール設定" className="md:hidden" data-testid="profile-hub-section-list">
    <ul className="divide-y divide-brand-primary/15 overflow-hidden rounded-xl border border-brand-primary/20">
      {PROFILE_HUB_SECTIONS.map((section) => (
        <li key={section.id}>
          <button
            type="button"
            onClick={() => onSelect(section.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-brand-primary/5"
          >
            <span>
              <span className="block text-sm font-semibold text-[var(--text-primary)]">
                {section.label}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                {section.description}
              </span>
            </span>
            <span className="text-[var(--text-muted)]" aria-hidden>
              ›
            </span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);
