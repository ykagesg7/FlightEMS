export type AdminNavItem = {
  to: string;
  label: string;
  description: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    to: '/admin/question-reports',
    label: '問題報告',
    description: 'ユーザーからの問題・解説の報告を確認・対応',
  },
  {
    to: '/admin/ranks',
    label: 'ランク設定',
    description: 'PPL/CPL ランク昇格条件の管理',
  },
  {
    to: '/admin/xp',
    label: 'XP 設定',
    description: '経験値・報酬ルールの管理',
  },
];
