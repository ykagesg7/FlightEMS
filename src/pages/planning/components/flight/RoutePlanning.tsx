import React from 'react';
import Select, { SingleValue, type StylesConfig } from 'react-select';
import { AirportGroupOption, AirportOption, FlightPlan, NavaidOption, WaypointOption } from '../../../../types/index';
import { GSI_GEOMAG_2020_META } from '../../../../utils/japanMagneticVariation';
import { MagneticVariationFallbackNotice } from '../MagneticVariationFallbackNotice';
import { useJapanMagneticVariationGridLoadMode } from '../../hooks/useJapanMagneticVariationGridLoadMode';
import { asSelectStyles } from '../../../../utils/reactSelectStyles';
import WaypointAddPanel from './WaypointAddPanel';
import WaypointList from './WaypointList';
import type { PlanningPanelLayout } from '../../planningPanelLayout';
import type { UserSavedWaypoint, UserSavedWaypointInput } from '../../userWaypoints/types';

/**
 * Route Planning コンポーネント
 * 出発/到着空港の選択、ウェイポイント追加パネル、リスト表示を行う
 */
interface RoutePlanningProps {
  layout?: PlanningPanelLayout;
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  airportOptions: AirportGroupOption[];
  navaidOptions: NavaidOption[];
  waypointOptions: WaypointOption[];
  userSavedWaypoints?: UserSavedWaypoint[];
  isAuthenticated?: boolean;
  userSavedError?: string | null;
  onSaveUserPoint?: (input: UserSavedWaypointInput) => Promise<{ error: string | null }>;
  onDeleteUserSaved?: (id: string) => Promise<{ ok: boolean; error: string | null }>;
  onRenameUserSaved?: (id: string, name: string) => Promise<{ ok: boolean; error: string | null }>;
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({
  layout = 'full',
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  waypointOptions,
  userSavedWaypoints,
  isAuthenticated,
  userSavedError,
  onSaveUserPoint,
  onDeleteUserSaved,
  onRenameUserSaved,
}) => {
  const isSplitLayout = layout === 'split';
  const geomagGridLoadMode = useJapanMagneticVariationGridLoadMode();
  return (
    <div>
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 text-white">経路計画</h2>
      <MagneticVariationFallbackNotice />
      <p className="text-2xs sm:text-xs text-gray-400 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
        磁気方位は教育用モデルです。レグ中点の偏差は国土地理院磁気図 {GSI_GEOMAG_2020_META.epoch} 年値（0.1°
        格子・sample.cgi 由来）です。
        {geomagGridLoadMode !== 'loaded'
          ? ' 現在は格子データ未取得のため概算値です。'
          : ''}
        実運航の計画には使用しないでください。
      </p>

      {/* 空港選択部 */}
      <div
        className={
          isSplitLayout
            ? 'grid grid-cols-1 gap-2 sm:gap-4 min-w-0'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4'
        }
      >
        <div className="min-w-0">
          <label htmlFor="departure" className="block text-xs sm:text-sm font-medium text-white mb-1">
            出発地
          </label>
          <Select<AirportOption, false, AirportGroupOption>
            id="departure"
            placeholder="出発空港を選択.."
            options={airportOptions}
            value={flightPlan.departure}
            onChange={(option: SingleValue<AirportOption>) =>
              setFlightPlan({ ...flightPlan, departure: option ?? undefined })
            }
            styles={asSelectStyles<AirportOption>() as unknown as StylesConfig<AirportOption, false, AirportGroupOption>}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm min-w-0"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="arrival" className="block text-xs sm:text-sm font-medium text-white mb-1">
            目的地
          </label>
          <Select<AirportOption, false, AirportGroupOption>
            id="arrival"
            placeholder="到着空港を選択.."
            options={airportOptions}
            value={flightPlan.arrival}
            onChange={(option: SingleValue<AirportOption>) =>
              setFlightPlan({ ...flightPlan, arrival: option ?? undefined })
            }
            styles={asSelectStyles<AirportOption>() as unknown as StylesConfig<AirportOption, false, AirportGroupOption>}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm min-w-0"
          />
        </div>
      </div>

      <div
        className={
          isSplitLayout
            ? 'mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6'
            : 'mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'
        }
      >
        <div className="min-w-0">
          <WaypointAddPanel
            flightPlan={flightPlan}
            setFlightPlan={setFlightPlan}
            navaidOptions={navaidOptions}
            waypointOptions={waypointOptions}
            userSavedWaypoints={userSavedWaypoints}
            isAuthenticated={isAuthenticated}
            userSavedError={userSavedError}
            onSaveUserPoint={onSaveUserPoint}
            onDeleteUserSaved={onDeleteUserSaved}
            onRenameUserSaved={onRenameUserSaved}
          />
        </div>

        <div className="min-w-0">
          <div className="p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
            <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">ウェイポイントリスト</h3>
            <WaypointList layout={layout} flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
