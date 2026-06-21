import React from 'react';
import { Typography } from '../../../components/ui/Typography';

interface ProfileStickySaveBarProps {
  visible: boolean;
  message?: string;
}

export const ProfileStickySaveBar: React.FC<ProfileStickySaveBarProps> = ({
  visible,
  message = '未保存の変更があります。各フォームの「保存」ボタンで保存してください。',
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-primary/30 bg-[var(--panel)] px-4 py-3 shadow-lg md:hidden"
      data-testid="profile-sticky-save-bar"
      role="status"
    >
      <Typography variant="body-sm" className="text-center text-[var(--text-primary)]">
        {message}
      </Typography>
    </div>
  );
};
