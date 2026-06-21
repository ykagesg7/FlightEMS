import React from 'react';
import type { ProfileCompletion } from '../../../auth/profileCompletion';
import type { ProfileHubSection } from '../../../auth/profileCompletion';
import { ProfileCompletionStrip } from './ProfileCompletionStrip';
import { PROFILE_HUB_SECTIONS } from './profileHubSections';

interface ProfileHubSidebarProps {
  activeSection: ProfileHubSection;
  completion: ProfileCompletion;
  onSelect: (section: ProfileHubSection) => void;
}

export const ProfileHubSidebar: React.FC<ProfileHubSidebarProps> = ({
  activeSection,
  completion,
  onSelect,
}) => (
  <nav
    aria-label="プロフィール設定"
    className="hidden md:block md:w-56 md:shrink-0"
    data-testid="profile-hub-sidebar"
  >
    <div className="sticky top-24 space-y-4">
      <ProfileCompletionStrip completion={completion} compact className="rounded-lg border border-brand-primary/15 p-3" />
      <ul className="space-y-1">
        {PROFILE_HUB_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-primary/15 font-semibold text-brand-primary'
                    : 'text-[var(--text-primary)] hover:bg-brand-primary/10'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  </nav>
);
