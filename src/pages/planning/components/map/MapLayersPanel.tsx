import React, { useMemo, useState } from 'react';
import { Layers, X } from 'lucide-react';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { WindGridLegendPanel } from './WindGridLegendPanel';
import type { WindGridMapOverlayModel } from './hooks/usePlanningMapWindGrid';
import { BASE_LAYER_CATALOG, type MapLayerCatalogEntry, type MapLayerGroupId } from './mapLayerCatalog';
import { MAP_LAYER_PRESETS } from './mapLayerPresets';
import { MapLayersCollapsibleBlock } from './MapLayersCollapsibleBlock';
import { MapLayersPanelSection } from './MapLayersPanelSection';
import { usePlanningMapLayerControllerContext } from './planningMapLayerControllerContext';

const GROUP_ORDER: MapLayerGroupId[] = ['aviation', 'waypoints', 'local', 'reference'];

type Props = {
  open: boolean;
  onClose: () => void;
  windGridLegend: WindGridMapOverlayModel | null;
  /** false のとき lg でもボトムシート（split 左列が狭いときの地図圧迫回避） */
  useInlineSidebar?: boolean;
};

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-whiskyPapa-yellow/30 px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-whiskyPapa-yellow">
        <Layers className="h-4 w-4" />
        レイヤー
      </span>
      <button
        type="button"
        onClick={onClose}
        className="rounded p-1 text-gray-400 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
        aria-label="レイヤーパネルを閉じる"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export const MapLayersPanel: React.FC<Props> = ({
  open,
  onClose,
  windGridLegend,
  useInlineSidebar = true,
}) => {
  const controller = usePlanningMapLayerControllerContext();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const showInlineSidebar = isDesktop && useInlineSidebar;
  const [searchQuery, setSearchQuery] = useState('');

  const groupedEntries = useMemo(() => {
    if (!controller) return new Map<MapLayerGroupId, MapLayerCatalogEntry[]>();
    const map = new Map<MapLayerGroupId, MapLayerCatalogEntry[]>();
    for (const groupId of GROUP_ORDER) {
      map.set(
        groupId,
        controller.catalog.filter((entry) => entry.group === groupId),
      );
    }
    return map;
  }, [controller]);

  if (!open || !controller) return null;

  const presetDefaultOpen = showInlineSidebar;
  const baseLayerDefaultOpen = showInlineSidebar;

  const scrollContent = (
    <>
      <div className="sticky top-0 z-10 border-b border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark px-3 py-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="レイヤーを検索…"
          className="w-full rounded border border-whiskyPapa-yellow/30 bg-whiskyPapa-black px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-whiskyPapa-yellow/60 focus:outline-none"
          aria-label="レイヤー検索"
        />
      </div>

      {showInlineSidebar ? (
        <>
          <div className="border-b border-whiskyPapa-yellow/20 px-3 py-2">
            <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-gray-400">プリセット</p>
            <div className="flex flex-wrap gap-1.5">
              {MAP_LAYER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => controller.applyPreset(preset.id)}
                  className={`rounded border px-2 py-1 text-2xs sm:text-xs transition-colors ${
                    controller.activePresetId === preset.id
                      ? 'border-whiskyPapa-yellow bg-whiskyPapa-yellow/15 text-whiskyPapa-yellow'
                      : 'border-whiskyPapa-yellow/30 text-gray-200 hover:border-whiskyPapa-yellow/50 hover:bg-whiskyPapa-yellow/5'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-b border-whiskyPapa-yellow/20 px-3 py-2">
            <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-gray-400">ベース地図</p>
            <div className="flex flex-col gap-1">
              {BASE_LAYER_CATALOG.map((base) => (
                <label
                  key={base.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-white/5"
                >
                  <input
                    type="radio"
                    name="planning-base-layer"
                    className="accent-whiskyPapa-yellow"
                    checked={controller.baseLayerId === base.id}
                    onChange={() => controller.setBaseLayer(base.id)}
                  />
                  <span className="text-2xs sm:text-xs text-gray-200">{base.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <MapLayersCollapsibleBlock title="プリセット" defaultOpen={presetDefaultOpen}>
            <div className="flex flex-wrap gap-1.5">
              {MAP_LAYER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => controller.applyPreset(preset.id)}
                  className={`rounded border px-2 py-1 text-2xs transition-colors ${
                    controller.activePresetId === preset.id
                      ? 'border-whiskyPapa-yellow bg-whiskyPapa-yellow/15 text-whiskyPapa-yellow'
                      : 'border-whiskyPapa-yellow/30 text-gray-200 hover:border-whiskyPapa-yellow/50 hover:bg-whiskyPapa-yellow/5'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </MapLayersCollapsibleBlock>
          <MapLayersCollapsibleBlock title="ベース地図" defaultOpen={baseLayerDefaultOpen}>
            <div className="flex flex-col gap-1">
              {BASE_LAYER_CATALOG.map((base) => (
                <label
                  key={base.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-white/5"
                >
                  <input
                    type="radio"
                    name="planning-base-layer-mobile"
                    className="accent-whiskyPapa-yellow"
                    checked={controller.baseLayerId === base.id}
                    onChange={() => controller.setBaseLayer(base.id)}
                  />
                  <span className="text-2xs text-gray-200">{base.label}</span>
                </label>
              ))}
            </div>
          </MapLayersCollapsibleBlock>
        </>
      )}

      {controller.enabledOverlayIds.has('wind_barbs') && windGridLegend ? (
        <div className="border-b border-whiskyPapa-yellow/20 px-3 py-2">
          <WindGridLegendPanel model={windGridLegend} />
        </div>
      ) : null}

      {GROUP_ORDER.map((groupId) => {
        const entries = groupedEntries.get(groupId) ?? [];
        return (
          <MapLayersPanelSection
            key={groupId}
            groupId={groupId}
            entries={entries}
            enabledOverlayIds={controller.enabledOverlayIds}
            searchQuery={searchQuery}
            defaultOpen={groupId !== 'waypoints'}
            onToggle={controller.toggleOverlay}
          />
        );
      })}
    </>
  );

  const scrollContainer = (
    <div
      className="map-layers-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y"
      onTouchMove={(e) => e.stopPropagation()}
    >
      {scrollContent}
    </div>
  );

  if (showInlineSidebar) {
    return (
      <aside
        className="flex h-full min-h-0 w-[17.5rem] shrink-0 flex-col border-l border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark/98"
        aria-label="地図レイヤー"
      >
        <PanelHeader onClose={onClose} />
        {scrollContainer}
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[10002] bg-black/50"
        aria-label="レイヤーパネルを閉じる"
        onClick={onClose}
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-[10003] flex max-h-[85vh] min-h-0 flex-col rounded-t-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark pb-[env(safe-area-inset-bottom)] shadow-xl"
        aria-label="地図レイヤー"
      >
        <div className="shrink-0 pt-2" aria-hidden>
          <div className="mx-auto h-1 w-10 rounded-full bg-gray-500/60" />
        </div>
        <PanelHeader onClose={onClose} />
        {scrollContainer}
      </aside>
    </>
  );
};
