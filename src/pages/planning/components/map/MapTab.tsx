import { Dialog, Transition } from '@headlessui/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import { FlightPlan } from '../../../../types/index';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../../../utils';
import type { FlightTrack } from '../../tracks/types';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import type { WindGridMapOverlayModel } from './hooks/usePlanningMapWindGrid';
import type { LiveTrafficLayerControls } from './hooks/useLiveTrafficLayer';
import type { PlanningMapLayerController } from './hooks/usePlanningMapLayerController';
import { useCloseLayersOnMapClick } from './hooks/useCloseLayersOnMapClick';
import { useMapLayersOpenMapLock } from './hooks/useMapLayersOpenMapLock';
import { WindGridOverlaySetterContext } from './windGridOverlayContext';
import { PlanningMapLayerControllerContext } from './planningMapLayerControllerContext';
import { useCursorSelectedNavaid } from './hooks/useCursorSelectedNavaid';
import { useMapPinnedPosition } from './hooks/useMapPinnedPosition';
import { useMapDoubleClickWaypoint } from './hooks/useMapDoubleClickWaypoint';
import { useNavaidGeojson } from './hooks/useNavaidGeojson';
import { useRegionsIndex } from './hooks/useRegionsIndex';
import { MapCenterCrosshair } from './MapCenterCrosshair';
import { MapCursorDetailSheet } from './MapCursorDetailSheet';
import { MapCursorFooter } from './MapCursorFooter';
import { MapMapOverlays } from './MapMapOverlays';
import { MapLayersPanel } from './MapLayersPanel';
import { MapTabContent } from './MapTabContent';
import { MapToolbar } from './MapToolbar';
import { useClearAirspaceOnMapClick } from './hooks/useClearAirspaceOnMapClick';
import type { AirspaceSelection } from './planningAirspaceTypes';
import { usePlanningNotamSheetOptional } from './planningNotamSheetContext';
import './mapStyles.css';
import type { PlanningPanelLayout } from '../../planningPanelLayout';
import { mapLayersUseInlineSidebar } from '../../planningPanelLayout';

const MAP_DBLCLICK_HINT_DISMISSED_KEY = 'planning-map-dblclick-hint-dismissed';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapTabProps {
  layout?: PlanningPanelLayout;
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  tracks: FlightTrack[];
  currentTrackTime: number | null;
}

const MapTab: React.FC<MapTabProps> = ({
  layout = 'full',
  flightPlan,
  setFlightPlan,
  tracks,
  currentTrackTime,
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [windGridLegend, setWindGridLegend] = useState<WindGridMapOverlayModel | null>(null);
  const [layerController, setLayerController] = useState<PlanningMapLayerController | null>(null);
  const [liveTrafficControls, setLiveTrafficControls] = useState<LiveTrafficLayerControls | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cursorDetailOpen, setCursorDetailOpen] = useState(false);
  const [radialGridStationId, setRadialGridStationId] = useState('AHT');
  const [airspaceSelection, setAirspaceSelection] = useState<AirspaceSelection | null>(null);
  const notamSheet = usePlanningNotamSheetOptional();
  const isXl = useMediaQuery('(min-width: 1280px)');
  const useInlineLayersSidebar = mapLayersUseInlineSidebar(layout, isXl);
  const [hintVisible, setHintVisible] = useState(() => {
    try {
      return localStorage.getItem(MAP_DBLCLICK_HINT_DISMISSED_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const dismissHint = useCallback(() => {
    try {
      localStorage.setItem(MAP_DBLCLICK_HINT_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    setHintVisible(false);
  }, []);

  const closeLayers = useCallback(() => setLayersOpen(false), []);

  const handleAirspaceSelection = useCallback((selection: AirspaceSelection) => {
    notamSheet?.closeNotamSheet();
    setAirspaceSelection(selection);
    setLayersOpen(false);
  }, [notamSheet]);

  useEffect(() => {
    if (notamSheet?.request) {
      setAirspaceSelection(null);
      setLayersOpen(false);
    }
  }, [notamSheet?.request]);

  useEffect(() => {
    notamSheet?.setMapInstance(map);
    return () => notamSheet?.setMapInstance(null);
  }, [map, notamSheet]);

  const clearAirspaceSelection = useCallback(() => {
    setAirspaceSelection(null);
  }, []);

  const handleLayerControllerChange = useCallback((controller: PlanningMapLayerController | null) => {
    setLayerController(controller);
  }, []);

  const handleLiveTrafficControlsChange = useCallback((controls: LiveTrafficLayerControls | null) => {
    setLiveTrafficControls(controls);
  }, []);

  const liveTrafficEnabled = layerController?.enabledOverlayIds.has('opensky_traffic') ?? false;
  const radialGridEnabled = layerController?.enabledOverlayIds.has('navaid_radial_grid') ?? false;

  const regions = useRegionsIndex();
  const navaidData = useNavaidGeojson();
  useMapDoubleClickWaypoint(map, setFlightPlan);
  useCloseLayersOnMapClick(map, layersOpen, closeLayers);
  useClearAirspaceOnMapClick(map, airspaceSelection, clearAirspaceSelection);
  useMapLayersOpenMapLock(map, layersOpen, useInlineLayersSidebar);
  const {
    displayPosition,
    pinnedPosition,
    isPinned,
    isCoarsePointer,
    pinCenter,
    clearPin,
  } = useMapPinnedPosition(map);
  const {
    selectedNavaidId,
    setSelectedNavaidId,
    selectNearest,
    distanceInfo,
    nearestId,
  } = useCursorSelectedNavaid(pinnedPosition, navaidData);

  useEffect(() => {
    if (!isPinned) setCursorDetailOpen(false);
  }, [isPinned]);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg bg-[color:var(--bg)] shadow-sm">
      <PlanningMapLayerControllerContext.Provider value={layerController}>
        <MapToolbar
          hintVisible={hintVisible}
          onDismissHint={dismissHint}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenLayers={() => setLayersOpen((v) => !v)}
          layersOpen={layersOpen}
          liveTrafficEnabled={liveTrafficEnabled}
          liveTrafficControls={liveTrafficControls}
        />

        <Transition appear show={helpOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[10001]" onClose={() => setHelpOpen(false)}>
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
                  <Dialog.Panel className="w-full max-w-lg rounded-lg border border-whiskyPapa-yellow/30 bg-whiskyPapa-black-dark p-5 text-white shadow-xl">
                    <Dialog.Title className="text-lg font-semibold text-whiskyPapa-yellow">地図の使い方</Dialog.Title>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-300">
                      <li>
                        ツールバーの<strong className="text-gray-200">「レイヤー」</strong>
                        ボタンから、ベース地図や空域などの表示を切り替えられます。レイヤーパネル表示中は
                        <strong className="text-gray-200">地図をタップ</strong>
                        するとパネルが閉じます（複数レイヤーの連続操作のため、選択後の自動クローズはありません）。オーバーレイ
                        <strong className="text-gray-200">「航空機（参考・OpenSky）」</strong>
                        は日本域に限定した ADS-B 参考位置（airplanes.live）です。マーカーは上視の航空機シルエット画像（機首が真方位の進行方向、欠損時は北向き）。地上機はグレースケール表示です。レイヤー ON 中は 3 分ごとに自動更新されますが、ツールバーまたはレイヤーパネルの<strong className="text-gray-200">「更新」</strong>ボタンで即時再取得もできます。欠損・遅延があり、実運航・航空交通管制には使用できません。
                      </li>
                      <li>
                        <strong className="text-gray-200">「降水レーダー（参考・RainViewer）」</strong>
                        は RainViewer の合成レーダータイルです。ズームは概ねレベル 7 までが実解像（それ以上は拡大表示）。データ欠損・提供元の都合で表示されない場合があります。地図の帰属に RainViewer のクレジットが含まれます。実運航・管制用ではありません。
                      </li>
                      <li>
                        <strong className="text-gray-200">「上層風バーブ」</strong>
                        は Open-Meteo の数値予報風（日本域∩表示域・既定 300 hPa）を粗い格子で取得し、各点に矢印（
                        <strong className="text-gray-200">流れの向き</strong>
                        ）と風速（kt）を表示します（移動・ズーム後はデバウンス・キャッシュ）。アニメによる負荷を避けるため粒子表示はありません。レイヤーパネル内に FL・代表風・予報参照（UTC/JST）を簡潔に表示します。非商用・参考のみ。計画タブの風反映オプションは磁方位と真風向未補正。
                      </li>
                      <li>
                        地図上の位置は地図下に
                        <strong className="text-gray-200">DMS 1行</strong>
                        で表示されます。マウスでは地図をクリックして位置を固定、タッチ端末では
                        <strong className="text-gray-200">中央クロスヘア</strong>
                        を合わせて「この位置を固定」します。「詳細」を開くと十進度（DD）と、選択した NAVAID からの磁方位・距離が
                        <strong className="text-gray-200">地図上のシート</strong>
                        に表示されます（初期は最寄り NAVAID、検索で任意に変更可）。地図の高さは詳細展開でも変わりません。ACC Sector / RAPCON をタップすると、重なり空域は
                        <strong className="text-gray-200">地図上のドラッグ可能なシート</strong>
                        に一覧表示されます（初期は peek の1行サマリー、モバイルは上フリックまたはドラッグ、デスクトップは「展開」「格納」ボタンで half/full、複数件はアコーディオン）。地図のシート外エリアはパン・ズーム可能です。
                      </li>
                      <li>
                        空港・NAVAID 等のポップアップから
                        <strong className="text-gray-200">「NOTAM を確認」</strong>
                        を選ぶと、地図下のボトムシートにデジタル NOTAM（SWIM）を表示します。現在有效／将来有效を分け、地図で形状を強調できます。参考表示であり、航行判断は SWIM ポータル等の公式ノータムで必ず確認してください。
                      </li>
                      <li>NAVAID 等のポップアップからルートへの追加ができる場合があります（表示される操作に従ってください）。</li>
                      <li>地図上をダブルクリックすると、その位置にウェイポイントを追加できます。</li>
                      <li>
                        レイヤーの
                        <strong className="text-gray-200">「ラジアル／DME網（参考）」</strong>
                        をオンにすると、選択した NAVAID（初期は芦屋 TACAN / AHT）から磁方位 10°・距離 10 nm（最大 100 nm）の網を表示します。方位ラベルは 000/090/180/270 が 10 nm 刻み、その他は 50 nm と 100 nm、DME 距離ラベルは 010/100/190/280 上に 10 nm 刻みです。教育用の固定磁気偏差による参考表示で、実運航・管制用ではありません。
                      </li>
                      <li>
                        レイヤーの
                        <strong className="text-gray-200">「変更予定空域（参考）」</strong>
                        には、今後変更が予定されている空域形状（例: R-134、N-1、N-21S）を参考表示します。現行の制限空域・高高度訓練空域とは別レイヤーです。非公式・参考のみで、実運航・管制用ではありません。
                      </li>
                      <li>
                        キーボードショートカットで地図を操作する機能はありません。座標のキーボード入力は
                        <strong className="text-gray-200"> 計画タブの「座標」モード</strong>
                        で行えます。
                      </li>
                    </ul>
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setHelpOpen(false)}
                        className="min-h-[44px] rounded border border-whiskyPapa-yellow/40 px-4 py-2 text-sm hover:bg-whiskyPapa-yellow/10"
                      >
                        閉じる
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <WindGridOverlaySetterContext.Provider value={setWindGridLegend}>
          <div className="relative flex min-h-0 flex-1">
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="relative min-h-0 flex-1">
                <MapContainer
                  center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
                  zoom={DEFAULT_ZOOM}
                  className="absolute inset-0 h-full w-full"
                  ref={setMap}
                  worldCopyJump={true}
                >
                  <MapTabContent
                    flightPlan={flightPlan}
                    map={map}
                    setFlightPlan={setFlightPlan}
                    regions={regions}
                    tracks={tracks}
                    currentTrackTime={currentTrackTime}
                    onLayerControllerChange={handleLayerControllerChange}
                    onLiveTrafficControlsChange={handleLiveTrafficControlsChange}
                    onAirspaceSelection={handleAirspaceSelection}
                    navaidData={navaidData}
                    radialGridStationId={radialGridStationId}
                  />
                </MapContainer>
                <MapMapOverlays
                  map={map}
                  selection={airspaceSelection}
                  cruiseAltitudeFt={flightPlan.altitude}
                  onClearSelection={clearAirspaceSelection}
                />
                {isCoarsePointer ? <MapCenterCrosshair /> : null}
                {pinnedPosition ? (
                  <MapCursorDetailSheet
                    open={cursorDetailOpen}
                    onClose={() => setCursorDetailOpen(false)}
                    cursorPosition={pinnedPosition}
                    distanceInfo={distanceInfo}
                    navaidData={navaidData}
                    selectedNavaidId={selectedNavaidId}
                    nearestId={nearestId}
                    onSelectNavaidId={setSelectedNavaidId}
                    onSelectNearest={selectNearest}
                  />
                ) : null}
              </div>
              <MapCursorFooter
                cursorPosition={displayPosition}
                isPinned={isPinned}
                isCoarsePointer={isCoarsePointer}
                detailOpen={cursorDetailOpen}
                onToggleDetail={() => setCursorDetailOpen((v) => !v)}
                onPinCenter={pinCenter}
                onClearPin={clearPin}
              />
            </div>
            <MapLayersPanel
              open={layersOpen}
              onClose={closeLayers}
              windGridLegend={windGridLegend}
              liveTrafficControls={liveTrafficControls}
              liveTrafficEnabled={liveTrafficEnabled}
              useInlineSidebar={useInlineLayersSidebar}
              radialGridEnabled={radialGridEnabled}
              radialGridStationId={radialGridStationId}
              onSelectRadialGridStation={setRadialGridStationId}
              navaidData={navaidData}
            />
          </div>
        </WindGridOverlaySetterContext.Provider>
      </PlanningMapLayerControllerContext.Provider>
    </div>
  );
};

export default MapTab;
