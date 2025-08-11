import L from 'leaflet';
import { Waypoint } from '../../../types';
import { escapeHtml, kvItem, sectionHeader } from '../popups/common';
import { WaypointProps } from '../types';

export const waypointStyle = (feature: any) => {
  return {
    radius: 4,
    fillColor: feature.properties?.type === 'Compulsory' ? '#FF9900' : '#66CCFF',
    color: feature.properties?.type === 'Compulsory' ? '#FF6600' : '#3399CC',
    weight: 1.5,
    fillOpacity: 0.7,
    opacity: 0.9,
  } as L.PathOptions & { radius: number };
};

export const bindWaypointPopup = (
  feature: GeoJSON.Feature,
  layer: L.Layer,
  setFlightPlan: React.Dispatch<React.SetStateAction<any>>,
  map: L.Map | null
) => {
  const coords = (feature.geometry as GeoJSON.Point).coordinates;
  const props = feature.properties as WaypointProps;
  const header = sectionHeader('ウェイポイント');
  const body = `
    <div class="ml-2 weather-info-grid">
      ${kvItem('weather', '名前：', escapeHtml(props.name1 || '未設定'))}
      ${kvItem('weather', 'タイプ：', escapeHtml(props.type || 'N/A'))}
      ${kvItem('weather', '位置：', `${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E`)}
    </div>
    <button class="add-to-route-btn mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">ルートに追加</button>
  `;
  const popupContent = `<div class="waypoint-popup">${header}<div class="p-2">${body}</div></div>`;

  const popup = L.popup({ className: 'waypoint-custom-popup', maxWidth: 250 });
  popup.setContent(popupContent);
  layer.bindPopup(popup);

  // ツールチップ
  (layer as any).bindTooltip(props?.id || '', {
    permanent: false,
    direction: 'top',
    className: 'waypoint-tooltip',
  });

  // クリック: ルートに追加
  layer.on('click', () => {
    // useDebouncedCallbackをsetTimeoutに置き換え
    setTimeout(() => {
      const addButton = document.querySelector('.waypoint-custom-popup .add-to-route-btn');
      if (addButton) {
        addButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const newWaypoint: Waypoint = {
            id: (feature.properties as any)?.id || '',
            name: (feature.properties as any)?.name1 || (feature.properties as any)?.id || '',
            type: 'custom',
            coordinates: [coords[0], coords[1]] as [number, number],
            latitude: coords[1] as number,
            longitude: coords[0] as number,
          };

          setFlightPlan((prev: any) => ({ ...prev, waypoints: [...prev.waypoints, newWaypoint] }));

          if (map) {
            const successMsg = L.DomUtil.create('div', 'success-message');
            successMsg.innerHTML = `${(feature.properties as any)?.id}をルートに追加しました`;
            successMsg.style.position = 'absolute';
            successMsg.style.bottom = '10px';
            successMsg.style.left = '50%';
            successMsg.style.transform = 'translateX(-50%)';
            successMsg.style.backgroundColor = 'rgba(52, 211, 153, 0.9)';
            successMsg.style.color = 'white';
            successMsg.style.padding = '10px 20px';
            successMsg.style.borderRadius = '4px';
            successMsg.style.zIndex = '1000';
            document.body.appendChild(successMsg);

            // 成功メッセージの削除もsetTimeoutに変更
            setTimeout(() => {
              document.body.removeChild(successMsg);
            }, 3000);

            map.closePopup();
          }
        });
      }
    }, 100);
  });
};


