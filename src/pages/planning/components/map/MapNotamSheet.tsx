import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { buildNotamPeekSummary } from './notamDisplayUtils';
import { usePlanningNotamFetch } from './hooks/usePlanningNotamFetch';
import { NotamSheetBody, useNotamMapHighlight } from './NotamSheetBody';
import type { NotamSheetRequest } from './planningNotamSheetContext';
import { useSnapSheet } from './hooks/useSnapSheet';
import { cycleSnap, type SnapPoint } from './snapSheetUtils';
import { clearSwimNotamMapOverlay } from './popups/swimNotamMapOverlay';

type Props = {
  map: L.Map | null;
  request: NotamSheetRequest;
  onClose: () => void;
  onSheetHeightChange: (heightPx: number) => void;
};

export const MapNotamSheet: React.FC<Props> = ({
  map,
  request,
  onClose,
  onSheetHeightChange,
}) => {
  const fetchState = usePlanningNotamFetch(request);
  const current = fetchState.data?.ok === true ? fetchState.data.current : [];
  const future = fetchState.data?.ok === true ? fetchState.data.future : [];
  const disclaimer = fetchState.data?.ok === true ? fetchState.data.disclaimer : undefined;
  const hitCount = current.length + future.length;
  const selectionKey = `${request.kind}:${request.code}:${hitCount}:${fetchState.loading}`;

  const userAdjustedSnap = useRef(false);
  const { snap, setSnap, heights, sheetHeightPx, onDragEnd } = useSnapSheet(
    true,
    Math.max(hitCount, 1),
    selectionKey,
    userAdjustedSnap,
  );

  const {
    highlightedIds,
    onToggleHighlight,
    showAllCurrent,
    resetHighlights,
  } = useNotamMapHighlight(map);

  const [dragOffset, setDragOffset] = useState(0);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const keywordSearch = request.kind === 'keyword';
  const peekSummary = useMemo(
    () => buildNotamPeekSummary(request.code, current.length, future.length, keywordSearch),
    [request.code, current.length, future.length, keywordSearch],
  );

  const clampHeight = useCallback(
    (height: number) => Math.max(heights.peek, Math.min(heights.full, height)),
    [heights],
  );

  const displayedHeight = clampHeight(sheetHeightPx - dragOffset);

  useEffect(() => {
    onSheetHeightChange(displayedHeight);
  }, [displayedHeight, onSheetHeightChange]);

  useEffect(() => {
    return () => {
      if (map) clearSwimNotamMapOverlay(map);
      resetHighlights();
    };
  }, [map, resetHighlights]);

  const handleClose = useCallback(() => {
    if (map) clearSwimNotamMapOverlay(map);
    resetHighlights();
    onClose();
  }, [map, onClose, resetHighlights]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const target = e.target;
        if (target instanceof HTMLElement && target.closest('.map-notam-sheet')) {
          e.preventDefault();
          userAdjustedSnap.current = true;
          setSnap(cycleSnap(snap, e.key === 'ArrowUp' ? 'up' : 'down'));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose, setSnap, snap]);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    userAdjustedSnap.current = true;
    onDragEnd(clampHeight(sheetHeightPx - info.offset.y));
    setDragOffset(0);
  };

  const handleHandleDoubleClick = () => {
    if (isDesktop) return;
    userAdjustedSnap.current = true;
    const next: SnapPoint = snap === 'peek' ? 'half' : snap === 'full' ? 'half' : 'peek';
    setSnap(next);
  };

  const handleExpandMore = () => {
    userAdjustedSnap.current = true;
    if (snap === 'peek') setSnap('half');
    else if (snap === 'half') setSnap('full');
  };

  const handleCollapseStep = () => {
    userAdjustedSnap.current = true;
    if (snap === 'full') setSnap('half');
    else setSnap('peek');
  };

  const handleShowAllCurrent = () => {
    showAllCurrent(current);
  };

  const handleClearMap = () => {
    if (map) clearSwimNotamMapOverlay(map);
    resetHighlights();
  };

  const hasCurrentGeometry = current.some((item) => item.geometry != null);

  return (
    <motion.div
      className="map-notam-sheet map-planning-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-[10003] flex flex-col overflow-hidden rounded-t-xl border-t border-whiskyPapa-yellow/30 hud-overlay-panel shadow-[0_-8px_24px_rgba(0,0,0,0.45)]"
      style={{ height: displayedHeight }}
      role="region"
      aria-label="NOTAM 情報"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
    >
      {!isDesktop ? (
        <motion.div
          className="flex shrink-0 cursor-grab flex-col items-center active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: -(heights.full - heights.peek), bottom: 0 }}
          dragElastic={0.08}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleHandleDoubleClick}
        >
          <div
            className="flex min-h-[36px] w-full items-center justify-center py-1.5"
            aria-label="NOTAM パネルの高さを調整"
            role="button"
            tabIndex={0}
          >
            <span className="h-1 w-10 rounded-full bg-hud-warning/50" />
          </div>
        </motion.div>
      ) : null}

      <div className="flex min-h-[48px] shrink-0 flex-wrap items-center gap-1 border-b border-whiskyPapa-yellow/15 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-100" title={peekSummary}>
          {fetchState.loading ? `${request.code} — NOTAM 読み込み中…` : peekSummary}
        </p>
        {hasCurrentGeometry && !fetchState.loading ? (
          <button
            type="button"
            onClick={handleShowAllCurrent}
            className="hidden shrink-0 rounded border border-hud-warning/40 px-2 py-1 text-[10px] text-hud-warning hover:bg-hud-warning/10 sm:inline-block"
          >
            現在分を地図表示
          </button>
        ) : null}
        {highlightedIds.size > 0 ? (
          <button
            type="button"
            onClick={handleClearMap}
            className="shrink-0 rounded border border-gray-600 px-2 py-1 text-[10px] text-gray-300 hover:border-hud-warning/30 hover:text-hud-warning"
          >
            地図から消す
          </button>
        ) : null}
        <div className="hidden shrink-0 items-center gap-0.5 md:flex">
          {snap !== 'full' ? (
            <button
              type="button"
              onClick={handleExpandMore}
              className="flex min-h-[40px] items-center gap-1 rounded border border-whiskyPapa-yellow/30 px-2 text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
              aria-label="NOTAM を展開"
            >
              <ChevronUp className="h-4 w-4" />
              展開
            </button>
          ) : null}
          {snap !== 'peek' ? (
            <button
              type="button"
              onClick={handleCollapseStep}
              className="flex min-h-[40px] items-center gap-1 rounded border border-gray-600 px-2 text-xs text-gray-300 hover:border-whiskyPapa-yellow/30 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
              aria-label="NOTAM を格納"
            >
              <ChevronDown className="h-4 w-4" />
              格納
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded text-gray-400 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
          aria-label="NOTAM を閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <NotamSheetBody
          map={map}
          current={current}
          future={future}
          loading={fetchState.loading}
          error={fetchState.error}
          disclaimer={disclaimer}
          snap={snap}
          highlightedIds={highlightedIds}
          onToggleHighlight={onToggleHighlight}
        />
      </div>

      <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" aria-hidden />
    </motion.div>
  );
};
