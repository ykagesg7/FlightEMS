const fs = require('fs');
const path = require('path');

// ウェイポイントのインデックスファイルを読み込む
const indexPath = path.join(__dirname, '../public/geojson/waypoints/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

// 結果を格納するための配列
const allFeatures = [];

// インデックスからソースファイルを取得
const sourceFiles = indexData.sources || [];

console.log(`合計 ${sourceFiles.length} 個のウェイポイントファイルをマージします...`);

// 各ソースファイルを読み込んで結合
sourceFiles.forEach(sourceFile => {
  try {
    const filePath = path.join(__dirname, '../public/geojson', sourceFile);
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (fileData.features && Array.isArray(fileData.features)) {
      console.log(`${sourceFile}: ${fileData.features.length} 個のウェイポイントを追加`);
      allFeatures.push(...fileData.features);
    } else {
      console.warn(`${sourceFile}: フィーチャーが見つかりません`);
    }
  } catch (error) {
    console.error(`${sourceFile} の読み込みエラー:`, error.message);
  }
});

// 結合したデータを作成
const mergedData = {
  type: "FeatureCollection",
  crs: indexData.crs,
  features: allFeatures
};

// 結合したデータを保存
const outputPath = path.join(__dirname, '../public/geojson/Waypoints.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));

console.log(`マージ完了: ${allFeatures.length} 個のウェイポイントを ${outputPath} に保存しました`); 