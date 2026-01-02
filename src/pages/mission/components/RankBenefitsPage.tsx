import React from 'react';
import { Link } from 'react-router-dom';
import { RANK_INFO } from '../../../types/gamification';
import type { UserRank } from '../../../types/gamification';
import RankBadge from '../../../components/marketing/RankBadge';

/**
 * ランク特典一覧ページ
 */
export const RankBenefitsPage: React.FC = () => {
  const ranks = Object.keys(RANK_INFO) as UserRank[];

  // 各ランクの特典（計画に基づく）
  const rankBenefits: Record<UserRank, string[]> = {
    fan: ['基本コンテンツアクセス'],
    spectator: ['プロフィールバッジ'],
    trainee: ['限定記事アクセス'],
    student: ['模擬試験無制限'],
    apprentice: ['フライトプラン保存上限UP'],
    pilot: ['限定Shop商品アクセス'],
    wingman: ['体験搭乗予約権', '複数条件あり'],
    ace: ['優先サポート'],
    master: ['メンター認定バッジ'],
    legend: ['殿堂入り', '特別イベント招待'],
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link to="/mission" className="text-sm text-[color:var(--hud-primary)] underline">
            ← ミッションダッシュボードへ
          </Link>
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">ランク特典一覧</h1>
          <p className="text-gray-400 text-lg">
            各ランクに応じた特典をご用意しています。ランクアップしてより多くの特典を獲得しましょう！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ranks.map((rank, index) => {
            const rankInfo = RANK_INFO[rank];
            const benefits = rankBenefits[rank] || [];

            return (
              <div
                key={rank}
                className="relative p-6 border-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  borderColor: rankInfo.color,
                  backgroundColor: `${rankInfo.color}10`,
                }}
              >
                {/* ランクバッジ */}
                <div className="flex justify-center mb-4">
                  <RankBadge rank={rank} size="lg" showLabel={true} animated={false} />
                </div>

                {/* ランク情報 */}
                <div className="text-center mb-4">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: rankInfo.color }}
                  >
                    {rankInfo.displayName}
                  </h2>
                  <p className="text-sm text-gray-400">
                    必要XP: {rankInfo.xpRequired}
                  </p>
                  {rankInfo.nextRank && (
                    <p className="text-xs text-gray-500 mt-1">
                      次のランク: {RANK_INFO[rankInfo.nextRank].displayName} ({rankInfo.nextRankXpRequired} XP)
                    </p>
                  )}
                </div>

                {/* 特典リスト */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">特典</h3>
                  <ul className="space-y-2">
                    {benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-400 mt-1">✓</span>
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 特別マーク */}
                {rank === 'wingman' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-bold bg-yellow-600 text-white rounded-full">
                      特別
                    </span>
                  </div>
                )}
                {rank === 'legend' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-bold bg-purple-600 text-white rounded-full">
                      最高
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ウイングマンランクの特別条件 */}
        <div className="mt-12 p-6 border-2 border-yellow-500 rounded-xl bg-yellow-900/20">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">ウイングマンランクについて</h2>
          <p className="text-gray-300 mb-4">
            ウイングマンランクは体験搭乗予約権が付与される特別なランクです。
            以下の条件を全て満たす必要があります：
          </p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>経験値: 600 XP以上</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>記事読了: 30記事以上</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>試験パス: 全科目で80%以上の正答率</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>ロイヤリティ: 購買3回以上 OR ストリーク30日以上</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RankBenefitsPage;

