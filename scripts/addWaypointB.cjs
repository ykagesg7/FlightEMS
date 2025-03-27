/**
 * waypoints_B.jsonファイルに新しいウェイポイントを追加するスクリプト
 */

const fs = require('fs');
const path = require('path');
const { convertLatitude, convertLongitude } = require('./convertCoordinates.cjs');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_B.json');

// 追加するウェイポイントのデータ
const newWaypoint = {
  id: "BINID",
  name1: "ビニッド",
  lat: "275408N",
  lon: "1285353E"
};

// ファイルを読み込み
console.log(`${waypointsFilePath} を読み込み中...`);
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 既存のID一覧を取得
const existingIds = new Set(waypoints.features.map(feature => feature.properties.id));

// 既に存在するIDの場合は警告
if (existingIds.has(newWaypoint.id)) {
  console.log(`警告: ${newWaypoint.id} は既に存在します。`);
} else {
  // 緯度経度を変換（小数点以下4桁に丸める）
  const lat = convertLatitude(newWaypoint.lat);
  const lon = convertLongitude(newWaypoint.lon);

  // GeoJSON形式のフィーチャーを作成
  const feature = {
    "type": "Feature",
    "properties": {
      "id": newWaypoint.id,
      "type": "Non-Compulsory",
      "name1": newWaypoint.name1
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        lon,
        lat
      ]
    }
  };

  // ウェイポイントを追加
  waypoints.features.push(feature);
  console.log(`追加: ${newWaypoint.id} - ${newWaypoint.name1} [${lon}, ${lat}]`);

  // IDでソート
  waypoints.features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));

  // ファイルに書き戻す
  fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');
  console.log(`✅ ウェイポイントを追加しました。合計${waypoints.features.length}件となりました。`);
} 