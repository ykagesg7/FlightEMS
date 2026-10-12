import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useMemo, useState } from 'react';
import type { SpiralLmsNode } from '../../../types/spiralLms';
import { spiralLmsDisplayStatusColorHex } from '../../../utils/spiralLmsDisplayStatusStyle';
import {
  resolveSpiralNodeDisplayStatus,
  type SpiralLmsNodeDisplayContext,
} from '../../../utils/spiralLmsNodeDisplay';
import { buildSpiralLms3dLayout } from '../../../utils/spiralLmsSpiralLayout';
import { SpiralLmsNodeDetailPanel } from './SpiralLmsNodeDetailPanel';

type SpiralLms3dCanvasProps = {
  nodes: readonly SpiralLmsNode[];
  displayContext: SpiralLmsNodeDisplayContext;
};

type NodeSphereProps = {
  position: [number, number, number];
  color: string;
  selected: boolean;
  onSelect: () => void;
};

const NodeSphere: React.FC<NodeSphereProps> = ({ position, color, selected, onSelect }) => {
  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      scale={selected ? 1.35 : 1}
    >
      <sphereGeometry args={[0.28, 20, 20]} />
      <meshStandardMaterial
        color={color}
        emissive={selected ? color : '#000000'}
        emissiveIntensity={selected ? 0.35 : 0}
      />
    </mesh>
  );
};

type SpiralLms3dSceneProps = {
  nodes: readonly SpiralLmsNode[];
  displayContext: SpiralLmsNodeDisplayContext;
  selectedId: string | null;
  onSelectNode: (nodeId: string) => void;
};

const SpiralLms3dScene: React.FC<SpiralLms3dSceneProps> = ({
  nodes,
  displayContext,
  selectedId,
  onSelectNode,
}) => {
  const layout = useMemo(() => buildSpiralLms3dLayout(nodes), [nodes]);
  const maxY = layout.reduce((max, entry) => Math.max(max, entry.position.y), 0);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 12, 4]} intensity={0.9} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={40}
        target={[0, maxY / 2, 0]}
      />
      {layout.map(({ node, position }) => {
        const status = resolveSpiralNodeDisplayStatus(node, displayContext);
        const color = spiralLmsDisplayStatusColorHex(status);
        return (
          <NodeSphere
            key={node.id}
            position={[position.x, position.y, position.z]}
            color={color}
            selected={selectedId === node.id}
            onSelect={() => {
              onSelectNode(node.id);
            }}
          />
        );
      })}
    </>
  );
};

export const SpiralLms3dCanvas: React.FC<SpiralLms3dCanvasProps> = ({ nodes, displayContext }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    return nodes.find((node) => node.id === selectedId && node.is_published) ?? null;
  }, [nodes, selectedId]);

  return (
    <div className="relative h-[min(70vh,520px)] w-full overflow-hidden rounded-lg border border-[color:var(--semantic-border)] bg-slate-950">
      <Canvas camera={{ position: [10, 8, 10], fov: 45 }} gl={{ antialias: true }}>
        <SpiralLms3dScene
          nodes={nodes}
          displayContext={displayContext}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
        />
      </Canvas>
      <p className="pointer-events-none absolute left-3 top-3 text-xs text-slate-300">
        ドラッグで回転 · スクロールでズーム · ノードをクリックで詳細
      </p>
      {selectedNode ? (
        <SpiralLmsNodeDetailPanel
          node={selectedNode}
          displayContext={displayContext}
          onClose={() => {
            setSelectedId(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default SpiralLms3dCanvas;
