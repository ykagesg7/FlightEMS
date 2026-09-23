import React, { Suspense, useCallback, useState, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  parsePlanningMode,
  trackPlanningModeView,
  type PlanningMode,
} from '../../lib/planningAnalytics';
import { ArrowLeft } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { WeatherCacheProvider } from '../../contexts/WeatherCacheContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUrgentRouterView } from '../../layouts/useUrgentRouterView';
import { FlightPlan } from '../../types/index';
import { importWithChunkRetry } from '../../utils/lazyWithRetry';
import type { FlightTrack } from './tracks/types';
import { DebriefPanel } from './components/debrief/DebriefPanel';
import PlanningTab from './components/flight/PlanningTab';
import { PlanningModeSegment } from './components/PlanningModeSegment';
import { PlanningNotamSheetProvider } from './components/map/PlanningNotamSheetProvider';
import { createInitialFlightPlan } from './createInitialFlightPlan';
import {
  clearFlightPlanDraft,
  loadFlightPlanDraft,
  persistFlightPlanDraft,
} from './flightPlanDraft';

import type { MapTabProps } from './components/map/MapTab';

/** Leaflet 込みの地図は別チャンク（iOS の巨大 module 失敗を緩和） */
const MapTab = lazy(() =>
  importWithChunkRetry(async () => {
    const mod = await import('./components/map/MapTab');
    return { default: mod.default as React.ComponentType };
  })
) as React.LazyExoticComponent<React.FC<MapTabProps>>;

function MapTabFallback() {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-gray-400" role="status">
      地図を読み込み中…
    </div>
  );
}

interface PlanningMapPageInnerProps {
  mode: PlanningMode;
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  tracks: FlightTrack[];
  setTracks: React.Dispatch<React.SetStateAction<FlightTrack[]>>;
  currentTrackTime: number | null;
  setCurrentTrackTime: React.Dispatch<React.SetStateAction<number | null>>;
  onClearLocalDraft: () => void;
  lastSavedAt: Date | null;
}

function PlanningMapPageInner({
  mode,
  flightPlan,
  setFlightPlan,
  tracks,
  setTracks,
  currentTrackTime,
  setCurrentTrackTime,
  onClearLocalDraft,
  lastSavedAt,
}: PlanningMapPageInnerProps) {
  const isXl = useMediaQuery('(min-width: 1280px)');
  const [mobileTab, setMobileTab] = useState<'content' | 'map'>('content');
  const focusMapTab = useCallback(() => {
    if (!isXl) setMobileTab('map');
  }, [isXl]);

  const mapProps = {
    layout: 'split' as const,
    flightPlan,
    setFlightPlan,
    tracks,
    currentTrackTime,
    planningMode: mode,
  };

  const leftPanelContent =
    mode === 'debrief' ? (
      <>
        <h2 className="mb-3 text-lg font-semibold text-whiskyPapa-yellow">振り返り / 航跡</h2>
        <DebriefPanel
          flightPlan={flightPlan}
          tracks={tracks}
          setTracks={setTracks}
          currentTime={currentTrackTime}
          setCurrentTime={setCurrentTrackTime}
        />
      </>
    ) : (
      <PlanningTab
        layout="split"
        mode={mode}
        flightPlan={flightPlan}
        setFlightPlan={setFlightPlan}
        tracks={tracks}
        setTracks={setTracks}
        currentTrackTime={currentTrackTime}
        setCurrentTrackTime={setCurrentTrackTime}
        onClearLocalDraft={onClearLocalDraft}
        lastSavedAt={lastSavedAt}
      />
    );

  if (isXl) {
    return (
      <PlanningNotamSheetProvider>
        <div className="min-h-screen flex flex-col relative bg-whiskyPapa-black text-white">
          <div className="px-4 pt-4 pb-2 shrink-0">
            <Link
              to="/mission"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Mission Dashboardへ戻る
            </Link>
          </div>
          <div className="mb-2 flex-1 grid grid-cols-[minmax(28rem,1.05fr)_minmax(0,1fr)] gap-0 items-stretch min-h-[calc(100vh-5rem)] min-w-0">
            <div className="overflow-y-auto overflow-x-hidden border-r border-whiskyPapa-yellow/20 p-2 sm:p-4 md:p-6 min-h-0 min-w-0">
              <div className="mb-4">
                <PlanningModeSegment />
              </div>
              {leftPanelContent}
            </div>
            <div className="h-full min-h-[calc(100vh-5rem)] min-w-0">
              <Suspense fallback={<MapTabFallback />}>
                <MapTab {...mapProps} />
              </Suspense>
            </div>
          </div>
        </div>
      </PlanningNotamSheetProvider>
    );
  }

  return (
    <PlanningNotamSheetProvider onFocusMapTab={focusMapTab}>
      <div className="min-h-screen flex flex-col relative bg-whiskyPapa-black text-white">
        <div className="px-4 pt-4 pb-2">
          <Link
            to="/mission"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mission Dashboardへ戻る
          </Link>
        </div>

        <div className="px-4 pb-2">
          <PlanningModeSegment />
        </div>

        <div className="mb-2">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as 'content' | 'map')}>
            <TabsList className="bg-transparent border-b border-whiskyPapa-yellow/20 w-full flex">
              <TabsTrigger value="content" className="flex-1 text-gray-400 data-[state=active]:text-whiskyPapa-yellow data-[state=active]:bg-whiskyPapa-black-dark">
                内容
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1 text-gray-400 data-[state=active]:text-whiskyPapa-yellow data-[state=active]:bg-whiskyPapa-black-dark">
                地図
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-0">
              <div className="p-2 sm:p-4 md:p-6 container mx-auto">
                {mode === 'debrief' ? (
                  <>
                    <h2 className="mb-3 text-lg font-semibold text-whiskyPapa-yellow">振り返り / 航跡</h2>
                    <DebriefPanel
                      flightPlan={flightPlan}
                      tracks={tracks}
                      setTracks={setTracks}
                      currentTime={currentTrackTime}
                      setCurrentTime={setCurrentTrackTime}
                    />
                  </>
                ) : (
                  <PlanningTab
                    flightPlan={flightPlan}
                    setFlightPlan={setFlightPlan}
                    tracks={tracks}
                    setTracks={setTracks}
                    currentTrackTime={currentTrackTime}
                    setCurrentTrackTime={setCurrentTrackTime}
                    onClearLocalDraft={onClearLocalDraft}
                    lastSavedAt={lastSavedAt}
                    mode={mode}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              <div className="h-full">
                <Suspense fallback={<MapTabFallback />}>
                  <MapTab
                    flightPlan={flightPlan}
                    setFlightPlan={setFlightPlan}
                    tracks={tracks}
                    currentTrackTime={currentTrackTime}
                    planningMode={mode}
                  />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PlanningNotamSheetProvider>
  );
}

function PlanningMapPage() {
  const { leaving } = useUrgentRouterView();
  const [searchParams] = useSearchParams();
  const mode = parsePlanningMode(searchParams.get('mode'));
  const [flightPlan, setFlightPlan] = React.useState<FlightPlan>(() => {
    const draft = loadFlightPlanDraft();
    return draft ?? createInitialFlightPlan();
  });
  const [tracks, setTracks] = React.useState<FlightTrack[]>([]);
  const [currentTrackTime, setCurrentTrackTime] = React.useState<number | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  const debouncedPersistDraft = useDebouncedCallback((plan: FlightPlan) => {
    if (persistFlightPlanDraft(plan)) {
      setLastSavedAt(new Date());
    }
  }, 400);

  React.useEffect(() => {
    debouncedPersistDraft(flightPlan);
  }, [flightPlan, debouncedPersistDraft]);

  React.useEffect(() => {
    trackPlanningModeView(mode);
  }, [mode]);

  const handleClearLocalDraft = React.useCallback(() => {
    clearFlightPlanDraft();
    setFlightPlan(createInitialFlightPlan());
  }, []);

  if (leaving) {
    return null;
  }

  return (
    <WeatherCacheProvider>
      <PlanningMapPageInner
        mode={mode}
        flightPlan={flightPlan}
        setFlightPlan={setFlightPlan}
        tracks={tracks}
        setTracks={setTracks}
        currentTrackTime={currentTrackTime}
        setCurrentTrackTime={setCurrentTrackTime}
        onClearLocalDraft={handleClearLocalDraft}
        lastSavedAt={lastSavedAt}
      />
    </WeatherCacheProvider>
  );
}

export default PlanningMapPage;
