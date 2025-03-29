/**
 * 指定された緯度経度から、指定された方位と距離だけオフセットした地点の緯度経度を計算する
 * @param {number} lat1 基準点の緯度
 * @param {number} lon1 基準点の経度
 * @param {number} bearing 方位 (度)
 * @param {number} distance 距離 (海里)
 * @returns {{lat: number, lon: number} | null} オフセット地点の緯度経度、計算エラー時はnull
 */
const EARTH_RADIUS = 6371000; // 地球半径 (メートル)
const MAGNETIC_DECLINATION = 8; // 日本の平均磁気偏差 (度)

export function calculateOffsetPoint(lat: number, lon: number, magneticBearing: number, distanceNM: number) {
    // 海里 (NM) をメートルに変換: 1 NM = 1852 m
    const distanceMeters = distanceNM * 1852;

    // 真方位は地図上の基準になるため、磁気方位から磁気偏差を引いて算出
    const trueBearing = (magneticBearing - MAGNETIC_DECLINATION + 360) % 360;
    const bearingRad = trueBearing * Math.PI / 180;

    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;

    // 新たな緯度 (ラジアン) の計算
    const newLatRad = Math.asin(
        Math.sin(latRad) * Math.cos(distanceMeters / EARTH_RADIUS) +
        Math.cos(latRad) * Math.sin(distanceMeters / EARTH_RADIUS) * Math.cos(bearingRad)
    );
    
    // 新たな経度 (ラジアン) の計算
    const newLonRad = lonRad + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distanceMeters / EARTH_RADIUS) * Math.cos(latRad),
        Math.cos(distanceMeters / EARTH_RADIUS) - Math.sin(latRad) * Math.sin(newLatRad)
    );
    
    const newLat = newLatRad * 180 / Math.PI;
    const newLon = newLonRad * 180 / Math.PI;
    
    return { lat: newLat, lon: newLon };
} 