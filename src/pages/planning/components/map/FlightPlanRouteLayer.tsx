import L from 'leaflet';
import { CircleMarker, Polyline, Popup } from 'react-leaflet';
import React, { useMemo } from 'react';
import { FlightPlan, Waypoint } from '../../../../types/index';
import { calculateMagneticBearing } from '../../../../utils/bearing';

export interface FlightPlanRouteLayerProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  map: L.Map | null;
}

/**
 * 計画された出発・ウェイポイント・到着を結ぶルート線とマーカー。
 */
export const FlightPlanRouteLayer: React.FC<FlightPlanRouteLayerProps> = ({
  flightPlan,
  setFlightPlan,
  map,
}) => {
  const completeRoute = useMemo(() => {
    const pts: [number, number][] = [];
    if (flightPlan.departure) {
      pts.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
    }
    if (flightPlan.waypoints?.length) {
      flightPlan.waypoints.forEach((wp: Waypoint) => {
        pts.push([wp.latitude, wp.longitude]);
      });
    }
    if (flightPlan.arrival) {
      pts.push([flightPlan.arrival.latitude, flightPlan.arrival.longitude]);
    }
    return pts;
  }, [flightPlan.departure, flightPlan.arrival, flightPlan.waypoints]);

  return (
    <>
      {completeRoute.length > 1 &&
        completeRoute.map((_, i) => {
          if (i === completeRoute.length - 1) return null;
          const start = completeRoute[i];
          const end = completeRoute[i + 1];
          return (
            <Polyline
              key={`complete-route-${i}`}
              positions={[start, end]}
              color="blue"
              weight={2}
              eventHandlers={{
                click: (e: L.LeafletMouseEvent) => {
                  const bearing = calculateMagneticBearing(start[0], start[1], end[0], end[1]);
                  const startLatLng = L.latLng(start[0], start[1]);
                  const endLatLng = L.latLng(end[0], end[1]);
                  const distanceMeters = startLatLng.distanceTo(endLatLng);
                  const distanceNM = Math.round(distanceMeters / 1852);
                  const popupContent = `<div>
                  <p>磁方位: ${Math.round(bearing)}°</p>
                  <p>距離: ${distanceNM} nm</p>
                </div>`;
                  map?.openPopup(popupContent, e.latlng);
                },
              }}
            />
          );
        })}

      {flightPlan.departure && (
        <CircleMarker
          center={[flightPlan.departure.latitude, flightPlan.departure.longitude]}
          radius={6}
          fillColor="green"
          color="green"
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.departure.name}</h2>
              <p className="text-sm text-gray-500">Departure Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}

      {flightPlan.arrival && (
        <CircleMarker
          center={[flightPlan.arrival.latitude, flightPlan.arrival.longitude]}
          radius={6}
          fillColor="red"
          color="red"
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.arrival.name}</h2>
              <p className="text-sm text-gray-500">Arrival Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}

      {flightPlan.waypoints.map((waypoint: Waypoint, index: number) => (
        <CircleMarker
          key={index}
          center={[waypoint.latitude, waypoint.longitude]}
          radius={5}
          fillColor="blue"
          color="blue"
          weight={1}
          fillOpacity={0.6}
        >
          <Popup>
            <div className="waypoint-popup">
              <div className="waypoint-popup-header">ウェイポイント</div>
              <div className="p-2">
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">名前</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={waypoint.name}
                      onChange={(e) => {
                        const newWaypoints = [...flightPlan.waypoints];
                        newWaypoints[index] = {
                          ...waypoint,
                          name: e.target.value,
                        };
                        setFlightPlan((prev: FlightPlan) => ({
                          ...prev,
                          waypoints: newWaypoints,
                        }));
                      }}
                      className="block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-400">ID: {waypoint.id}</p>
                  <p className="text-xs text-gray-400">タイプ: {waypoint.type}</p>
                  <p className="text-xs text-gray-400">
                    位置: {waypoint.latitude.toFixed(4)}°N, {waypoint.longitude.toFixed(4)}°E
                  </p>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newWaypoints = [...flightPlan.waypoints];
                      newWaypoints.splice(index, 1);
                      setFlightPlan((prev: FlightPlan) => ({
                        ...prev,
                        waypoints: newWaypoints,
                      }));
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};
