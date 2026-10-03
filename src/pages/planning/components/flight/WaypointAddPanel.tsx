import React, { useRef, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import {
  FlightPlan,
  NavaidOption,
  Waypoint,
  WaypointOption,
} from '../../../../types/index';
import { calculateDistance, decimalToDMS } from '../../../../utils';
import { calculateMagneticBearing } from '../../../../utils/magneticBearing';
import { asSelectStyles } from '../../../../utils/reactSelectStyles';
import { buildWaypointFromNavaid } from '../../utils/buildWaypointFromNavaid';
import type { UserSavedWaypoint, UserSavedWaypointInput } from '../../userWaypoints/types';
import {
  isSavedWaypointOptionValue,
  parseSavedWaypointIdFromOptionValue,
  savedWaypointOptionValue,
} from '../../userWaypoints/mergeWaypointSearchOptions';
import WaypointForm, { WaypointCoordinateFormHandle } from './WaypointForm';

type AddMode = 'navaid' | 'waypoint' | 'coordinates' | 'saved';

interface WaypointAddPanelProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  navaidOptions: NavaidOption[];
  waypointOptions: WaypointOption[];
  userSavedWaypoints?: UserSavedWaypoint[];
  isAuthenticated?: boolean;
  userSavedError?: string | null;
  onSaveUserPoint?: (input: UserSavedWaypointInput) => Promise<{ error: string | null }>;
  onDeleteUserSaved?: (id: string) => Promise<{ ok: boolean; error: string | null }>;
  onRenameUserSaved?: (id: string, name: string) => Promise<{ ok: boolean; error: string | null }>;
}

const tabBtn = (active: boolean) =>
  [
    'min-h-[44px] px-3 rounded-md border text-xs sm:text-sm font-medium transition-colors',
    active
      ? 'bg-whiskyPapa-yellow/25 border-whiskyPapa-yellow/60 text-white'
      : 'border-whiskyPapa-yellow/20 text-gray-400 hover:bg-whiskyPapa-yellow/10',
  ].join(' ');

const WaypointAddPanel: React.FC<WaypointAddPanelProps> = ({
  flightPlan,
  setFlightPlan,
  navaidOptions,
  waypointOptions,
  userSavedWaypoints = [],
  isAuthenticated = false,
  userSavedError,
  onSaveUserPoint,
  onDeleteUserSaved,
  onRenameUserSaved,
}) => {
  const [mode, setMode] = useState<AddMode>('navaid');
  const [coordDisplayName, setCoordDisplayName] = useState('');
  const [saveAsUserPoint, setSaveAsUserPoint] = useState(false);
  const [selectedNavaid, setSelectedNavaid] = useState<NavaidOption | null>(null);
  const [navaidBearing, setNavaidBearing] = useState('');
  const [navaidDistance, setNavaidDistance] = useState('');
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointOption | null>(null);
  const [panelError, setPanelError] = useState('');
  const coordFormRef = useRef<WaypointCoordinateFormHandle>(null);

  const handleAddWaypoint = (waypoint: Waypoint) => {
    setFlightPlan((prev) => ({ ...prev, waypoints: [...prev.waypoints, waypoint] }));
  };

  const handlePanelAdd = () => {
    setPanelError('');
    if (mode === 'navaid') {
      if (!selectedNavaid) {
        setPanelError('NAVAID を選択してください');
        return;
      }
      const result = buildWaypointFromNavaid(selectedNavaid, navaidBearing, navaidDistance);
      if (!result.ok) {
        setPanelError(result.error);
        return;
      }
      handleAddWaypoint(result.waypoint);
      setNavaidBearing('');
      setNavaidDistance('');
      return;
    }

    if (mode === 'waypoint') {
      if (!selectedWaypoint) {
        setPanelError('Waypoint を選択してください');
        return;
      }
      const savedId = isSavedWaypointOptionValue(selectedWaypoint.value)
        ? parseSavedWaypointIdFromOptionValue(selectedWaypoint.value)
        : null;
      const waypoint: Waypoint = {
        id: savedId ? savedWaypointOptionValue(savedId) : selectedWaypoint.value,
        name: selectedWaypoint.name,
        type: savedId ? 'custom' : 'waypoint',
        sourceId: savedId ?? selectedWaypoint.value,
        coordinates: [selectedWaypoint.longitude, selectedWaypoint.latitude],
        latitude: selectedWaypoint.latitude,
        longitude: selectedWaypoint.longitude,
        nameEditable: true,
        metadata: {
          baseNavaid: selectedWaypoint.name,
          baseLatitude: selectedWaypoint.latitude,
          baseLongitude: selectedWaypoint.longitude,
        },
      };
      handleAddWaypoint(waypoint);
      return;
    }

    const built = coordFormRef.current?.tryBuildWaypoint();
    if (built) {
      handleAddWaypoint(built);
      if (saveAsUserPoint && onSaveUserPoint) {
        void onSaveUserPoint({
          name: built.name,
          latitude: built.latitude,
          longitude: built.longitude,
        }).then((res) => {
          if (res.error) setPanelError(res.error);
        });
      }
      setCoordDisplayName('');
      setSaveAsUserPoint(false);
    }
  };

  const handleNavaidChange = (newValue: SingleValue<NavaidOption>) => {
    setSelectedNavaid(newValue);
  };

  const handleWaypointChange = (newValue: SingleValue<WaypointOption>) => {
    setSelectedWaypoint(newValue);
  };

  const calculateFromPrevious = () => {
    if (!selectedWaypoint) return null;
    let prevPoint: { latitude: number; longitude: number } | null = null;
    if (flightPlan.waypoints.length > 0) {
      const lastWp = flightPlan.waypoints[flightPlan.waypoints.length - 1];
      prevPoint = { latitude: lastWp.latitude, longitude: lastWp.longitude };
    } else if (flightPlan.departure) {
      prevPoint = {
        latitude: flightPlan.departure.latitude,
        longitude: flightPlan.departure.longitude,
      };
    }
    if (!prevPoint) return null;
    const distance = calculateDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      selectedWaypoint.latitude,
      selectedWaypoint.longitude
    );
    const bearing = calculateMagneticBearing(
      prevPoint.latitude,
      prevPoint.longitude,
      selectedWaypoint.latitude,
      selectedWaypoint.longitude
    );
    return { distance, bearing };
  };

  const calculateToNext = () => {
    if (!selectedWaypoint || !flightPlan.arrival) return null;
    const distance = calculateDistance(
      selectedWaypoint.latitude,
      selectedWaypoint.longitude,
      flightPlan.arrival.latitude,
      flightPlan.arrival.longitude
    );
    const bearing = calculateMagneticBearing(
      selectedWaypoint.latitude,
      selectedWaypoint.longitude,
      flightPlan.arrival.latitude,
      flightPlan.arrival.longitude
    );
    return { distance, bearing };
  };

  const fromPrevious = calculateFromPrevious();
  const toNext = calculateToNext();
  const dms = selectedWaypoint ? decimalToDMS(selectedWaypoint.latitude, selectedWaypoint.longitude) : null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
      <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">ウェイポイントを追加</h3>
      <p className="text-2xs text-gray-500 mb-3">
        モードを選び、入力後に「ルートに追加」を押してください。計画タブの座標モードではキーボードで座標を入力できます。
      </p>

      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="追加モード">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'navaid'}
          className={tabBtn(mode === 'navaid')}
          onClick={() => {
            setMode('navaid');
            setPanelError('');
          }}
        >
          NAVAID
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'waypoint'}
          className={tabBtn(mode === 'waypoint')}
          onClick={() => {
            setMode('waypoint');
            setPanelError('');
          }}
        >
          公開 Waypoint
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'coordinates'}
          className={tabBtn(mode === 'coordinates')}
          onClick={() => {
            setMode('coordinates');
            setPanelError('');
          }}
        >
          座標
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'saved'}
          className={tabBtn(mode === 'saved')}
          onClick={() => {
            setMode('saved');
            setPanelError('');
          }}
        >
          マイポイント
        </button>
      </div>

      {mode === 'navaid' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">NAVAID選択</label>
            <Select<NavaidOption>
              options={navaidOptions}
              value={selectedNavaid}
              onChange={handleNavaidChange}
              placeholder="NAVAID を選択"
              isClearable
              styles={asSelectStyles<NavaidOption>()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">磁方位(°)</label>
              <input
                type="number"
                value={navaidBearing}
                onChange={(e) => setNavaidBearing(e.target.value)}
                placeholder="0–360"
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 px-3 py-2 min-h-[44px]"
                min={0}
                max={360}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">距離(nm)</label>
              <input
                type="number"
                value={navaidDistance}
                onChange={(e) => setNavaidDistance(e.target.value)}
                placeholder="例: 10"
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 px-3 py-2 min-h-[44px]"
                min={0}
              />
            </div>
          </div>
        </div>
      )}

      {mode === 'waypoint' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Waypoint選択</label>
            <Select<WaypointOption>
              options={waypointOptions}
              value={selectedWaypoint}
              onChange={handleWaypointChange}
              placeholder="Waypoint を選択"
              isClearable
              styles={asSelectStyles<WaypointOption>()}
            />
          </div>
          {selectedWaypoint && (
            <div className="p-3 rounded-md bg-gray-800 border border-gray-600 text-sm space-y-2">
              <div className="font-semibold text-gray-200">
                {selectedWaypoint.value} - {selectedWaypoint.name}
              </div>
              <div className="text-gray-400">タイプ: {selectedWaypoint.type}</div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-gray-300 font-medium mb-1">座標</div>
                <div className="text-gray-400">緯度: {dms?.latDMS}</div>
                <div className="text-gray-400">経度: {dms?.lonDMS}</div>
              </div>
              {fromPrevious && (
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-gray-300 font-medium mb-1">前のポイントから</div>
                  <div className="text-gray-400">磁方位: {fromPrevious.bearing.toFixed(1)}°</div>
                  <div className="text-gray-400">距離: {fromPrevious.distance.toFixed(1)} nm</div>
                </div>
              )}
              {toNext && (
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-gray-300 font-medium mb-1">到着地まで</div>
                  <div className="text-gray-400">磁方位: {toNext.bearing.toFixed(1)}°</div>
                  <div className="text-gray-400">距離: {toNext.distance.toFixed(1)} nm</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'coordinates' && (
        <WaypointForm
          ref={coordFormRef}
          flightPlan={flightPlan}
          embedded
          hideSubmitButton
          displayName={coordDisplayName}
          onDisplayNameChange={setCoordDisplayName}
          saveAsUserPoint={saveAsUserPoint}
          onSaveAsUserPointChange={setSaveAsUserPoint}
          showUserPointSaveOption={isAuthenticated}
        />
      )}

      {mode === 'saved' && (
        <div className="space-y-2">
          {!isAuthenticated ? (
            <p className="text-sm text-gray-400">ログインするとマイポイントを保存・呼び出しできます。</p>
          ) : null}
          {userSavedError ? <p className="text-xs text-amber-300">{userSavedError}</p> : null}
          {userSavedWaypoints.length === 0 ? (
            <p className="text-sm text-gray-500">保存済みポイントはありません。座標タブで追加し「マイポイントとして保存」をオンにしてください。</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {userSavedWaypoints.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-600 bg-gray-800/80 px-2 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-100">{row.name}</div>
                    <div className="text-xs text-gray-400">
                      {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                      {row.ident ? ` · ${row.ident}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="min-h-[36px] rounded border border-whiskyPapa-yellow/40 px-2 text-xs text-whiskyPapa-yellow"
                      onClick={() => {
                        handleAddWaypoint({
                          id: savedWaypointOptionValue(row.id),
                          name: row.name,
                          type: 'custom',
                          sourceId: row.id,
                          coordinates: [row.longitude, row.latitude],
                          latitude: row.latitude,
                          longitude: row.longitude,
                          nameEditable: true,
                        });
                      }}
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      className="min-h-[36px] rounded border border-gray-500 px-2 text-xs text-gray-300"
                      onClick={() => {
                        const next = window.prompt('表示名を変更', row.name);
                        if (next?.trim() && onRenameUserSaved) {
                          void onRenameUserSaved(row.id, next.trim());
                        }
                      }}
                    >
                      名前
                    </button>
                    <button
                      type="button"
                      className="min-h-[36px] rounded border border-red-500/50 px-2 text-xs text-red-300"
                      onClick={() => {
                        if (onDeleteUserSaved && window.confirm(`「${row.name}」を削除しますか？`)) {
                          void onDeleteUserSaved(row.id);
                        }
                      }}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {panelError ? <p className="mt-2 text-sm text-red-400">{panelError}</p> : null}

      {mode !== 'saved' ? (
      <button
        type="button"
        onClick={handlePanelAdd}
        className="mt-4 w-full min-h-[44px] bg-whiskyPapa-yellow/30 hover:bg-whiskyPapa-yellow/40 text-white font-medium py-2 px-4 rounded border border-whiskyPapa-yellow/50 focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
      >
        ルートに追加
      </button>
      ) : null}
    </div>
  );
};

export default WaypointAddPanel;
