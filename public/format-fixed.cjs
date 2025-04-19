const fs = require('fs');

// ファイルを読み込む
const navaidsFile = fs.readFileSync('./geojson/Navaids.geojson', 'utf8');

// 修正が必要な地点のリスト（すべて手動で指定）
const fixedCoordinates = `{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [`;

// 元のファイルをバックアップ
fs.copyFileSync('./geojson/Navaids.geojson', './geojson/Navaids.geojson.bak-fixed');

// 作業用の一時ファイル
fs.writeFileSync('./geojson/Navaids.temp.json', navaidsFile, 'utf8');

// 座標を修正するためのシェルコマンドを実行
// Windows PowerShellでは実行できないため、Nodeのreplaceメソッドを使用
let content = navaidsFile;

// 数字.数字 パターンを小数点以下4桁に修正
const regex = /(\d+\.\d+)(?=\s*])/g;
content = content.replace(regex, (match, number) => {
  const floatNumber = parseFloat(number);
  return floatNumber.toFixed(4);
});

// 修正したファイルを保存
fs.writeFileSync('./geojson/Navaids.geojson', content, 'utf8');

console.log('すべての座標を小数点以下4桁に修正しました');

// 検証
const fixedContent = fs.readFileSync('./geojson/Navaids.geojson', 'utf8');
const fixedJson = JSON.parse(fixedContent);

let invalidCount = 0;
fixedJson.features.forEach(feature => {
  const coords = feature.geometry.coordinates;
  if (coords && coords.length === 2) {
    const lonStr = coords[0].toString();
    const latStr = coords[1].toString();
    
    const lonDecimals = lonStr.includes('.') ? lonStr.split('.')[1].length : 0;
    const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
    
    if (lonDecimals !== 4 || latDecimals !== 4) {
      invalidCount++;
      console.log(`問題のある座標: ${feature.properties.name2}, [${lonStr}, ${latStr}]`);
    }
  }
});

if (invalidCount === 0) {
  console.log('すべての座標が小数点以下4桁で正しく統一されました');
} else {
  console.log(`${invalidCount}箇所の座標に問題があります`);
}

console.log(`処理した地点数: ${fixedJson.features.length}`); 