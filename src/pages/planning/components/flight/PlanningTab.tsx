import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/DropdownMenu';
import { aircraftPresets, getAircraftPreset } from '../../../../data/aircraftPresets';
import { AircraftPreset, AirportGroupOption, AirportOption, FlightPlan, NavaidOption, WaypointOption } from '../../../../types/index';
import { groupBy } from '../../../../utils';
import { AirspaceDataset, findAirspaceFrequency } from '../../../../utils/airspace';
import { downloadPlanDocument, fromPlanDocument, toPlanDocument } from '../../../../utils/planDocument';
import { persistFlightPlanDraft } from '../../flightPlanDraft';
import { downloadTextFile } from '../../export/download';
import { exportFlightPlanToCsv } from '../../export/exportCsv';
import { exportFlightPlanToGpx } from '../../export/exportGpx';
import { exportFlightPlanToKml } from '../../export/exportKml';
import type { FlightTrack } from '../../tracks/types';
import { applyNavLogToPlan, computeNavLog } from '../../nav/computeNavLog';
import { collectNavPoints, segmentOverrideKey } from '../../nav/navPoints';
import { useRouteWinds } from '../../nav/useRouteWinds';
import { PreflightBriefingPanel } from '../briefing/PreflightBriefingPanel';
import { AircraftPerformancePanel } from './AircraftPerformancePanel';
import FlightParameters from './FlightParameters';
import { FlightSummary } from './FlightSummary';
import { PlanningCard } from './PlanningCard';
import PlanPrintView from './PlanPrintView';
import RoutePlanning from './RoutePlanning';
import {
  planningTabPrintWrapperClass,
  planningTabRootGridClass,
  type PlanningPanelLayout,
} from '../../planningPanelLayout';

interface PlanningTabProps {
  layout?: PlanningPanelLayout;
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  tracks: FlightTrack[];
  setTracks: React.Dispatch<React.SetStateAction<FlightTrack[]>>;
  currentTrackTime: number | null;
  setCurrentTrackTime: React.Dispatch<React.SetStateAction<number | null>>;
  onClearLocalDraft: () => void;
  lastSavedAt?: Date | null;
}

/**
 * Planning Tab コンポーネント
 * フライトプランの入力と計算結果の表示を行うメインコンポーネント
 */
const DRAFT_NOTICE_DISMISS_KEY = 'fa-plan-draft-notice-dismissed-v1';

const PlanningTab: React.FC<PlanningTabProps> = ({
  layout = 'full',
  flightPlan,
  setFlightPlan,
  tracks: _tracks,
  setTracks: _setTracks,
  currentTrackTime: _currentTrackTime,
  setCurrentTrackTime: _setCurrentTrackTime,
  onClearLocalDraft,
  lastSavedAt = null,
}) => {
  const navigate = useNavigate();
  const isSplitLayout = layout === 'split';
  const [airportOptions, setAirportOptions] = React.useState<AirportGroupOption[]>([]);
  const [navaidOptions, setNavaidOptions] = React.useState<NavaidOption[]>([]);
  const [waypointOptions, setWaypointOptions] = React.useState<WaypointOption[]>([]);
  const [airspaceDatasets, setAirspaceDatasets] = React.useState<Array<{ id: string; data: AirspaceDataset | null }>>([
    { id: 'ACC_Sector_High', data: null },
    { id: 'ACC_Sector_Low', data: null },
    { id: 'RAPCON', data: null },
  ]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [printRequested, setPrintRequested] = React.useState(false);
  const [clearDraftOpen, setClearDraftOpen] = useState(false);
  const [draftNoticeVisible, setDraftNoticeVisible] = useState(() => {
    try {
      return sessionStorage.getItem(DRAFT_NOTICE_DISMISS_KEY) !== '1';
    } catch {
      return false;
    }
  });

  const openAirspace3d = () => {
    persistFlightPlanDraft(flightPlan);
    navigate('/explore/airspace-3d');
  };

  const preloadAirspace3d = () => {
    void import('../../../explore/airspace3d/CesiumAirspaceViewer');
  };

  const dismissDraftNotice = () => {
    try {
      sessionStorage.setItem(DRAFT_NOTICE_DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDraftNoticeVisible(false);
  };

  const selectedPreset = getAircraftPreset(flightPlan.aircraftId) || aircraftPresets[0];

  const handleAircraftChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value || undefined;
    const preset = getAircraftPreset(nextId);
    if (preset) {
      setFlightPlan((prev: FlightPlan) => ({
        ...prev,
        aircraftId: preset.id,
        cruiseFuelFlowLbPerHr: preset.cruiseFuelFlowLbPerHr,
        taxiFuelLb: preset.taxiFuelLb,
        reserveFuelLb: preset.reserveFuelLb,
        initialFuelLb: prev.initialFuelLb ?? preset.defaultInitialFuelLb,
        alternateFuelLb: preset.alternateFuelLb,
      }));
    } else {
      setFlightPlan((prev: FlightPlan) => ({ ...prev, aircraftId: undefined }));
    }
  };

  const handleInitialFuelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setFlightPlan((prev: FlightPlan) => ({
      ...prev,
      initialFuelLb: Number.isFinite(value) ? value : prev.initialFuelLb,
    }));
  };

  const handleExport = () => {
    downloadPlanDocument(toPlanDocument(flightPlan));
  };

  const handleExportRouteGpx = () => {
    downloadTextFile(exportFlightPlanToGpx(flightPlan), `flight-route-${Date.now()}.gpx`, 'application/gpx+xml');
  };

  const handleExportRouteKml = () => {
    downloadTextFile(exportFlightPlanToKml(flightPlan), `flight-route-${Date.now()}.kml`, 'application/vnd.google-earth.kml+xml');
  };

  const handleExportRouteCsv = () => {
    downloadTextFile(exportFlightPlanToCsv(flightPlan), `flight-route-${Date.now()}.csv`, 'text/csv');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const imported = fromPlanDocument(json);
      if (imported) {
        setFlightPlan((prev: FlightPlan) => ({
          ...prev,
          ...imported,
        }));
      } else {
        console.error('インポート失敗: スキーマ不一致または内容が無効です');
      }
    } catch (error) {
      console.error('インポート処理に失敗しました', error);
    } finally {
      event.target.value = '';
    }
  };

  const handlePrint = () => {
    setPrintRequested(true);
  };

  // 空港データを取得するuseEffect
  React.useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('/geojson/Airports.geojson');
        const geojsonData = await response.json();
        const airportList = geojsonData.features.map((feature: { properties: { id: string; name1: string; type: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1} (${feature.properties.id})`,
          name: feature.properties.name1,
          type: feature.properties.type as 'civilian' | 'military' | 'joint',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          // GeoJSONのpropertiesを含める
          properties: { ...feature.properties },
        }));

        // 空港タイプでグループ化
        const groupedAirports = Object.entries(groupBy(airportList, 'type')).map(([type, options]) => ({
          label: type,
          options: options as AirportOption[],
        }));
        setAirportOptions(groupedAirports);
      } catch (error) {
        console.error("空港データの読み込みに失敗しました", error);
      }
    };

    // NAVAIDデータを取得するuseEffect
    const fetchNavaids = async () => {
      try {
        const response = await fetch('/geojson/Navaids.geojson');
        const geojsonData = await response.json();
        const navaidList = geojsonData.features.map((feature: { properties: { id: string; name1: string; name2: string; type: string; ch?: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1}(${feature.properties.name2})(${feature.properties.id})`,
          name: feature.properties.name1,
          type: feature.properties.type as 'VOR' | 'TACAN' | 'VORTAC',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          ch: feature.properties.ch,
          frequency: feature.properties.ch,
        }));
        setNavaidOptions(navaidList);
      } catch (error) {
        console.error("Navaidsデータの読み込みに失敗しました", error);
      }
    };

    // Waypointsデータを取得するuseEffect
    const fetchWaypoints = async () => {
      try {
        const response = await fetch('/geojson/Waypoints.json');
        const geojsonData = await response.json();
        const waypointList = geojsonData.features.map((feature: { properties: { id: string; name1: string; type: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.id} - ${feature.properties.name1}`,
          name: feature.properties.name1,
          type: feature.properties.type,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }));
        setWaypointOptions(waypointList);
      } catch (error) {
        console.error("Waypointsデータの読み込みに失敗しました", error);
      }
    };

    fetchAirports();
    fetchNavaids();
    fetchWaypoints();
  }, []);

  // 空域GeoJSONをロード
  React.useEffect(() => {
    const targets: Array<{ id: string; path: string }> = [
      { id: 'ACC_Sector_High', path: '/geojson/ACC_Sector_High.geojson' },
      { id: 'ACC_Sector_Low', path: '/geojson/ACC_Sector_Low.geojson' },
      { id: 'RAPCON', path: '/geojson/RAPCON.geojson' },
    ];

    targets.forEach(async (target) => {
      try {
        const res = await fetch(target.path);
        const data = await res.json();
        setAirspaceDatasets((prev) =>
          prev.map((p) => (p.id === target.id ? { ...p, data } : p))
        );
      } catch (error) {
        console.error(`${target.id} の読み込みに失敗しました`, error);
      }
    });
  }, []);

  const navPoints = React.useMemo(
    () =>
      collectNavPoints({
        departure: flightPlan.departure,
        arrival: flightPlan.arrival,
        waypoints: flightPlan.waypoints,
        groundElevationFt: flightPlan.groundElevationFt,
      }),
    [flightPlan.departure, flightPlan.arrival, flightPlan.waypoints, flightPlan.groundElevationFt],
  );
  const { winds } = useRouteWinds(flightPlan, navPoints);

  const frequencies = React.useMemo(() => {
    return navPoints.slice(0, -1).map((from, i) => {
      const to = navPoints[i + 1];
      const midLat = (from.latitude + to.latitude) / 2;
      const midLon = (from.longitude + to.longitude) / 2;
      const hit = findAirspaceFrequency([midLon, midLat], airspaceDatasets);
      return { frequency: hit?.frequency, frequencySourceId: hit?.sourceId };
    });
  }, [navPoints, airspaceDatasets]);

  const navLog = React.useMemo(
    () =>
      computeNavLog({
        plan: {
          speed: flightPlan.speed,
          altitude: flightPlan.altitude,
          departureTime: flightPlan.departureTime,
          groundTempC: flightPlan.groundTempC,
          groundElevationFt: flightPlan.groundElevationFt,
          segmentOverrides: flightPlan.segmentOverrides,
          aircraftId: flightPlan.aircraftId,
          initialFuelLb: flightPlan.initialFuelLb,
          taxiFuelLb: flightPlan.taxiFuelLb,
          reserveFuelLb: flightPlan.reserveFuelLb,
          cruiseFuelFlowLbPerHr: flightPlan.cruiseFuelFlowLbPerHr,
          alternateFuelLb: flightPlan.alternateFuelLb,
          performanceOverrides: flightPlan.performanceOverrides,
          descentMode: flightPlan.descentMode,
        },
        points: navPoints,
        winds,
        frequencies,
        preset: selectedPreset,
        includeVerticalProfile: true,
      }),
    [
      navPoints,
      winds,
      frequencies,
      selectedPreset,
      flightPlan.speed,
      flightPlan.altitude,
      flightPlan.departureTime,
      flightPlan.groundTempC,
      flightPlan.groundElevationFt,
      flightPlan.segmentOverrides,
      flightPlan.aircraftId,
      flightPlan.initialFuelLb,
      flightPlan.taxiFuelLb,
      flightPlan.reserveFuelLb,
      flightPlan.cruiseFuelFlowLbPerHr,
      flightPlan.alternateFuelLb,
      flightPlan.performanceOverrides,
      flightPlan.descentMode,
    ],
  );

  React.useEffect(() => {
    setFlightPlan((prev) => {
      const next = applyNavLogToPlan(prev, navLog);
      if (
        prev.ete === next.ete &&
        prev.eta === next.eta &&
        prev.totalDistance === next.totalDistance &&
        prev.tas === next.tas &&
        prev.totalFuelUsedLb === next.totalFuelUsedLb &&
        prev.routeSegments.length === next.routeSegments.length &&
        prev.routeSegments.every((s, i) => {
          const n = next.routeSegments[i];
          return s.from === n.from && s.to === n.to && s.eta === n.eta && s.speed === n.speed && s.altitude === n.altitude;
        })
      ) {
        return prev;
      }
      return next;
    });
  }, [navLog, setFlightPlan]);

  const handleSegmentOverrideChange = React.useCallback(
    (from: string, to: string, patch: { casKt?: number; altitudeFt?: number }) => {
      const key = segmentOverrideKey(from, to);
      setFlightPlan((prev) => ({
        ...prev,
        segmentOverrides: {
          ...prev.segmentOverrides,
          [key]: { ...prev.segmentOverrides?.[key], ...patch },
        },
      }));
    },
    [setFlightPlan],
  );

  // 印刷要求があれば、ルートセグメントが揃った後に印刷を開始
  React.useEffect(() => {
    if (!printRequested) return;

    // ルートが未構成でも印刷は可能だが、最低1回描画が走ってから開く
    const ready = Array.isArray(flightPlan.routeSegments);
    if (!ready) return;

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        window.print();
        setPrintRequested(false);
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [printRequested, flightPlan.routeSegments]);

  return (
    <div className={planningTabRootGridClass(layout)}>
      <div className={isSplitLayout ? 'space-y-3 sm:space-y-4 md:space-y-6' : 'lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6'}>
        <PlanningCard title="Setup">
        <div className="flex flex-col gap-3 print-hide">
          {draftNoticeVisible && (
            <div
              className="flex flex-wrap items-start gap-2 rounded-md border border-whiskyPapa-yellow/30 bg-whiskyPapa-black/80 px-3 py-2 text-2xs sm:text-xs text-gray-200"
              role="status"
            >
              <span className="flex-1 min-w-[200px]">
                ブラウザのローカル領域に下書きを自動保存しています（同一端末・同一ブラウザのみ）。
              </span>
              <button
                type="button"
                onClick={dismissDraftNotice}
                className="shrink-0 min-h-[44px] min-w-[44px] px-3 rounded border border-whiskyPapa-yellow/40 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 text-sm"
              >
                閉じる
              </button>
            </div>
          )}
          <div
            className={
              isSplitLayout
                ? 'flex flex-col gap-3'
                : 'flex flex-col lg:flex-row lg:items-end gap-3'
            }
          >
            <div className="flex-1 min-w-0 sm:min-w-[180px]">
              <label className="block text-xs sm:text-sm font-medium text-white mb-1">機体プリセット</label>
              <select
                value={selectedPreset?.id ?? ''}
                onChange={handleAircraftChange}
                className="w-full min-h-[44px] bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
              >
                <option value="">未選択</option>
                {aircraftPresets.map((preset: AircraftPreset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <div className="mt-1 text-2xs text-gray-300">
                巡航FF: {selectedPreset?.cruiseFuelFlowLbPerHr ?? '--'} lb/hr / 予備: {selectedPreset?.reserveFuelLb ?? '--'} lb / タキシー: {selectedPreset?.taxiFuelLb ?? '--'} lb
              </div>
            </div>
            <div className={isSplitLayout ? 'w-full' : 'w-full lg:w-48'}>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1">初期燃料 (lb)</label>
              <input
                type="number"
                value={flightPlan.initialFuelLb ?? selectedPreset?.defaultInitialFuelLb ?? 0}
                onChange={handleInitialFuelChange}
                className="w-full min-h-[44px] bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
              />
            </div>
            <div
              className={
                isSplitLayout
                  ? 'flex flex-wrap items-center gap-2 w-full'
                  : 'flex flex-wrap items-center gap-2 w-full lg:flex-1 lg:justify-end'
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded border border-whiskyPapa-yellow/30 bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    ファイル
                    <span className="text-2xs text-gray-400" aria-hidden>
                      ▼
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6}>
                  <DropdownMenuItem onSelect={() => handleExport()}>JSON を書き出す</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleImportClick()}>JSON を読み込む</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleExportRouteGpx()}>計画ルートを GPX 出力</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleExportRouteKml()}>計画ルートを KML 出力</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleExportRouteCsv()}>計画ルートを CSV 出力</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setClearDraftOpen(true)}
                    className="text-red-300 focus:text-red-200"
                  >
                    下書き消去…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                onClick={handlePrint}
                className="min-h-[44px] inline-flex items-center justify-center px-3 py-2 bg-whiskyPapa-yellow/20 hover:bg-whiskyPapa-yellow/30 text-white text-sm rounded border border-whiskyPapa-yellow/40"
              >
                印刷
              </button>
              {lastSavedAt ? (
                <span className="text-2xs sm:text-xs text-gray-400 whitespace-nowrap self-center">
                  最終保存{' '}
                  {lastSavedAt.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              ) : null}
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
          <FlightParameters layout={layout} flightPlan={flightPlan} setFlightPlan={setFlightPlan} variant="setup" />
          <details className="mt-4 rounded border border-whiskyPapa-yellow/20">
            <summary className="min-h-[44px] cursor-pointer list-none px-3 py-2 text-xs font-medium text-whiskyPapa-yellow sm:text-sm">
              機体性能（上昇・降下・巡航）
            </summary>
            <div className="border-t border-whiskyPapa-yellow/10 p-3">
              <AircraftPerformancePanel
                flightPlan={flightPlan}
                setFlightPlan={setFlightPlan}
                preset={selectedPreset}
              />
            </div>
          </details>
        </div>
        </PlanningCard>

        <Transition appear show={clearDraftOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[300]" onClose={() => setClearDraftOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60" aria-hidden />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md rounded-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark p-5 text-white shadow-xl">
                    <Dialog.Title className="text-lg font-semibold text-whiskyPapa-yellow">
                      下書きを消去しますか？
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-300">
                      計画内容とブラウザに保存した下書きが初期状態に戻ります。この操作は取り消せません。
                    </p>
                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setClearDraftOpen(false)}
                        className="min-h-[44px] min-w-[88px] rounded border border-whiskyPapa-yellow/30 px-4 py-2 text-sm hover:bg-whiskyPapa-yellow/10"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClearLocalDraft();
                          setClearDraftOpen(false);
                        }}
                        className="min-h-[44px] min-w-[88px] rounded border border-red-500/50 bg-red-900/50 px-4 py-2 text-sm text-white hover:bg-red-900/70"
                      >
                        消去
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>

      <div className={isSplitLayout ? 'space-y-3 min-w-0' : 'lg:col-span-3 space-y-3'}>
        <PlanningCard title="Route">
          <FlightParameters layout={layout} flightPlan={flightPlan} setFlightPlan={setFlightPlan} variant="route" />
          <div className="mt-4">
            <RoutePlanning
              layout={layout}
              flightPlan={flightPlan}
              setFlightPlan={setFlightPlan}
              airportOptions={airportOptions}
              navaidOptions={navaidOptions}
              waypointOptions={waypointOptions}
            />
          </div>
        </PlanningCard>
        <PlanningCard title="NavLog">
          <FlightSummary
            layout={layout}
            flightPlan={flightPlan}
            fuelBelowReserve={navLog.fuelBelowReserve}
            aboveServiceCeiling={navLog.aboveServiceCeiling}
            aboveMaxFuel={navLog.aboveMaxFuel}
            onSegmentOverrideChange={handleSegmentOverrideChange}
            onOpenAirspace3d={openAirspace3d}
            onPreloadAirspace3d={preloadAirspace3d}
          />
        </PlanningCard>
        <PlanningCard title="Briefing" defaultOpen={false}>
          <PreflightBriefingPanel flightPlan={flightPlan} layout={layout} embedded />
        </PlanningCard>
      </div>

      {/* 印刷専用ビュー（画面では非表示、印刷時のみ表示） */}
      <div className={planningTabPrintWrapperClass(layout)}>
        <PlanPrintView flightPlan={flightPlan} />
      </div>
    </div>
  );
};

export default PlanningTab;
