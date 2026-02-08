import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../utils/supabase';
import type { UserRank } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';

/**
 * ランク条件の型定義
 */
interface RankRequirement {
  id?: string;
  rank: UserRank;
  requirement_type: string;
  requirement_value: number;
  requirement_config: Record<string, any> | null;
  is_required: boolean;
  alternative_group: string | null;
  priority: number;
  display_name: string | null;
  description: string | null;
  icon: string | null;
}

/**
 * 管理者用ランク設定ページ
 */
export const RankConfigPage: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<RankRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 管理者チェック
  const isAdmin = profile?.roll?.toLowerCase() === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadRequirements();
  }, [isAdmin, navigate]);

  // ランク条件を読み込み
  const loadRequirements = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('rank_requirements')
        .select('*')
        .order('rank', { ascending: true })
        .order('priority', { ascending: true });

      if (fetchError) throw fetchError;
      setRequirements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランク条件の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ランク条件を保存
  const _saveRequirement = useCallback(async (requirement: RankRequirement) => {
    try {
      if (requirement.id) {
        // 更新
        const { error: updateError } = await supabase
          .from('rank_requirements')
          .update(requirement)
          .eq('id', requirement.id);

        if (updateError) throw updateError;
      } else {
        // 新規作成
        const { error: insertError } = await supabase
          .from('rank_requirements')
          .insert([requirement]);

        if (insertError) throw insertError;
      }

      await loadRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランク条件の保存に失敗しました');
    }
  }, [loadRequirements]);

  // ランク条件を削除
  const deleteRequirement = useCallback(async (id: string) => {
    if (!confirm('このランク条件を削除しますか？')) return;

    try {
      const { error: deleteError } = await supabase
        .from('rank_requirements')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await loadRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ランク条件の削除に失敗しました');
    }
  }, [loadRequirements]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ランク別にグループ化
  const requirementsByRank = requirements.reduce((acc, req) => {
    if (!acc[req.rank]) acc[req.rank] = [];
    acc[req.rank].push(req);
    return acc;
  }, {} as Record<UserRank, RankRequirement[]>);

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ランク条件設定</h1>
          <p className="text-gray-400">各ランクの達成条件を設定・編集できます</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* ランク別の条件一覧 */}
        <div className="space-y-8">
          {(Object.keys(RANK_INFO) as UserRank[]).map((rank) => {
            const rankInfo = RANK_INFO[rank];
            const rankRequirements = requirementsByRank[rank] || [];

            return (
              <div key={rank} className="border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${rankInfo.color}20`,
                      borderColor: rankInfo.color,
                      borderWidth: '2px',
                    }}
                  >
                    {rankInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: rankInfo.color }}>
                      {rankInfo.displayName}
                    </h2>
                    <p className="text-sm text-gray-400">
                      必要XP: {rankInfo.xpRequired}
                    </p>
                  </div>
                </div>

                {/* 条件一覧 */}
                <div className="space-y-4">
                  {rankRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {req.icon && <span>{req.icon}</span>}
                            <span className="font-semibold">
                              {req.display_name || req.requirement_type}
                            </span>
                            {req.alternative_group && (
                              <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded">
                                OR条件: {req.alternative_group}
                              </span>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-sm text-gray-400 mb-2">{req.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span>タイプ: {req.requirement_type}</span>
                            <span>値: {req.requirement_value}</span>
                            <span>必須: {req.is_required ? 'はい' : 'いいえ'}</span>
                            <span>優先度: {req.priority}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteRequirement(req.id!)}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded text-white"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {rankRequirements.length === 0 && (
                    <p className="text-gray-500 text-sm">条件が設定されていません</p>
                  )}
                </div>

                {/* 新規条件追加ボタン（将来の拡張用） */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 rounded text-white"
                    disabled
                    title="将来実装予定"
                  >
                    + 条件を追加
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RankConfigPage;

