/**
 * waypoints_O.jsonファイル内のウェイポイントをIDのアルファベット順に並び替えるスクリプト
 */

const fs = require('fs');
const path = require('path');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_O.json');

// ファイルを読み込み
console.log(`${waypointsFilePath} を読み込み中...`);
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 元の順序を保存
const originalOrder = [...waypoints.features].map(feature => feature.properties.id);

// IDでソート
waypoints.features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));

// ソート後の順序
const sortedOrder = waypoints.features.map(feature => feature.properties.id);

// ファイルに書き戻す
fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');

console.log(`✅ ${waypoints.features.length}件のウェイポイントをIDのアルファベット順に並び替えました。`);

// 順序が変わったかどうかを確認
let changed = false;
for (let i = 0; i < originalOrder.length; i++) {
  if (originalOrder[i] !== sortedOrder[i]) {
    changed = true;
    break;
  }
}

if (changed) {
  console.log('順序が変更されました。');
} else {
  console.log('順序は既にアルファベット順でした。');
} 