/**
 * name1フィールドの修正を全ウェイポイントファイルに反映するスクリプト
 * 対象：OMUTA（オオムタ→オームタ）, OTAKI（オオタキ→オタキ）など
 */

const fs = require('fs');
const path = require('path');

// ウェイポイントディレクトリのパス
const waypointsDir = path.resolve('public/geojson/waypoints');

// 修正対象のマッピング
const nameCorrections = {
  'OMUTA': { from: 'オオムタ', to: 'オームタ' },
  'OTAKI': { from: 'オオタキ', to: 'オタキ' }
  // 他の修正項目があれば追加
};

// すべてのウェイポイントファイルを処理
function processAllWaypointFiles() {
  // waypoints_*.jsonのファイルを取得
  const waypointFiles = fs.readdirSync(waypointsDir)
    .filter(file => file.startsWith('waypoints_') && file.endsWith('.json') && !file.includes('region_'));

  console.log(`処理対象: ${waypointFiles.length}個のウェイポイントファイル`);

  // 各ファイルを処理
  let totalModifiedCount = 0;
  
  waypointFiles.forEach(filename => {
    const filePath = path.join(waypointsDir, filename);
    const modifiedCount = updateWaypointFile(filePath);
    totalModifiedCount += modifiedCount;
    
    if (modifiedCount > 0) {
      console.log(`${filename}: ${modifiedCount}件のname1を修正`);
    }
  });

  console.log(`✅ 合計${totalModifiedCount}件のname1を修正しました`);
  
  // 地域別ファイルも処理
  const regionFiles = fs.readdirSync(waypointsDir)
    .filter(file => file.startsWith('waypoints_region_') && file.endsWith('.json'));

  console.log(`処理対象: ${regionFiles.length}個の地域別ウェイポイントファイル`);
  
  let totalRegionModifiedCount = 0;
  
  regionFiles.forEach(filename => {
    const filePath = path.join(waypointsDir, filename);
    const modifiedCount = updateWaypointFile(filePath);
    totalRegionModifiedCount += modifiedCount;
    
    if (modifiedCount > 0) {
      console.log(`${filename}: ${modifiedCount}件のname1を修正`);
    }
  });

  console.log(`✅ 地域別ファイルで合計${totalRegionModifiedCount}件のname1を修正しました`);

  // メインのWaypoints.jsonも更新
  const mainWaypointsPath = path.resolve('public/geojson/Waypoints.json');
  const mainModifiedCount = updateWaypointFile(mainWaypointsPath);
  
  if (mainModifiedCount > 0) {
    console.log(`Waypoints.json: ${mainModifiedCount}件のname1を修正`);
  }
}

// 1つのウェイポイントファイルを処理
function updateWaypointFile(filePath) {
  // ファイルを読み込み
  const waypointsFile = fs.readFileSync(filePath, 'utf8');
  const waypoints = JSON.parse(waypointsFile);
  
  let modifiedCount = 0;
  
  // 各ウェイポイントのname1を確認・修正
  waypoints.features.forEach(feature => {
    const id = feature.properties.id;
    
    if (nameCorrections[id]) {
      const currentName = feature.properties.name1;
      const correctedName = nameCorrections[id].to;
      
      // name1が修正対象の場合のみ更新
      if (currentName !== correctedName) {
        feature.properties.name1 = correctedName;
        modifiedCount++;
      }
    }
  });
  
  // 変更があった場合のみファイルを書き戻す
  if (modifiedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(waypoints, null, 2), 'utf8');
  }
  
  return modifiedCount;
}

// スクリプト実行
processAllWaypointFiles(); 