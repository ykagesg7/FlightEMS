/**
 * 指定された緯度経度から、指定された方位と距離だけオフセットした地点の緯度経度を計算する
 * @param {number} lat1 基準点の緯度
 * @param {number} lon1 基準点の経度
 * @param {number} bearing 方位 (度)
 * @param {number} distance 距離 (海里)
 * @returns {{lat: number, lon: number} | null} オフセット地点の緯度経度、計算エラー時はnull
 */
export const calculateOffsetPoint = (lat1: number, lon1: number, bearing: number, distance: number): { lat: number, lon: number } | null => {
    try {
        const R = 3440.069; // 地球の半径（海里）
        const lat1Rad = (lat1 * Math.PI) / 180;
        const lon1Rad = (lon1 * Math.PI) / 180;
        const bearingRad = (bearing * Math.PI) / 180;
        const distanceRatio = distance / R;

        const lat2 = Math.asin(
            Math.sin(lat1Rad) * Math.cos(distanceRatio) +
            Math.cos(lat1Rad) * Math.sin(distanceRatio) * Math.cos(bearingRad)
        );

        const lon2 =
            lon1Rad +
            Math.atan2(
                Math.sin(bearingRad) * Math.sin(distanceRatio) * Math.cos(lat1Rad),
                Math.cos(distanceRatio) - Math.sin(lat1Rad) * Math.sin(lat2)
            );

        return {
            lat: (lat2 * 180) / Math.PI,
            lon: (lon2 * 180) / Math.PI,
        };
    } catch (error) {
        console.error('オフセット計算エラー:', error);
        return null;
    }
} 