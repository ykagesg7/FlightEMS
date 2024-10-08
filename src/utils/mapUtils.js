import L from 'leaflet';

export const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export const pointToLayer = (feature, latlng) => {
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: feature.properties.type === "空港" ? "#ff7800" : "#0078ff",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
  });
};

export const toDMS = (coord) => {
  const absolute = Math.abs(coord);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  return `${degrees}° ${minutes}' ${seconds}"`;
};

export const formatCoordinates = (lat, lng) => {
  const latDMS = toDMS(lat);
  const lngDMS = toDMS(lng);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${latDir} ${latDMS} / ${lngDir} ${lngDMS}`;
};