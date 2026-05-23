import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MapLayerCatalogEntry, MapLayerGroupId } from './mapLayerCatalog';
import { MAP_LAYER_GROUP_LABELS } from './mapLayerCatalog';

type Props = {
  groupId: MapLayerGroupId;
  entries: MapLayerCatalogEntry[];
  enabledOverlayIds: ReadonlySet<string>;
  searchQuery: string;
  defaultOpen?: boolean;
  onToggle: (overlayId: string, enabled: boolean) => void;
};

export const MapLayersPanelSection: React.FC<Props> = ({
  groupId,
  entries,
  enabledOverlayIds,
  searchQuery,
  defaultOpen = true,
  onToggle,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? entries.filter((e) => e.label.toLowerCase().includes(q) || e.id.includes(q))
    : entries;

  if (filtered.length === 0) return null;

  return (
    <section className="border-b border-whiskyPapa-yellow/15 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/5"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        {MAP_LAYER_GROUP_LABELS[groupId]}
        <span className="ml-auto text-2xs font-normal text-gray-400">{filtered.length}</span>
      </button>
      {open ? (
        <ul className="space-y-0.5 px-3 pb-2">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 hover:bg-white/5">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0 accent-whiskyPapa-yellow"
                  checked={enabledOverlayIds.has(entry.id)}
                  onChange={(e) => onToggle(entry.id, e.target.checked)}
                />
                <span className="min-w-0 text-2xs sm:text-xs leading-snug text-gray-200">
                  {entry.label}
                  {entry.referenceOnly ? (
                    <span className="ml-1 rounded border border-amber-500/40 px-1 text-2xs text-amber-300/90">
                      参考
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};
