import { Dialog, Transition } from '@headlessui/react';
import L from 'leaflet';
import 'leaflet-groupedlayercontrol';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import { FlightPlan } from '../../../../types/index';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatDMS } from '../../../../utils';
import type { FlightTrack } from '../../tracks/types';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';
import React, { Fragment, useCallback, useState } from 'react';
import type { WindGridMapOverlayModel } from './hooks/usePlanningMapWindGrid';
import { WindGridLegendPanel } from './WindGridLegendPanel';
import { WindGridOverlaySetterContext } from './windGridOverlayContext';
import { useCursorNearestNavaids } from './hooks/useCursorNearestNavaids';
import { useMapCursorPosition } from './hooks/useMapCursorPosition';
import { useMapDoubleClickWaypoint } from './hooks/useMapDoubleClickWaypoint';
import { useNavaidGeojson } from './hooks/useNavaidGeojson';
import { useRegionsIndex } from './hooks/useRegionsIndex';
import { MapTabContent } from './MapTabContent';
import './mapStyles.css';

const MAP_DBLCLICK_HINT_DISMISSED_KEY = 'planning-map-dblclick-hint-dismissed';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapTabProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  tracks: FlightTrack[];
  currentTrackTime: number | null;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan, setFlightPlan, tracks, currentTrackTime }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [windGridLegend, setWindGridLegend] = useState<WindGridMapOverlayModel | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
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

  const regions = useRegionsIndex();
  const navaidData = useNavaidGeojson();
  useMapDoubleClickWaypoint(map, setFlightPlan);
  const cursorPosition = useMapCursorPosition(map);
  const navaidInfos = useCursorNearestNavaids(cursorPosition, navaidData);

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-[color:var(--bg)] rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div
        className="shrink-0 z-[10000] flex flex-wrap items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-whiskyPapa-black-dark/95 border-b border-whiskyPapa-yellow/30"
        role="region"
        aria-label="地図ツールバー"
      >
        {hintVisible ? (
          <span className="flex-1 min-w-[200px] text-2xs sm:text-xs text-gray-200 pt-0.5" role="status">
            地図上を<strong className="text-whiskyPapa-yellow font-medium">ダブルクリック</strong>
            すると、その位置にウェイポイントを追加できます。
          </span>
        ) : (
          <span className="flex-1 min-w-[120px]" />
        )}
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="shrink-0 min-h-[44px] rounded px-3 text-2xs sm:text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 border border-whiskyPapa-yellow/40"
        >
          地図の使い方
        </button>
        {hintVisible ? (
          <button
            type="button"
            onClick={dismissHint}
            className="shrink-0 min-h-[44px] rounded px-3 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 border border-whiskyPapa-yellow/40 text-2xs sm:text-xs"
            aria-label="ヒントを閉じる"
          >
            閉じる
          </button>
        ) : null}
      </div>

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
                      左上のレイヤーコントロールで、ベース地図や空域などの表示を切り替えられます。オーバーレイ
                      <strong className="text-gray-200">「航空機（参考・OpenSky）」</strong>
                      は日本域に限定した OpenSky Network の公開データによる参考位置です。マーカーは上視の航空機シルエット画像（機首が真方位の進行方向、欠損時は北向き）。地上機はグレースケール表示です。欠損・遅延があり、実運航・航空交通管制には使用できません。
                    </li>
                    <li>
                      <strong className="text-gray-200">「降水レーダー（参考・RainViewer）」</strong>
                      は RainViewer の合成レーダータイルです。ズームは概ねレベル 7 までが実解像（それ以上は拡大表示）。データ欠損・提供元の都合で表示されない場合があります。地図の帰属に RainViewer のクレジットが含まれます。実運航・管制用ではありません。
                    </li>
                    <li>
                      <strong className="text-gray-200">「上層風バーブ」</strong>
                      は Open-Meteo の数値予報風（日本域∩表示域・既定 300 hPa）を粗い格子で取得し、各点に矢印（
                      <strong className="text-gray-200">流れの向き</strong>
                      ）と風速（kt）を表示します（移動・ズーム後はデバウンス・キャッシュ）。アニメによる負荷を避けるため粒子表示はありません。左下パネルに FL・代表風・予報参照（UTC/JST）を簡潔に表示します。非商用・参考のみ。計画タブの風反映オプションは磁方位と真風向未補正。
                    </li>
                    <li>NAVAID 等のポップアップからルートへの追加ができる場合があります（表示される操作に従ってください）。</li>
                    <li>地図上をダブルクリックすると、その位置にウェイポイントを追加できます。</li>
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
        <div className="relative flex-1 min-h-0">
          <MapContainer
            center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
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
            />
          </MapContainer>
          <div className="absolute bottom-2 left-2 z-[9999] flex max-w-[min(100%,22rem)] flex-col gap-2 pointer-events-none items-stretch">
            <WindGridLegendPanel model={windGridLegend} />
            <div className="hud-overlay-panel text-[color:var(--text-primary)] px-2 py-1 rounded">
              {cursorPosition ? (
                <div className="text-xs sm:text-sm space-y-0.5">
                  <div className="text-2xs sm:text-xs hud-text hud-readout">{formatDMS(cursorPosition.lat, cursorPosition.lng)}</div>
                  <div className="text-2xs sm:text-xs">
                    位置(Degree)： {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E
                  </div>
                  {navaidInfos.map((info, index) => (
                    <div key={index} className="text-2xs sm:text-xs break-words">
                      位置(from Navaid{index + 1})：{' '}
                      <span className="hud-text hud-readout">
                        {Math.round(info.bearing)}°/{info.distance}nm
                      </span>{' '}
                      {info.id}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs sm:text-sm">位置(DMS/ DD)：--</span>
              )}
            </div>
          </div>
        </div>
      </WindGridOverlaySetterContext.Provider>
    </div>
  );
};

export default MapTab;
