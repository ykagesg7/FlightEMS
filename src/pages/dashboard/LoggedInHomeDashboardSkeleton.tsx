import React from 'react';

/** ログイン HOME 読み込み中（ゲスト HOME チャンクに dashboard 依存を載せない） */
export const LoggedInHomeDashboardSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-700/30 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-700/20 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-brand-primary/30 bg-brand-primary/10 p-6 animate-pulse"
            >
              <div className="h-6 w-32 bg-gray-700/30 rounded mb-4" />
              <div className="h-12 w-full bg-gray-700/20 rounded" />
            </div>
          ))}
        </div>

        <div className="h-64 bg-gray-700/10 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};
