import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import articleXpRewardsConfig from '../../config/articleXpRewards.json';
import type { ArticleXpConfig } from '../../types/articles';

/**
 * 管理者用経験値設定ページ
 */
export const XpConfigPage: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ArticleXpConfig>(articleXpRewardsConfig as ArticleXpConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 管理者チェック
  const isAdmin = profile?.roll?.toLowerCase() === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);

  // 設定を保存（将来、データベースまたはAPIに保存する実装に変更可能）
  const saveConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 現在は設定ファイルを直接編集できないため、将来の実装用のプレースホルダー
      // 実際の実装では、Supabaseに設定を保存するか、API経由で設定ファイルを更新
      console.log('設定保存（将来実装）:', config);

      // 一時的にlocalStorageに保存（開発用）
      localStorage.setItem('articleXpConfig', JSON.stringify(config));

      setSuccess('設定を保存しました（現在はローカルストレージに保存）');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">アクセス拒否</h1>
          <p className="text-gray-400">このページは管理者のみアクセスできます。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">記事経験値設定</h1>
          <p className="text-gray-400">記事ごとの経験値を設定・編集できます</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* デフォルト値設定 */}
        <div className="mb-8 p-6 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-bold mb-4">デフォルト経験値</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm">基本経験値:</label>
            <input
              type="number"
              value={config.default}
              onChange={(e) => setConfig({ ...config, default: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              min="0"
            />
            <span className="text-sm text-gray-400">XP</span>
          </div>
        </div>

        {/* カテゴリ別設定 */}
        {config.categories && (
          <div className="mb-8 p-6 border border-gray-700 rounded-lg">
            <h2 className="text-xl font-bold mb-4">カテゴリ別経験値</h2>
            <div className="space-y-3">
              {Object.entries(config.categories).map(([category, value]) => (
                <div key={category} className="flex items-center gap-4">
                  <label className="text-sm w-32">{category}:</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const newCategories = { ...config.categories };
                      newCategories[category] = parseInt(e.target.value) || 0;
                      setConfig({ ...config, categories: newCategories });
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                    min="0"
                  />
                  <span className="text-sm text-gray-400">XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ボーナス設定 */}
        {config.first_read_bonus && (
          <div className="mb-8 p-6 border border-gray-700 rounded-lg">
            <h2 className="text-xl font-bold mb-4">初回読了ボーナス</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm">有効:</label>
                <input
                  type="checkbox"
                  checked={config.first_read_bonus.enabled}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      first_read_bonus: {
                        ...config.first_read_bonus!,
                        enabled: e.target.checked,
                      },
                    });
                  }}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm">ボーナス量:</label>
                <input
                  type="number"
                  value={config.first_read_bonus.amount}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      first_read_bonus: {
                        ...config.first_read_bonus!,
                        amount: parseInt(e.target.value) || 0,
                      },
                    });
                  }}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  min="0"
                />
                <span className="text-sm text-gray-400">XP</span>
              </div>
            </div>
          </div>
        )}

        {config.series_completion_bonus && (
          <div className="mb-8 p-6 border border-gray-700 rounded-lg">
            <h2 className="text-xl font-bold mb-4">シリーズ完了ボーナス</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm">有効:</label>
                <input
                  type="checkbox"
                  checked={config.series_completion_bonus.enabled}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      series_completion_bonus: {
                        ...config.series_completion_bonus!,
                        enabled: e.target.checked,
                      },
                    });
                  }}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm">倍率:</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.series_completion_bonus.multiplier}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      series_completion_bonus: {
                        ...config.series_completion_bonus!,
                        multiplier: parseFloat(e.target.value) || 1.0,
                      },
                    });
                  }}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  min="1.0"
                  max="5.0"
                />
                <span className="text-sm text-gray-400">倍</span>
              </div>
            </div>
          </div>
        )}

        {/* 個別記事設定（簡易表示） */}
        {config.articles && (
          <div className="mb-8 p-6 border border-gray-700 rounded-lg">
            <h2 className="text-xl font-bold mb-4">個別記事経験値</h2>
            <p className="text-sm text-gray-400 mb-4">
              {Object.keys(config.articles).length}件の記事に個別設定があります
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(config.articles).map(([slug, value]) => (
                <div key={slug} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <span className="text-sm">{slug}</span>
                  <span className="text-sm text-yellow-400">{value} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 保存ボタン */}
        <div className="flex justify-end gap-4">
          <button
            onClick={saveConfig}
            disabled={isLoading}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default XpConfigPage;

