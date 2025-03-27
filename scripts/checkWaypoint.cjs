/**
 * 特定のウェイポイントの詳細を表示するスクリプト
 */

const fs = require('fs');
const path = require('path');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_B.json');
console.log(`ファイルパス: ${waypointsFilePath}`);

// ファイルを読み込み
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);
console.log(`読み込んだウェイポイント数: ${waypoints.features.length}`);

// 確認するウェイポイントID
const waypointId = 'BINID';
console.log(`検索するID: ${waypointId}`);

// ウェイポイントを検索
const waypoint = waypoints.features.find(feature => feature.properties.id === waypointId);
console.log(`検索結果: ${waypoint ? '見つかりました' : '見つかりませんでした'}`);

if (waypoint) {
  console.log(`===== ウェイポイント詳細 =====`);
  console.log(`ID: ${waypoint.properties.id}`);
  console.log(`読み方: ${waypoint.properties.name1}`);
  console.log(`タイプ: ${waypoint.properties.type}`);
  console.log(`座標: [経度: ${waypoint.geometry.coordinates[0]}, 緯度: ${waypoint.geometry.coordinates[1]}]`);
  
  // 度分秒形式に変換（簡易版）
  const lon = waypoint.geometry.coordinates[0];
  const lat = waypoint.geometry.coordinates[1];
  
  const lonDeg = Math.floor(lon);
  const lonMin = Math.floor((lon - lonDeg) * 60);
  const lonSec = Math.round(((lon - lonDeg) * 60 - lonMin) * 60);
  
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.floor((Math.abs(lat) - latDeg) * 60);
  const latSec = Math.round(((Math.abs(lat) - latDeg) * 60 - latMin) * 60);
  
  const lonStr = `${lonDeg.toString().padStart(3, '0')}°${lonMin.toString().padStart(2, '0')}'${lonSec.toString().padStart(2, '0')}"E`;
  const latStr = `${latDeg.toString().padStart(2, '0')}°${latMin.toString().padStart(2, '0')}'${latSec.toString().padStart(2, '0')}"N`;
  
  console.log(`度分秒形式: ${latStr} ${lonStr}`);
  console.log(`========================`);
} else {
  console.log(`ウェイポイント ${waypointId} は見つかりませんでした。`);
  
  // すべてのIDを表示（デバッグ用）
  console.log('登録されているID一覧:');
  waypoints.features.forEach((feature, index) => {
    if (index < 10 || index > waypoints.features.length - 10) {
      console.log(`${index}: ${feature.properties.id}`);
    } else if (index === 10) {
      console.log('...');
    }
  });
} 