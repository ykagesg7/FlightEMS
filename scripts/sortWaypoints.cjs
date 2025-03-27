const fs = require('fs');
const path = require('path');

// ソート対象のファイルパス
const targetFilePath = path.resolve('public/geojson/waypoints/waypoints_A.json');

// ファイルを読み込み
const waypointsFile = fs.readFileSync(targetFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// featuresをID順にソート
waypoints.features.sort((a, b) => {
  const idA = a.properties.id;
  const idB = b.properties.id;
  return idA.localeCompare(idB);
});

// 整形してファイルに書き戻す
fs.writeFileSync(
  targetFilePath, 
  JSON.stringify(waypoints, null, 2), 
  'utf8'
);

console.log(`✅ ウェイポイントを ${waypoints.features.length} 件ソートしました。`); 