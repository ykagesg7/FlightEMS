const fs = require('fs');

// Waypointsファイルを読み込む
const data = JSON.parse(fs.readFileSync('public/geojson/Waypoints.json', 'utf8'));

// アルファベットごとにグループ化
const groups = {};

data.features.forEach(feature => {
  const firstLetter = feature.properties.id.charAt(0);
  
  if (!groups[firstLetter]) {
    groups[firstLetter] = {
      type: 'FeatureCollection',
      crs: data.crs,
      features: []
    };
  }
  
  groups[firstLetter].features.push(feature);
});

// 各グループをファイルに書き出す
Object.keys(groups).forEach(letter => {
  fs.writeFileSync(
    `public/geojson/waypoints/waypoints_${letter}.json`, 
    JSON.stringify(groups[letter], null, 2)
  );
  console.log(`${letter}で始まるウェイポイント: ${groups[letter].features.length}件`);
});

// 元のファイルを統合するためのインデックスファイルを作成
const indexData = {
  type: 'FeatureCollection',
  crs: data.crs,
  sources: Object.keys(groups).map(letter => `waypoints/waypoints_${letter}.json`)
};

fs.writeFileSync(
  'public/geojson/waypoints/index.json',
  JSON.stringify(indexData, null, 2)
);

console.log(`ウェイポイントデータを${Object.keys(groups).length}個のファイルに分割しました`); 