import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import type { SpiralLmsNode } from '../../../types/spiralLms';
import {
  listPublishedSpiralNodes,
  resolveSpiralNodeDisplayStatus,
  spiralLmsDisplayStatusLabel,
  spiralLmsLevelLabel,
  spiralLmsQuadrantLabel,
  type SpiralLmsDisplayStatus,
  type SpiralLmsNodeDisplayContext,
} from '../../../utils/spiralLmsNodeDisplay';

type SpiralLmsInspectionListProps = {
  nodes: readonly SpiralLmsNode[];
  displayContext: SpiralLmsNodeDisplayContext;
};

function statusBadgeClass(status: SpiralLmsDisplayStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'MASTERED':
      return 'bg-gray-100 text-gray-800';
    case 'MAINTENANCE':
      return 'bg-amber-100 text-amber-900';
    case 'scheduled':
      return 'bg-purple-100 text-purple-900';
    case 'LOCKED':
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

export const SpiralLmsInspectionList: React.FC<SpiralLmsInspectionListProps> = ({
  nodes,
  displayContext,
}) => {
  const grouped = useMemo(() => {
    const published = listPublishedSpiralNodes(nodes);
    const byLevel = new Map<number, SpiralLmsNode[]>();
    for (const node of published) {
      const list = byLevel.get(node.z_level) ?? [];
      list.push(node);
      byLevel.set(node.z_level, list);
    }
    return [...byLevel.entries()].sort(([a], [b]) => a - b);
  }, [nodes]);

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-xl">整備点検一覧</CardTitle>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          公開ノードをレベル（L）×象限（Q）で表示します。
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {grouped.map(([zLevel, levelNodes]) => (
          <section key={zLevel} aria-labelledby={`spiral-lms-level-${zLevel}`}>
            <h3
              id={`spiral-lms-level-${zLevel}`}
              className="mb-3 text-lg font-semibold text-[color:var(--text-primary)]"
            >
              {spiralLmsLevelLabel(zLevel)}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--semantic-border)]">
                    <th className="px-3 py-2 font-medium">象限</th>
                    <th className="px-3 py-2 font-medium">ノード</th>
                    <th className="px-3 py-2 font-medium">タイトル</th>
                    <th className="px-3 py-2 font-medium">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {levelNodes.map((node) => {
                    const status = resolveSpiralNodeDisplayStatus(node, displayContext);
                    return (
                      <tr
                        key={node.id}
                        className="border-b border-[color:var(--semantic-border)]/60"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {spiralLmsQuadrantLabel(node.quadrant)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{node.id}</td>
                        <td className="px-3 py-2">{node.title}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(status)}`}
                          >
                            {spiralLmsDisplayStatusLabel(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
};
