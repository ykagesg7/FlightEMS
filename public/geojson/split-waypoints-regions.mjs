import fs from 'fs';

// Waypointsファイルを読み込む
const data = JSON.parse(fs.readFileSync('./public/geojson/Waypoints.json', 'utf8'));

// 地域の定義
const regions = {
  hokkaido: { name: '北海道', minLat: 41.0, maxLat: 46.0, minLng: 139.0, maxLng: 146.0 },
  tohoku: { name: '東北', minLat: 37.0, maxLat: 41.5, minLng: 138.0, maxLng: 142.0 },
  kanto: { name: '関東', minLat: 34.5, maxLat: 37.0, minLng: 138.0, maxLng: 141.0 },
  chubu: { name: '中部', minLat: 34.0, maxLat: 37.5, minLng: 135.0, maxLng: 139.0 },
  kinki: { name: '近畿', minLat: 33.0, maxLat: 36.0, minLng: 134.0, maxLng: 137.0 },
  chugoku: { name: '中国', minLat: 33.5, maxLat: 36.0, minLng: 130.5, maxLng: 134.5 },
  shikoku: { name: '四国', minLat: 32.5, maxLat: 34.5, minLng: 132.0, maxLng: 135.0 },
  kyushu: { name: '九州', minLat: 31.0, maxLat: 34.0, minLng: 129.0, maxLng: 132.0 },
  okinawa: { name: '沖縄', minLat: 24.0, maxLat: 28.0, minLng: 122.0, maxLng: 129.0 },
  others: { name: 'その他', minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
};

// 地域ごとにグループ化
const groups = {};

// 各地域のFeatureCollectionを初期化
Object.keys(regions).forEach(region => {
  groups[region] = {
    type: 'FeatureCollection',
    crs: data.crs,
    region: regions[region].name,
    features: []
  };
});

// 各ウェイポイントを適切な地域に割り当て
data.features.forEach(feature => {
  const coords = feature.geometry.coordinates;
  const lng = coords[0]; // 経度
  const lat = coords[1]; // 緯度
  
  let assigned = false;
  
  // 地域に割り当て
  for (const region in regions) {
    if (region === 'others') continue; // othersは後で処理
    
    const r = regions[region];
    if (lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng) {
      // プロパティをそのまま保持
      groups[region].features.push(feature);
      assigned = true;
      break;
    }
  }
  
  // どの地域にも属さないウェイポイントはothersに入れる
  if (!assigned) {
    // プロパティをそのまま保持
    groups.others.features.push(feature);
  }
});

// 各グループをファイルに書き出す
Object.keys(groups).forEach(region => {
  fs.writeFileSync(
    `./public/geojson/waypoints/waypoints_region_${region}.json`, 
    JSON.stringify(groups[region], null, 2)
  );
  console.log(`${regions[region].name}地域のウェイポイント: ${groups[region].features.length}件`);
});

// 元のファイルを統合するためのインデックスファイルを作成
const indexData = {
  type: 'FeatureCollection',
  crs: data.crs,
  regions: Object.keys(regions).map(region => {
    return {
      id: region,
      name: regions[region].name,
      source: `waypoints/waypoints_region_${region}.json`
    };
  })
};

fs.writeFileSync(
  './public/geojson/waypoints/regions_index.json',
  JSON.stringify(indexData, null, 2)
);

console.log(`ウェイポイントデータを${Object.keys(regions).length}個の地域に分割しました`); 