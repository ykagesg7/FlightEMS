import React from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav';
import { AdminPageShell } from './components/AdminPageShell';

export const AdminHubPage: React.FC = () => {
  return (
    <AdminPageShell
      title="管理画面"
      description="管理者向けの設定・運用ページへ移動できます。"
      showHubLink={false}
    >
      <div className="grid gap-4">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-xl border border-brand-primary/25 bg-[var(--panel)] p-5 transition hover:border-brand-primary/45 hover:bg-brand-primary/5"
          >
            <p className="font-semibold text-brand-primary">{item.label}</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/test"
          className="inline-flex rounded-lg border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
        >
          テスト Hub へ戻る
        </Link>
      </div>
    </AdminPageShell>
  );
};

export default AdminHubPage;
