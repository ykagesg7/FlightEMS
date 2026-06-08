import React, { useCallback, useState } from 'react';
import type { GeoJsonObject } from 'geojson';
import type L from 'leaflet';
import type { SwimNotamItem } from '@/services/swimNotam';
import { buildNotamCardView } from './notamDisplayUtils';
import type { SnapPoint } from './snapSheetUtils';
import {
  addSwimNotamGeometry,
  fitSwimNotamMapOverlay,
  removeSwimNotamGeometry,
} from './popups/swimNotamMapOverlay';

type Props = {
  map: L.Map | null;
  current: SwimNotamItem[];
  future: SwimNotamItem[];
  loading: boolean;
  error: string | null;
  disclaimer?: string;
  snap: SnapPoint;
  highlightedIds: ReadonlySet<string>;
  onToggleHighlight: (id: string, geometry: GeoJsonObject | undefined, variant: 'current' | 'future') => void;
};

function NotamCard({
  item,
  variant,
  map,
  highlighted,
  onToggleHighlight,
}: {
  item: SwimNotamItem;
  variant: 'current' | 'future';
  map: L.Map | null;
  highlighted: boolean;
  onToggleHighlight: Props['onToggleHighlight'];
}) {
  const card = buildNotamCardView(item);
  const overlayId = `${variant}:${item.key}`;
  const canMap = card.hasGeometry && map != null;

  const handleMapToggle = () => {
    if (!canMap || !item.geometry) return;
    onToggleHighlight(overlayId, item.geometry as GeoJsonObject, variant);
  };

  const variantBadge =
    variant === 'current' ? (
      <span className="rounded bg-hud-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-hud-warning">
        現在有效
      </span>
    ) : (
      <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-300">
        将来有效
      </span>
    );

  const techLines: string[] = [];
  if (card.technicalMeta?.eventCode) techLines.push(`ID: ${card.technicalMeta.eventCode}`);
  if (card.technicalMeta?.featureLabel) techLines.push(`種別: ${card.technicalMeta.featureLabel}`);
  if (card.technicalMeta?.locationText) techLines.push(`場所: ${card.technicalMeta.locationText}`);

  return (
    <article className="rounded border border-whiskyPapa-yellow/15 bg-black/25 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-700/80 px-1.5 py-0.5 text-[10px] text-gray-200">
          {card.categoryLabel}
        </span>
        {variantBadge}
      </div>
      <h4 className="mt-1.5 text-sm font-semibold leading-snug text-gray-50">{card.cardTitle}</h4>
      <p
        className="mt-1 text-xs leading-relaxed text-gray-300"
        title={card.bodyTruncated ? item.primaryText ?? item.noteSnippet : undefined}
      >
        {card.bodyText}
      </p>
      <p className="mt-1.5 text-[11px] text-gray-400" title={card.period.titleAttr}>
        {card.period.label}
      </p>
      {card.verticalText ? (
        <p className="mt-0.5 text-[11px] text-gray-400">高度: {card.verticalText}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {canMap ? (
          <button
            type="button"
            onClick={handleMapToggle}
            className={
              highlighted
                ? 'rounded border border-hud-warning/60 bg-hud-warning/15 px-2 py-1 text-[11px] font-semibold text-hud-warning'
                : 'rounded border border-whiskyPapa-yellow/30 px-2 py-1 text-[11px] text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10'
            }
          >
            {highlighted ? '地図表示中' : '地図で強調'}
          </button>
        ) : (
          <span className="text-[10px] text-gray-500">（地図形状なし）</span>
        )}
      </div>
      {(card.detailNotes.length > 0 || techLines.length > 0 || card.rawXml) && (
        <details className="mt-2 text-[11px] text-gray-400">
          <summary className="cursor-pointer select-none text-gray-300 hover:text-whiskyPapa-yellow">
            詳細情報
          </summary>
          <div className="mt-1.5 space-y-1 border-t border-gray-700/50 pt-1.5">
            {card.detailNotes.map((note) => (
              <p key={note.slice(0, 40)} className="leading-relaxed text-gray-300">
                {note}
              </p>
            ))}
            {techLines.map((line) => (
              <p key={line} className="font-mono text-[10px] text-gray-500">
                {line}
              </p>
            ))}
            {card.rawXml ? (
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-gray-700/60 bg-slate-900/80 p-1.5 font-mono text-[9px] leading-tight text-gray-400">
                {card.rawXml}
                {card.rawXmlTruncated ? '\n…（省略）' : ''}
              </pre>
            ) : null}
          </div>
        </details>
      )}
    </article>
  );
}

function NotamSection({
  title,
  items,
  variant,
  map,
  highlightedIds,
  onToggleHighlight,
}: {
  title: string;
  items: SwimNotamItem[];
  variant: 'current' | 'future';
  map: L.Map | null;
  highlightedIds: ReadonlySet<string>;
  onToggleHighlight: Props['onToggleHighlight'];
}) {
  if (items.length === 0) {
    return <p className="px-3 text-xs text-gray-500">{title}：該当なし</p>;
  }

  const body = (
    <div className="space-y-2 px-3 pb-2">
      {items.map((item) => (
        <NotamCard
          key={`${variant}-${item.key}`}
          item={item}
          variant={variant}
          map={map}
          highlighted={highlightedIds.has(`${variant}:${item.key}`)}
          onToggleHighlight={onToggleHighlight}
        />
      ))}
    </div>
  );

  if (variant === 'future') {
    return (
      <details className="pb-2">
        <summary className="cursor-pointer select-none px-3 py-1 text-xs font-semibold text-yellow-200/90 hover:text-yellow-100">
          {title}（{items.length}件）
        </summary>
        {body}
      </details>
    );
  }

  return (
    <section className="pb-2">
      <h3 className="px-3 py-1 text-xs font-semibold text-hud-warning">
        {title}（{items.length}件）
      </h3>
      {body}
    </section>
  );
}

export const NotamSheetBody: React.FC<Props> = ({
  map,
  current,
  future,
  loading,
  error,
  disclaimer,
  snap,
  highlightedIds,
  onToggleHighlight,
}) => {
  if (snap === 'peek') {
    const first = current[0] ?? future[0];
    if (!first) {
      return (
        <div className="px-3 pb-2 text-xs text-gray-400">
          {loading ? '読み込み中…' : error ?? 'NOTAM 該当なし'}
        </div>
      );
    }
    const card = buildNotamCardView(first);
    return (
      <div className="px-3 pb-2 text-xs text-gray-200">
        <span className="text-hud-warning">{card.categoryLabel}</span>
        {' · '}
        {card.cardTitle}
      </div>
    );
  }

  if (loading) {
    return <p className="px-3 py-4 text-sm text-gray-400">NOTAM を読み込み中…</p>;
  }

  if (error) {
    return <p className="px-3 py-4 text-sm text-red-300">{error}</p>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y">
      {disclaimer ? (
        <p className="border-b border-whiskyPapa-yellow/10 px-3 py-2 text-[10px] leading-snug text-gray-500">
          {disclaimer}
        </p>
      ) : null}
      <NotamSection
        title="現在有效"
        items={current}
        variant="current"
        map={map}
        highlightedIds={highlightedIds}
        onToggleHighlight={onToggleHighlight}
      />
      <NotamSection
        title="将来有效"
        items={future}
        variant="future"
        map={map}
        highlightedIds={highlightedIds}
        onToggleHighlight={onToggleHighlight}
      />
      {current.length === 0 && future.length === 0 ? (
        <p className="px-3 py-4 text-sm text-gray-400">この検索条件では NOTAM が見つかりませんでした。</p>
      ) : null}
    </div>
  );
};

export function useNotamMapHighlight(map: L.Map | null) {
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(() => new Set());

  const onToggleHighlight = useCallback(
    (id: string, geometry: GeoJsonObject | undefined, variant: 'current' | 'future') => {
      if (!map || !geometry) return;
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          removeSwimNotamGeometry(map, id);
        } else {
          next.add(id);
          addSwimNotamGeometry(map, id, geometry, variant);
          fitSwimNotamMapOverlay(map);
        }
        return next;
      });
    },
    [map],
  );

  const showAllCurrent = useCallback(
    (items: SwimNotamItem[]) => {
      if (!map) return;
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        for (const item of items) {
          if (!item.geometry) continue;
          const id = `current:${item.key}`;
          next.add(id);
          addSwimNotamGeometry(map, id, item.geometry as GeoJsonObject, 'current');
        }
        fitSwimNotamMapOverlay(map);
        return next;
      });
    },
    [map],
  );

  const clearAllHighlights = useCallback((mapRef: L.Map | null) => {
    if (!mapRef) return;
    setHighlightedIds((prev) => {
      for (const id of prev) {
        removeSwimNotamGeometry(mapRef, id);
      }
      return new Set();
    });
  }, []);

  const resetHighlights = useCallback(() => {
    setHighlightedIds(new Set());
  }, []);

  return {
    highlightedIds,
    onToggleHighlight,
    showAllCurrent,
    clearAllHighlights,
    resetHighlights,
  };
}
