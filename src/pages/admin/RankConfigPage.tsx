import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../utils/supabase';
import type { UserRank } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';
import type { Json } from '../../types/database.types';
import { ADMIN_CARD_CLASS, AdminPageShell } from './components/AdminPageShell';

type RankRequirement = {
  id: string;
  rank: UserRank;
  requirement_type: string;
  requirement_value: number;
  requirement_config: Json | null;
  is_required: boolean | null;
  alternative_group: string | null;
  priority: number | null;
  display_name: string | null;
  description: string | null;
  icon: string | null;
};

export const RankConfigPage: React.FC = () => {
  const [requirements, setRequirements] = useState<RankRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('rank_requirements')
        .select('*')
        .order('rank', { ascending: true })
        .order('priority', { ascending: true });

      if (fetchError) throw fetchError;
      setRequirements((data ?? []) as RankRequirement[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランク条件の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequirements();
  }, [loadRequirements]);

  const deleteRequirement = useCallback(async (id: string, label: string) => {
    if (!window.confirm(`「${label}」の条件を削除しますか？`)) return;

    setDeletingId(id);
    try {
      const { error: deleteError } = await supabase
        .from('rank_requirements')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await loadRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランク条件の削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  }, [loadRequirements]);

  const requirementsByRank = useMemo(() => {
    return requirements.reduce<Partial<Record<UserRank, RankRequirement[]>>>((acc, req) => {
      if (!acc[req.rank]) acc[req.rank] = [];
      acc[req.rank]!.push(req);
      return acc;
    }, {});
  }, [requirements]);

  const ranksWithRequirements = useMemo(
    () => (Object.keys(requirementsByRank) as UserRank[]).length,
    [requirementsByRank],
  );

  return (
    <AdminPageShell
      title="ランク設定"
      description="各ランクの昇格条件（rank_requirements）を確認・削除できます。"
      headerAction={
        <button
          type="button"
          onClick={() => void loadRequirements()}
          className="rounded-lg border border-brand-primary/30 px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
        >
          再読み込み
        </button>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`${ADMIN_CARD_CLASS} px-4 py-3`}>
          <p className="text-xs font-semibold text-[var(--text-muted)]">登録条件数</p>
          <p className="mt-1 text-xl font-bold text-brand-primary">{requirements.length}</p>
        </div>
        <div className={`${ADMIN_CARD_CLASS} px-4 py-3`}>
          <p className="text-xs font-semibold text-[var(--text-muted)]">条件のあるランク</p>
          <p className="mt-1 text-xl font-bold text-brand-primary">{ranksWithRequirements}</p>
        </div>
        <div className={`${ADMIN_CARD_CLASS} col-span-2 px-4 py-3 sm:col-span-1`}>
          <p className="text-xs font-semibold text-[var(--text-muted)]">定義済みランク</p>
          <p className="mt-1 text-xl font-bold text-brand-primary">{Object.keys(RANK_INFO).length}</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-hud-red/40 bg-hud-red/10 p-3 text-sm text-hud-red">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-center text-[var(--text-muted)]">読み込み中…</p>
      ) : (
        <div className="space-y-6">
          {(Object.keys(RANK_INFO) as UserRank[]).map((rank) => {
            const rankInfo = RANK_INFO[rank];
            const rankRequirements = requirementsByRank[rank] ?? [];

            return (
              <section key={rank} className={ADMIN_CARD_CLASS}>
                <div className="mb-4 flex items-center gap-4 border-b border-brand-primary/15 pb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{
                      backgroundColor: `${rankInfo.color}20`,
                      borderColor: rankInfo.color,
                      borderWidth: '2px',
                    }}
                  >
                    {rankInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: rankInfo.color }}>
                      {rankInfo.displayName}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      必要 XP: {rankInfo.xpRequired.toLocaleString('ja-JP')}
                      {rankInfo.nextRank ? ` · 次: ${RANK_INFO[rankInfo.nextRank].displayName}` : ''}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-brand-primary/25 px-3 py-1 text-xs font-semibold text-brand-primary">
                    {rankRequirements.length} 条件
                  </span>
                </div>

                <div className="space-y-3">
                  {rankRequirements.map((req) => {
                    const label = req.display_name || req.requirement_type;
                    return (
                      <article
                        key={req.id}
                        className="rounded-lg border border-brand-primary/15 bg-brand-primary/5 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {req.icon ? <span aria-hidden>{req.icon}</span> : null}
                              <span className="font-semibold text-[var(--text-primary)]">{label}</span>
                              {req.alternative_group ? (
                                <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary">
                                  OR: {req.alternative_group}
                                </span>
                              ) : null}
                              {req.is_required ? (
                                <span className="rounded-full border border-brand-primary/20 px-2 py-0.5 text-xs text-[var(--text-muted)]">
                                  必須
                                </span>
                              ) : null}
                            </div>
                            {req.description ? (
                              <p className="mb-2 text-sm text-[var(--text-muted)]">{req.description}</p>
                            ) : null}
                            <dl className="grid gap-1 text-xs text-[var(--text-muted)] sm:grid-cols-2">
                              <div>
                                <dt className="inline font-semibold text-[var(--text-primary)]">タイプ: </dt>
                                <dd className="inline">{req.requirement_type}</dd>
                              </div>
                              <div>
                                <dt className="inline font-semibold text-[var(--text-primary)]">値: </dt>
                                <dd className="inline">{req.requirement_value}</dd>
                              </div>
                              <div>
                                <dt className="inline font-semibold text-[var(--text-primary)]">優先度: </dt>
                                <dd className="inline">{req.priority ?? '—'}</dd>
                              </div>
                            </dl>
                          </div>
                          <button
                            type="button"
                            onClick={() => void deleteRequirement(req.id, label)}
                            disabled={deletingId === req.id}
                            className="rounded-lg border border-hud-red/35 bg-hud-red/10 px-3 py-1.5 text-xs font-semibold text-hud-red hover:bg-hud-red/15 disabled:opacity-50"
                          >
                            削除
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {rankRequirements.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">このランクに条件は設定されていません。</p>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
};

export default RankConfigPage;
