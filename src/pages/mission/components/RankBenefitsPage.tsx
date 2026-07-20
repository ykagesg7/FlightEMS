import React from 'react';
import { Link } from 'react-router-dom';

const LEARNING_STAGES = [
  { name: '準備', evidence: '目標資格と受験予定を設定', outcome: '出発点と次の一歩が決まる' },
  { name: '基礎訓練', evidence: '記事読了と理解チェック', outcome: '基礎用語を説明し、基本問題に答えられる' },
  { name: '科目習熟', evidence: '科目別に10問以上・80%以上', outcome: '科目ごとの知識を安定して使える' },
  { name: '横断演習', evidence: '複数科目で習熟基準を達成', outcome: '知識を組み合わせて判断できる' },
  { name: '試験準備', evidence: '試験30日前・模試と弱点復習', outcome: '本番形式で仕上がりを確認できる' },
  { name: '学科試験完了', evidence: '受験後に本人が完了を記録', outcome: '第1期を完了し、次の訓練へ進む' },
] as const;

export const RankBenefitsPage: React.FC = () => {
  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link to="/mission" className="text-sm text-[color:var(--hud-primary)] underline">
            ← ミッションダッシュボードへ
          </Link>
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">学科試験までの学習段階</h1>
          <p className="text-gray-400 text-lg">
            XPの多さではなく、確認できた学習成果に基づいて現在地が進みます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_STAGES.map((stage, index) => (
            <div
              key={stage.name}
              className="rounded-xl border border-brand-primary/30 bg-brand-secondary-dark/40 p-6"
            >
              <p className="mb-2 text-sm font-mono text-brand-primary">PHASE {index + 1}</p>
              <h2 className="mb-3 text-2xl font-bold">{stage.name}</h2>
              <p className="mb-4 text-sm text-gray-400">{stage.outcome}</p>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">到達の証拠</p>
                <p className="mt-2 text-sm text-gray-300">{stage.evidence}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 border-2 border-yellow-500 rounded-xl bg-yellow-900/20">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">第2期について</h2>
          <p className="text-gray-300">
            ウイングマーク、実技課程、戦闘機課程などは第2期で別の検証可能なマイルストーンとして追加します。
            学科XPだけで自動付与することはありません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankBenefitsPage;

