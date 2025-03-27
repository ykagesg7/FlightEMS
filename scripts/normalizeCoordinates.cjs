/**
 * waypoints_A.jsonファイル内のすべての座標データを
 * 経度：ddd.dddd、緯度：dd.dddd形式に統一するスクリプト
 */

const fs = require('fs');
const path = require('path');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_A.json');

// ファイルを読み込み
console.log(`${waypointsFilePath} を読み込み中...`);
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 座標の精度を統一
let modifiedCount = 0;

waypoints.features.forEach(feature => {
  const coordinates = feature.geometry.coordinates;
  const id = feature.properties.id;
  
  // 元の座標を保存
  const originalLon = coordinates[0];
  const originalLat = coordinates[1];
  
  // 座標を小数点以下4桁に丸める
  const normalizedLon = parseFloat(originalLon.toFixed(4));
  const normalizedLat = parseFloat(originalLat.toFixed(4));
  
  // 座標を更新
  coordinates[0] = normalizedLon;
  coordinates[1] = normalizedLat;
  
  // 変更があったかどうかを確認
  if (originalLon !== normalizedLon || originalLat !== normalizedLat) {
    modifiedCount++;
    console.log(`修正: ${id} [${originalLon} → ${normalizedLon}, ${originalLat} → ${normalizedLat}]`);
  }
});

// 結果を保存
fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');

console.log(`✅ 合計${modifiedCount}件の座標を正規化しました。ファイルを保存しました。`); 