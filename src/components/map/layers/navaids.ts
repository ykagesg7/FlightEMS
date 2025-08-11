import L from 'leaflet';
import { Waypoint } from '../../../types';
import { getNavaidColor } from '../../../utils';
import { escapeHtml, kvItem, sectionHeader } from '../popups/common';
import { NavaidProps } from '../types';

export const navaidMarkerOptions = (type?: string) => ({
  radius: 4,
  fillColor: getNavaidColor(type ?? ''),
  color: getNavaidColor(type ?? ''),
  weight: 1.5,
  fillOpacity: 0.7,
  opacity: 0.9,
});

export const bindNavaidPopup = (
  feature: GeoJSON.Feature,
  layer: L.Layer,
  setFlightPlan: React.Dispatch<React.SetStateAction<any>>,
  map: L.Map | null
) => {
  const coords = (feature.geometry as GeoJSON.Point).coordinates;
  const props = feature.properties as NavaidProps;
  const header = sectionHeader('Navaid');
  const body = `
    <div class="ml-2 weather-info-grid">
      ${kvItem('weather', 'ID：', escapeHtml(props.id || ''))}
      ${kvItem('weather', '名称：', `${escapeHtml(props.name1 || '')} ${escapeHtml(props.name2 || '')}`)}
      ${kvItem('weather', 'Type：', escapeHtml(props.type || 'N/A'))}
      ${kvItem('weather', 'CH：', escapeHtml(props.ch || 'N/A'))}
      ${kvItem('weather', 'Freq：', props.freq ? `${escapeHtml(props.freq)} MHz` : 'N/A')}
      ${kvItem('weather', '位置：', `${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E`)}
    </div>
    <button class="add-to-route-btn mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">ルートに追加</button>
  `;
  const popupContent = `<div class="navaid-popup">${header}<div class="p-2">${body}</div></div>`;

  const popup = L.popup({ className: 'navaid-custom-popup', maxWidth: 250 });
  popup.setContent(popupContent);
  layer.bindPopup(popup);

  (layer as any).bindTooltip(`${props.id}（${props.name1} ${props.name2}）`, {
    permanent: false,
    direction: 'top',
    className: 'navaid-tooltip',
  });

  layer.on('click', () => {
    setTimeout(() => {
      const addButton = document.querySelector('.navaid-custom-popup .add-to-route-btn');
      if (addButton) {
        addButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const newWaypoint: Waypoint = {
            id: (feature.properties as any).id,
            name: (feature.properties as any).name || (feature.properties as any).id,
            type: 'navaid',
            sourceId: (feature.properties as any).id,
            ch: (feature.properties as any).ch,
            coordinates: [coords[0], coords[1]] as [number, number],
            latitude: coords[1] as number,
            longitude: coords[0] as number,
          } as any;
          setFlightPlan((prev: any) => ({ ...prev, waypoints: [...prev.waypoints, newWaypoint] }));
          map?.closePopup();
        });
      }
    }, 100);
  });
};


