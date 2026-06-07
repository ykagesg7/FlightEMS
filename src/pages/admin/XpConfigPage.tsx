import React, { useCallback, useEffect, useMemo, useState } from 'react';
import articleXpRewardsConfig from '../../config/articleXpRewards.json';
import type { ArticleXpConfig } from '../../types/articles';
import { ADMIN_CARD_CLASS, ADMIN_INPUT_CLASS, AdminPageShell } from './components/AdminPageShell';

const XP_CONFIG_STORAGE_KEY = 'articleXpConfig';

type ExtendedSeriesBonus = ArticleXpConfig['series_completion_bonus'] & {
  ppl_completion_bonus?: number;
  cpl_completion_bonus?: number;
};

type StoredXpConfig = ArticleXpConfig & {
  series_completion_bonus?: ExtendedSeriesBonus;
};

function loadStoredConfig(): StoredXpConfig {
  try {
    const raw = localStorage.getItem(XP_CONFIG_STORAGE_KEY);
    if (!raw) return articleXpRewardsConfig as StoredXpConfig;
    return { ...(articleXpRewardsConfig as StoredXpConfig), ...JSON.parse(raw) };
  } catch {
    return articleXpRewardsConfig as StoredXpConfig;
  }
}

function NumberField({
  label,
  value,
  onChange,
  suffix = 'XP',
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="min-w-[8rem] text-sm font-semibold text-[var(--text-primary)]">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(step >= 1 ? parseInt(e.target.value, 10) || 0 : parseFloat(e.target.value) || 0)}
        className={`${ADMIN_INPUT_CLASS} max-w-[8rem]`}
      />
      <span className="text-sm text-[var(--text-muted)]">{suffix}</span>
    </div>
  );
}

export const XpConfigPage: React.FC = () => {
  const [config, setConfig] = useState<StoredXpConfig>(() => loadStoredConfig());
  const [articleFilter, setArticleFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setConfig(loadStoredConfig());
  }, []);

  const filteredArticles = useMemo(() => {
    const entries = Object.entries(config.articles ?? {});
    const q = articleFilter.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(([slug]) => slug.toLowerCase().includes(q));
  }, [config.articles, articleFilter]);

  const saveConfig = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      localStorage.setItem(XP_CONFIG_STORAGE_KEY, JSON.stringify(config));
      setSuccess('設定をブラウザに保存しました（この端末のみ有効）');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [config]);

  const resetConfig = useCallback(() => {
    if (!window.confirm('設定をリポジトリのデフォルト値に戻しますか？')) return;
    localStorage.removeItem(XP_CONFIG_STORAGE_KEY);
    setConfig(articleXpRewardsConfig as StoredXpConfig);
    setSuccess('デフォルト設定に戻しました');
    setTimeout(() => setSuccess(null), 4000);
  }, []);

  const seriesBonus = config.series_completion_bonus;

  return (
    <AdminPageShell
      title="XP 設定"
      description="記事読了・カテゴリ別の経験値ルールを確認・調整します。"
      headerAction={
        <button
          type="button"
          onClick={resetConfig}
          className="rounded-lg border border-brand-primary/25 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-brand-primary/10"
        >
          デフォルトに戻す
        </button>
      }
    >
      <div className={`${ADMIN_CARD_CLASS} mb-6 border-brand-primary/15 bg-brand-primary/5`}>
        <p className="text-sm text-[var(--text-primary)]">
          現在はブラウザの <code className="text-brand-primary">localStorage</code> に保存されます。
          本番全体への反映は今後 Supabase 等への移行を予定しています。
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-hud-red/40 bg-hud-red/10 p-3 text-sm text-hud-red">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-lg border border-green-400/40 bg-green-500/10 p-3 text-sm text-green-300">{success}</div>
      ) : null}

      <div className={`${ADMIN_CARD_CLASS} mb-6 space-y-4`}>
        <h2 className="text-lg font-bold text-brand-primary">デフォルト経験値</h2>
        <NumberField
          label="基本 XP"
          value={config.default}
          onChange={(value) => setConfig({ ...config, default: value })}
        />
      </div>

      {config.categories ? (
        <div className={`${ADMIN_CARD_CLASS} mb-6 space-y-4`}>
          <h2 className="text-lg font-bold text-brand-primary">カテゴリ別 XP</h2>
          {Object.entries(config.categories).map(([category, value]) => (
            <NumberField
              key={category}
              label={category}
              value={value}
              onChange={(next) =>
                setConfig({
                  ...config,
                  categories: { ...config.categories, [category]: next },
                })
              }
            />
          ))}
        </div>
      ) : null}

      {config.first_read_bonus ? (
        <div className={`${ADMIN_CARD_CLASS} mb-6 space-y-4`}>
          <h2 className="text-lg font-bold text-brand-primary">初回読了ボーナス</h2>
          <label className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={config.first_read_bonus.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  first_read_bonus: { ...config.first_read_bonus!, enabled: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-brand-primary/30 accent-brand-primary"
            />
            有効にする
          </label>
          <NumberField
            label="ボーナス量"
            value={config.first_read_bonus.amount}
            onChange={(amount) =>
              setConfig({
                ...config,
                first_read_bonus: { ...config.first_read_bonus!, amount },
              })
            }
          />
        </div>
      ) : null}

      {seriesBonus ? (
        <div className={`${ADMIN_CARD_CLASS} mb-6 space-y-4`}>
          <h2 className="text-lg font-bold text-brand-primary">シリーズ完了ボーナス</h2>
          <label className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={seriesBonus.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  series_completion_bonus: { ...seriesBonus, enabled: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-brand-primary/30 accent-brand-primary"
            />
            有効にする
          </label>
          <NumberField
            label="倍率"
            value={seriesBonus.multiplier}
            step={0.1}
            suffix="倍"
            onChange={(multiplier) =>
              setConfig({
                ...config,
                series_completion_bonus: { ...seriesBonus, multiplier },
              })
            }
          />
          {'ppl_completion_bonus' in seriesBonus ? (
            <NumberField
              label="PPL 完了ボーナス"
              value={seriesBonus.ppl_completion_bonus ?? 0}
              onChange={(ppl_completion_bonus) =>
                setConfig({
                  ...config,
                  series_completion_bonus: { ...seriesBonus, ppl_completion_bonus },
                })
              }
            />
          ) : null}
          {'cpl_completion_bonus' in seriesBonus ? (
            <NumberField
              label="CPL 完了ボーナス"
              value={seriesBonus.cpl_completion_bonus ?? 0}
              onChange={(cpl_completion_bonus) =>
                setConfig({
                  ...config,
                  series_completion_bonus: { ...seriesBonus, cpl_completion_bonus },
                })
              }
            />
          ) : null}
        </div>
      ) : null}

      {config.articles ? (
        <div className={`${ADMIN_CARD_CLASS} mb-6`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-brand-primary">個別記事 XP</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {Object.keys(config.articles).length} 件に個別設定があります
              </p>
            </div>
            <input
              type="search"
              value={articleFilter}
              onChange={(e) => setArticleFilter(e.target.value)}
              placeholder="スラッグで検索…"
              className={`${ADMIN_INPUT_CLASS} quiz-filter-search max-w-xs`}
            />
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {filteredArticles.map(([slug, value]) => (
              <div
                key={slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-primary/15 bg-brand-primary/5 px-3 py-2"
              >
                <span className="break-all text-sm text-[var(--text-primary)]">{slug}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={value}
                    min={0}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10) || 0;
                      setConfig({
                        ...config,
                        articles: { ...config.articles, [slug]: next },
                      });
                    }}
                    className={`${ADMIN_INPUT_CLASS} w-24`}
                  />
                  <span className="text-xs text-[var(--text-muted)]">XP</span>
                </div>
              </div>
            ))}
            {filteredArticles.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">該当する記事がありません。</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void saveConfig()}
          disabled={saving}
          className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {saving ? '保存中…' : '設定を保存'}
        </button>
      </div>
    </AdminPageShell>
  );
};

export default XpConfigPage;
