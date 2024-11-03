export const calculateDistance = (point1, point2) => {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateMagneticHeading = (point1, point2) => {
  const startLat = point1.lat * Math.PI / 180;
  const startLng = point1.lng * Math.PI / 180;
  const destLat = point2.lat * Math.PI / 180;
  const destLng = point2.lng * Math.PI / 180;

  let y = Math.sin(destLng - startLng) * Math.cos(destLat);
  let x = Math.cos(startLat) * Math.sin(destLat) -
          Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = brng * 180 / Math.PI;
  brng = (brng + 360) % 360;

  // Apply magnetic declination (example value, should be adjusted based on location and date)
  const magneticDeclination = 7.5;
  return (brng + magneticDeclination + 360) % 360;
};

export const calculateBearingAndDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c / 1852; // Convert to nautical miles

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  let bearing = (θ * 180 / Math.PI + 360) % 360;

  // Apply magnetic declination (example: 7 degrees)
  const magneticDeclination = 7;
  bearing = (bearing + magneticDeclination + 360) % 360;

  return { bearing, distance };
};

export const calculateTAS = (ias, altitude) => {
  // 標準大気の温度減率を使用
  const standardTemp = 15 - (1.98 * (altitude / 1000)); // 温度（℃）
  const standardPressure = 1013.25 * Math.exp(-0.0001875 * altitude); // 気圧（hPa）
  
  // 空気密度比の計算
  const densityRatio = (standardPressure / 1013.25) * (288.15 / (273.15 + standardTemp));
  
  // TASの計算
  const tas = ias / Math.sqrt(densityRatio);
  
  // マッハ数の計算（音速を約661.47 * sqrt(T/273.15) KTとして）
  const speedOfSound = 661.47 * Math.sqrt((273.15 + standardTemp) / 273.15);
  const machNumber = tas / speedOfSound;
  
  return {
    tas: Math.round(tas),
    mach: machNumber.toFixed(3)
  };
};