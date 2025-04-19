const fs = require('fs');

// ファイルを読み込む
const navaidsFile = fs.readFileSync('./geojson/Navaids.geojson', 'utf8');
const navaids = JSON.parse(navaidsFile);

// 問題のある地点を手動で修正するためのデータ
const correctCoordinates = [
  { name: "CHITOSE", lon: 141.6740, lat: 42.7645 },
  { name: "CHUBU", lon: 136.8032, lat: 34.8580 },
  { name: "HACHINOHE", lon: 141.4700, lat: 40.5558 },
  { name: "HAKODATE", lon: 140.8322, lat: 41.7740 },
  { name: "HAMAMATSU", lon: 137.7100, lat: 34.7472 },
  { name: "HONGO", lon: 132.9240, lat: 34.4338 },
  { name: "ISHIGAKIJIMA", lon: 124.2380, lat: 24.3960 },
  { name: "KUSHIMOTO", lon: 135.7940, lat: 33.4480 },
  { name: "MATSUMOTO", lon: 137.9198, lat: 36.1560 },
  { name: "MIHO", lon: 133.0996, lat: 35.5310 },
  { name: "MIYAKOJIMA", lon: 125.2931, lat: 24.7770 },
  { name: "MIYAZU", lon: 135.1370, lat: 35.4807 },
  { name: "MUKAWA", lon: 141.9556, lat: 42.5550 },
  { name: "NAGASAKI", lon: 129.9180, lat: 32.9052 },
  { name: "NANKI", lon: 135.3650, lat: 33.6613 },
  { name: "NOTO", lon: 136.9629, lat: 37.2900 },
  { name: "OBIHIRO", lon: 143.2205, lat: 42.7340 },
  { name: "OYAMA", lon: 139.5613, lat: 34.0710 },
  { name: "OZUKI", lon: 131.0500, lat: 34.0442 },
  { name: "SHIMIZU", lon: 132.9958, lat: 32.7560 },
  { name: "TOKUSHIMA", lon: 134.6100, lat: 34.1300 },
  { name: "YAMAGATA", lon: 140.3580, lat: 38.3886 }
];

// 元のファイルをバックアップ
fs.copyFileSync('./geojson/Navaids.geojson', './geojson/Navaids.geojson.bak-manual-final');

// 問題のある地点を修正
navaids.features.forEach(feature => {
  const name = feature.properties.name2;
  
  // 修正リストに一致する名前があるか確認
  const correctData = correctCoordinates.find(coord => coord.name === name);
  
  if (correctData) {
    // 座標を修正リストの値で上書き
    feature.geometry.coordinates = [correctData.lon, correctData.lat];
  } else {
    // それ以外の座標も4桁に統一（既に4桁の場合は変更なし）
    const [lon, lat] = feature.geometry.coordinates;
    feature.geometry.coordinates = [
      parseFloat(parseFloat(lon).toFixed(4)),
      parseFloat(parseFloat(lat).toFixed(4))
    ];
  }
});

// 文字列変換時に小数点以下を確実に4桁に維持するためのカスタム変換関数
const formatCoordinatesTo4Decimals = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (Array.isArray(value) && value.length === 2 && 
        typeof value[0] === 'number' && typeof value[1] === 'number') {
      // coordinates配列と思われる場合は、各値を文字列として4桁に整形
      return [
        parseFloat(value[0].toFixed(4)),
        parseFloat(value[1].toFixed(4))
      ];
    }
    return value;
  }, 2);
};

// 修正データをファイルに保存（小数点以下4桁を維持）
const formattedJson = formatCoordinatesTo4Decimals(navaids);
fs.writeFileSync('./geojson/Navaids.geojson', formattedJson, 'utf8');

// 出力結果を検証
const fixedJson = JSON.parse(formattedJson);
let validCount = 0;
let invalidCount = 0;
let problemFeatures = [];

fixedJson.features.forEach(feature => {
  const coords = feature.geometry.coordinates;
  const name = feature.properties.name2;
  
  if (coords && coords.length === 2) {
    const lonStr = coords[0].toString();
    const latStr = coords[1].toString();
    
    const lonDecimals = lonStr.includes('.') ? lonStr.split('.')[1].length : 0;
    const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
    
    if (lonDecimals !== 4 || latDecimals !== 4) {
      invalidCount++;
      problemFeatures.push({
        name,
        coords: [lonStr, latStr],
        lonDecimals,
        latDecimals
      });
    } else {
      validCount++;
    }
  }
});

console.log('座標データを小数点以下4桁に修正しました');
console.log(`処理した地点数: ${fixedJson.features.length}, 正常な座標: ${validCount}, 問題のある座標: ${invalidCount}`);

if (invalidCount > 0) {
  console.log('以下の座標に問題があります:');
  problemFeatures.forEach(problem => {
    console.log(`${problem.name}: [${problem.coords}], 桁数: 経度=${problem.lonDecimals}, 緯度=${problem.latDecimals}`);
  });
} else {
  console.log('すべての座標が小数点以下4桁に正しく統一されました！');
} 