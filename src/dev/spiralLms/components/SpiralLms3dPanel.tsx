import React, { Suspense, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import type { SpiralLmsNode } from '../../../types/spiralLms';
import { shouldUseSpiralLms3dFallback } from '../../../utils/spiralLms3dCapability';
import type { SpiralLmsNodeDisplayContext } from '../../../utils/spiralLmsNodeDisplay';
import { SpiralLmsInspectionList } from './SpiralLmsInspectionList';

const spiralLms3dCanvasImporter = import.meta.env.DEV
  ? () => import('./SpiralLms3dCanvas')
  : null;

const SpiralLms3dCanvasLazy = spiralLms3dCanvasImporter
  ? React.lazy(spiralLms3dCanvasImporter)
  : null;

type SpiralLms3dPanelProps = {
  nodes: readonly SpiralLmsNode[];
  displayContext: SpiralLmsNodeDisplayContext;
};

export const SpiralLms3dPanel: React.FC<SpiralLms3dPanelProps> = ({ nodes, displayContext }) => {
  const useFallback = useMemo(() => shouldUseSpiralLms3dFallback(), []);

  if (useFallback || !SpiralLms3dCanvasLazy) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-xl">3D 螺旋ビュー</CardTitle>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            WebGL が利用できない、または「視差効果を減らす」が有効なため、2D 一覧を表示しています。
          </p>
        </CardHeader>
        <CardContent>
          <SpiralLmsInspectionList nodes={nodes} displayContext={displayContext} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-xl">3D 螺旋ビュー</CardTitle>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          公開ノードを L（高さ）× 象限（角度）× sort_order で螺旋配置しています。
        </p>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <p className="text-sm text-[color:var(--text-secondary)]" role="status">
              3D ビューを読み込み中…
            </p>
          }
        >
          <SpiralLms3dCanvasLazy nodes={nodes} displayContext={displayContext} />
        </Suspense>
      </CardContent>
    </Card>
  );
};
