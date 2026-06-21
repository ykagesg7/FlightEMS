import React from 'react';
import { Link } from 'react-router-dom';

export const ProfileHubBackLink: React.FC = () => (
  <Link
    to="/profile"
    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline md:hidden"
    data-testid="profile-hub-back"
  >
    <span aria-hidden>←</span>
    設定に戻る
  </Link>
);
