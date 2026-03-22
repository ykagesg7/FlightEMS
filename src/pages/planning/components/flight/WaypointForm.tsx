import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { FlightPlan, Waypoint } from '../../../../types/index';
import { dmsToDecimal } from '../../../../utils/dms';
import { calculateOffsetPoint } from '../../../../utils/offset';
import { validateMagneticOffsetFields } from '../../utils/magneticOffsetValidation';

function validateDecimalCoord(value: string, max: number) {
  const num = parseFloat(value);
  return !isNaN(num) && Math.abs(num) <= max;
}

function validateDMSCoord(value: string, isLatitude: boolean) {
  if (isLatitude) {
    return /^(?:[NS])?\d{6}(?:[NS])?$/i.test(value);
  }
  return /^(?:[EW])?\d{7}(?:[EW])?$/i.test(value);
}

export interface WaypointCoordinateFormHandle {
  tryBuildWaypoint: () => Waypoint | null;
}

interface WaypointFormProps {
  flightPlan: FlightPlan;
  setFlightPlan?: React.Dispatch<React.SetStateAction<FlightPlan>>;
  /** パネル内表示時は外枠・見出しを抑止 */
  embedded?: boolean;
  /** 親の「ルートに追加」に委ねる場合 */
  hideSubmitButton?: boolean;
  /** 指定時は追加処理に使用（未指定なら setFlightPlan でマージ） */
  onAdd?: (waypoint: Waypoint) => void;
}

const WaypointForm = forwardRef<WaypointCoordinateFormHandle, WaypointFormProps>(
  ({ flightPlan, setFlightPlan, embedded, hideSubmitButton, onAdd }, ref) => {
    const [bearing, setBearing] = useState<string>('');
    const [distance, setDistance] = useState<string>('');
    const [coordinateInputMode, setCoordinateInputMode] = useState<'DMS' | 'Decimal'>('DMS');
    const [coordinates, setCoordinates] = useState({
      dms: { lat: '', lon: '' },
      decimal: { lat: '', lon: '' },
    });
    const [errors, setErrors] = useState({ lat: '', lon: '' });
    const [offsetError, setOffsetError] = useState('');
    const [dmsInput, setDmsInput] = useState<string>('');

    useEffect(() => {
      setErrors({ lat: '', lon: '' });
      setOffsetError('');
      setCoordinates({
        dms: { lat: '', lon: '' },
        decimal: { lat: '', lon: '' },
      });
    }, [coordinateInputMode]);

    const tryBuildWaypoint = useCallback((): Waypoint | null => {
      setOffsetError('');
      let latDecimal: number | null = null;
      let lonDecimal: number | null = null;

      if (coordinateInputMode === 'DMS') {
        const latValid = validateDMSCoord(coordinates.dms.lat, true);
        const lonValid = validateDMSCoord(coordinates.dms.lon, false);

        if (!latValid || !lonValid) {
          setErrors({
            lat: latValid ? '' : '有効な緯度を入力してください（例: N354336）',
            lon: lonValid ? '' : '有効な経度を入力してください（例: E1394500）',
          });
          return null;
        }

        latDecimal = dmsToDecimal(coordinates.dms.lat, true);
        lonDecimal = dmsToDecimal(coordinates.dms.lon, false);
      } else {
        const latValid = validateDecimalCoord(coordinates.decimal.lat, 90);
        const lonValid = validateDecimalCoord(coordinates.decimal.lon, 180);

        if (!latValid || !lonValid) {
          setErrors({
            lat: latValid ? '' : '有効な緯度を入力してください（±90、±0）',
            lon: lonValid ? '' : '有効な経度を入力してください（±180、±0）',
          });
          return null;
        }

        latDecimal = parseFloat(coordinates.decimal.lat);
        lonDecimal = parseFloat(coordinates.decimal.lon);
      }

      const pairErr = validateMagneticOffsetFields(bearing, distance);
      if (pairErr) {
        setErrors({ lat: '', lon: '' });
        setOffsetError(pairErr);
        return null;
      }

      if (latDecimal === null || lonDecimal === null) return null;

      setErrors({ lat: '', lon: '' });

      let coords: [number, number] = [lonDecimal, latDecimal];
      let finalLat = latDecimal;
      let finalLon = lonDecimal;

      if (bearing.trim() !== '' && distance.trim() !== '') {
        const bearingNum = parseFloat(bearing);
        const distanceNum = parseFloat(distance);
        const offset = calculateOffsetPoint(latDecimal, lonDecimal, bearingNum, distanceNum);
        if (offset) {
          coords = [offset.lon, offset.lat];
          finalLat = offset.lat;
          finalLon = offset.lon;
        }
      }

      return {
        id: `custom-${Date.now()}`,
        name: `カスタム WP ${flightPlan.waypoints.length + 1}`,
        type: 'custom' as const,
        coordinates: coords,
        latitude: finalLat,
        longitude: finalLon,
        nameEditable: true,
      };
    }, [
      bearing,
      coordinateInputMode,
      coordinates.dms.lat,
      coordinates.dms.lon,
      coordinates.decimal.lat,
      coordinates.decimal.lon,
      distance,
      flightPlan.waypoints.length,
    ]);

    useImperativeHandle(ref, () => ({ tryBuildWaypoint }), [tryBuildWaypoint]);

    const applyWaypoint = (waypoint: Waypoint) => {
      if (onAdd) {
        onAdd(waypoint);
      } else if (setFlightPlan) {
        setFlightPlan((prev) => ({
          ...prev,
          waypoints: [...prev.waypoints, waypoint],
        }));
      }
    };

    const handleAddWaypoint = () => {
      const waypoint = tryBuildWaypoint();
      if (waypoint) applyWaypoint(waypoint);
    };

    const handleDmsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDmsInput(value);

      if (value.includes(',') || value.includes(';')) {
        const parts = value.split(/,|;/).map((part) => part.trim());
        if (parts.length === 2) {
          let latRaw = parts[0];
          let lonRaw = parts[1];

          if (!/^[NnSs]/.test(latRaw) && !/[NnSs]$/.test(latRaw)) {
            latRaw = 'N' + latRaw;
          }

          if (!/^[EeWw]/.test(lonRaw) && !/[EeWw]$/.test(lonRaw)) {
            lonRaw = 'E' + lonRaw;
          }

          const latDigits = latRaw.replace(/[NnSs]/g, '');
          const lonDigits = lonRaw.replace(/[EeWw]/g, '');
          if (latDigits.length === 6 && lonDigits.length === 7) {
            setCoordinates((prev) => ({
              ...prev,
              dms: { lat: latRaw.toUpperCase(), lon: lonRaw.toUpperCase() },
            }));
            setErrors({ lat: '', lon: '' });
          }
        }
      } else {
        const continuousRegex = /^(\d{6}[NnSs])(\d{7}[EeWw])$/;
        const match = value.match(continuousRegex);
        if (match) {
          const latRaw = match[1];
          const lonRaw = match[2];
          setCoordinates((prev) => ({
            ...prev,
            dms: { lat: latRaw.toUpperCase(), lon: lonRaw.toUpperCase() },
          }));
          setErrors({ lat: '', lon: '' });
        }
      }
    };

    const inputClass =
      'mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50';

    const title = embedded ? (
      <h4 className="text-sm font-medium text-gray-300 mb-2">座標入力</h4>
    ) : (
      <legend className="text-lg font-semibold mb-4 text-gray-50">ウェイポイントを座標で追加</legend>
    );

    const shellClass = embedded
      ? 'space-y-3 text-white'
      : 'shadow-sm rounded-lg p-6 mt-8 bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 text-white';

    return (
      <div className={shellClass}>
        {title}

        <div className="mb-4">
          <label className="inline-flex items-center cursor-pointer text-gray-400">
            <input
              type="radio"
              className="form-radio text-blue-500"
              name="coordinateInputMode"
              value="DMS"
              checked={coordinateInputMode === 'DMS'}
              onChange={() => setCoordinateInputMode('DMS')}
            />
            <span className="ml-2">DMS入力</span>
          </label>
          <label className="inline-flex items-center cursor-pointer ml-4 text-gray-400">
            <input
              type="radio"
              className="form-radio text-blue-500"
              name="coordinateInputMode"
              value="Decimal"
              checked={coordinateInputMode === 'Decimal'}
              onChange={() => setCoordinateInputMode('Decimal')}
            />
            <span className="ml-2">Decimal入力</span>
          </label>
        </div>

        {coordinateInputMode === 'DMS' ? (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                緯度 (ddmmss 形式、例: N334005)
              </label>
              <input
                type="text"
                value={coordinates.dms.lat}
                onChange={(e) =>
                  setCoordinates((prev) => ({
                    ...prev,
                    dms: { ...prev.dms, lat: e.target.value.toUpperCase() },
                  }))
                }
                className={`${inputClass} px-3 py-2`}
              />
              {errors.lat && <span className="text-red-500 text-sm">{errors.lat}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                経度 (dddmmss 形式、例: E1234005)
              </label>
              <input
                type="text"
                value={coordinates.dms.lon}
                onChange={(e) =>
                  setCoordinates((prev) => ({
                    ...prev,
                    dms: { ...prev.dms, lon: e.target.value.toUpperCase() },
                  }))
                }
                className={`${inputClass} px-3 py-2`}
              />
              {errors.lon && <span className="text-red-500 text-sm">{errors.lon}</span>}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">緯度 (±90.000000)</label>
              <input
                type="text"
                value={coordinates.decimal.lat}
                onChange={(e) =>
                  setCoordinates((prev) => ({
                    ...prev,
                    decimal: { ...prev.decimal, lat: e.target.value },
                  }))
                }
                className={`${inputClass} px-3 py-2`}
              />
              {errors.lat && <span className="text-red-500 text-sm">{errors.lat}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">経度 (±180.000000)</label>
              <input
                type="text"
                value={coordinates.decimal.lon}
                onChange={(e) =>
                  setCoordinates((prev) => ({
                    ...prev,
                    decimal: { ...prev.decimal, lon: e.target.value },
                  }))
                }
                className={`${inputClass} px-3 py-2`}
              />
              {errors.lon && <span className="text-red-500 text-sm">{errors.lon}</span>}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">オフセット (オプション)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">方位(度)</label>
              <input
                type="number"
                value={bearing}
                onChange={(e) => setBearing(e.target.value)}
                placeholder="0-360"
                className={`${inputClass} px-3 py-2`}
                min={0}
                max={360}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">距離 (海里)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="距離"
                className={`${inputClass} px-3 py-2`}
                min={0}
              />
            </div>
          </div>
          {offsetError ? <p className="text-red-500 text-sm">{offsetError}</p> : null}
        </div>

        {!hideSubmitButton && (
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline min-h-[44px]"
          >
            座標から追加
          </button>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400">
            連続DMS入力(例: N334005,E1234005)
          </label>
          <input
            type="text"
            value={dmsInput}
            onChange={handleDmsInputChange}
            placeholder="Nddmmss または Edddmmss"
            className={`${inputClass} px-3 py-2`}
          />
        </div>
      </div>
    );
  }
);

WaypointForm.displayName = 'WaypointForm';

export default WaypointForm;
