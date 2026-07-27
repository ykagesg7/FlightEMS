import React, { useMemo, useState } from 'react';
import { filterNavaidsByQuery } from './cursorNavaidUtils';
import type { PlanningMapNavaid } from './planningMapTypes';
import {
  NAVAID_DME_STEP_NM,
  NAVAID_RADIAL_MAX_NM,
  NAVAID_RADIAL_STEP_DEG,
} from './navaidRadialGridUtils';

type Props = {
  navaids: PlanningMapNavaid[];
  selectedId: string;
  onSelectId: (id: string) => void;
};

/**
 * ラジアル／DME 網の基準 NAVAID 選択（レイヤーパネル内）。
 */
export const NavaidRadialGridPanel: React.FC<Props> = ({
  navaids,
  selectedId,
  onSelectId,
}) => {
  const [query, setQuery] = useState('');
  const suggestions = useMemo(
    () => filterNavaidsByQuery(navaids, query, 30),
    [navaids, query],
  );
  const selected = navaids.find((n) => n.id === selectedId);

  return (
    <div className="space-y-1.5">
      <p className="text-2xs font-semibold uppercase tracking-wide text-gray-400">
        ラジアル／DME 網（参考）
      </p>
      <p className="text-2xs text-gray-500">
        磁方位 {NAVAID_RADIAL_STEP_DEG}°・距離 {NAVAID_DME_STEP_NM} nm（最大{' '}
        {NAVAID_RADIAL_MAX_NM} nm）。教育用固定磁気偏差。実運航用ではありません。
      </p>
      <div className="text-2xs text-gray-300">
        基準:{' '}
        <span className="font-mono text-whiskyPapa-yellow">
          {selected ? `${selected.id}` : selectedId || '—'}
        </span>
        {selected?.name ? (
          <span className="text-gray-500">（{selected.name}）</span>
        ) : null}
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ID または名称で検索…（例: AHT）"
        className="w-full rounded border border-whiskyPapa-yellow/30 bg-whiskyPapa-black px-2 py-1.5 text-2xs text-white placeholder:text-gray-500 focus:border-whiskyPapa-yellow/60 focus:outline-none"
        aria-label="ラジアル網の基準 NAVAID 検索"
        autoComplete="off"
      />
      <ul className="max-h-36 overflow-y-auto rounded border border-whiskyPapa-yellow/20 divide-y divide-whiskyPapa-yellow/10">
        {suggestions.length === 0 ? (
          <li className="px-2 py-1.5 text-2xs text-gray-500">該当なし</li>
        ) : (
          suggestions.map((n) => {
            const selectedRow = n.id === selectedId;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectId(n.id);
                    setQuery('');
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-2xs hover:bg-whiskyPapa-yellow/10 ${
                    selectedRow
                      ? 'bg-whiskyPapa-yellow/15 text-whiskyPapa-yellow'
                      : 'text-gray-200'
                  }`}
                >
                  <span className="font-mono font-medium">{n.id}</span>
                  <span className="truncate text-gray-400">{n.name}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
