const fs = require('fs');

// Navaidsファイルを読み込む
const navaidsFile = fs.readFileSync('./geojson/Navaids.geojson', 'utf8');
const navaids = JSON.parse(navaidsFile);

// Name2のアルファベット順に並び替え
navaids.features.sort((a, b) => {
  const nameA = a.properties.name2;
  const nameB = b.properties.name2;
  return nameA.localeCompare(nameB);
});

// 同じName1を持つVOR/DMEとTACANのペアを見つけてVORTACにマージする
const processedFeatures = [];
const processedNames = new Set();

for (let i = 0; i < navaids.features.length; i++) {
  const feature = navaids.features[i];
  const name1 = feature.properties.name1;
  const name2 = feature.properties.name2;
  const id = feature.properties.id;
  const type = feature.properties.type;

  // 既に処理済みのエントリーはスキップ
  const key = `${name1}-${id}`;
  if (processedNames.has(key)) {
    continue;
  }

  // VOR/DMEとTACANのペアを探す
  if (type === 'VOR/DME' || type === 'VOR') {
    // ペアとなるTACANを探す
    const pairedTacan = navaids.features.find(f => 
      f.properties.name1 === name1 && 
      f.properties.id === id && 
      (f.properties.type === 'TACAN'));
    
    if (pairedTacan) {
      // VORTACとしてマージする
      const merged = JSON.parse(JSON.stringify(feature));
      merged.properties.type = 'VORTAC';
      merged.geometry.coordinates = pairedTacan.geometry.coordinates; // TACANの座標を使用
      
      processedFeatures.push(merged);
      processedNames.add(key);
      
      // TACANのIDも処理済みとしてマーク
      const tacanKey = `${pairedTacan.properties.name1}-${pairedTacan.properties.id}`;
      processedNames.add(tacanKey);
    } else {
      // ペアがない場合はそのまま追加
      processedFeatures.push(feature);
      processedNames.add(key);
    }
  } else if (type !== 'TACAN') {
    // TACAN以外の場合（VORTACなど）、そのまま追加
    processedFeatures.push(feature);
    processedNames.add(key);
  } else {
    // TACANだが、VOR/DMEのペアが既に処理されているかチェック
    const pairedVor = navaids.features.find(f => 
      f.properties.name1 === name1 && 
      f.properties.id === id && 
      (f.properties.type === 'VOR/DME' || f.properties.type === 'VOR'));
      
    if (!pairedVor) {
      // ペアとなるVOR/DMEがなければ、TACANをそのまま追加
      processedFeatures.push(feature);
      processedNames.add(key);
    }
    // ペアがある場合は既に処理済みなのでスキップ（else不要）
  }
}

// 処理後のデータで更新
navaids.features = processedFeatures;

// 結果を保存
fs.writeFileSync('./geojson/Navaids.sorted.geojson', JSON.stringify(navaids, null, 2), 'utf8');
console.log('Navaid ポイントをソートし、同名VOR/DMEとTACANをVORTACに変換しました。');
console.log(`合計 ${navaids.features.length} ポイント`); 