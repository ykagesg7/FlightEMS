/**
 * waypoints_C.jsonファイル内のウェイポイントをIDのアルファベット順に並び替えるスクリプト
 * 重複するIDのエントリーがあれば除去します
 */

const fs = require('fs');
const path = require('path');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_C.json');

// ファイルを読み込み
console.log(`${waypointsFilePath} を読み込み中...`);
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 元の数を保存
const originalCount = waypoints.features.length;
console.log(`元のウェイポイント数: ${originalCount}`);

// 重複IDのチェックと除去
const idSet = new Set();
const uniqueFeatures = [];
const duplicateIds = [];

waypoints.features.forEach(feature => {
  const id = feature.properties.id;
  if (!idSet.has(id)) {
    // 初めて出現したIDなので保持
    idSet.add(id);
    uniqueFeatures.push(feature);
  } else {
    // 既に出現したIDは重複として記録
    duplicateIds.push(id);
  }
});

// 重複があれば報告
if (duplicateIds.length > 0) {
  console.log(`重複IDを検出: ${duplicateIds.join(', ')}`);
  console.log(`重複を除去: ${originalCount}件 → ${uniqueFeatures.length}件`);
  waypoints.features = uniqueFeatures;
}

// IDでソート
waypoints.features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));

// ソート後の順序
const sortedIds = waypoints.features.map(feature => feature.properties.id);

// ファイルに書き戻す
fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');

console.log(`✅ ${waypoints.features.length}件のウェイポイントをIDのアルファベット順に並び替えました。`);

// IDのアルファベット順リストを表示
console.log('ソート後のID順序:');
console.log(sortedIds.join(', ')); 