const fs = require('fs');

// 新しく追加するポイントデータ
const newPoints = [
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "小松",
      "name2": "KOMATSU",
      "id": "KMC",
      "ch": null,
      "freq": 112.0
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        136.404253,
        36.396469
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "小松",
      "name2": "KOMATSU",
      "id": "KMC",
      "ch": "57x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        136.405136,
        36.396489
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "小松島",
      "name2": "KOMATSUSHIMA",
      "id": "KJT",
      "ch": "82y",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        134.625556,
        34.004167
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "河和",
      "name2": "KOWA",
      "id": "XMT",
      "ch": "82x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        136.957428,
        34.704606
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "熊本",
      "name2": "KUMAMOTO",
      "id": "KUE",
      "ch": "75x",
      "freq": 112.8
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        130.841514,
        32.834803
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "久米島",
      "name2": "KUMEJIMA",
      "id": "KXC",
      "ch": null,
      "freq": 116.7
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        126.722064,
        26.371869
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "久米島",
      "name2": "KUMEJIMA",
      "id": "KXC",
      "ch": "114x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        126.721636,
        26.371669
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "串本",
      "name2": "KUSHIMOTO",
      "id": "KEC",
      "ch": null,
      "freq": 112.9
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        135.794494,
        33.447742
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "串本",
      "name2": "KUSHIMOTO",
      "id": "KEC",
      "ch": "76x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        135.794000,
        33.448014
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "釧路",
      "name2": "KUSHIRO",
      "id": "TCE",
      "ch": "47x",
      "freq": 111.0
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        144.200772,
        43.036050
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "舞鶴",
      "name2": "MAIZURU",
      "id": "MZT",
      "ch": "33y",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        135.431111,
        35.548056
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "松本",
      "name2": "MATSUMOTO",
      "id": "MBE",
      "ch": "123x",
      "freq": 117.6
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        137.919817,
        36.155975
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "松山",
      "name2": "MATSUYAMA",
      "id": "MYE",
      "ch": "43y",
      "freq": 110.65
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        132.692222,
        33.830103
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "女満別",
      "name2": "MEMANBETSU",
      "id": "TBE",
      "ch": "45y",
      "freq": 110.85
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        144.166183,
        43.884908
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "美保",
      "name2": "MIHO",
      "id": "JET",
      "ch": "114x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        133.099644,
        35.531047
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "南大東",
      "name2": "MINAMIDAITO",
      "id": "MDE",
      "ch": "125x",
      "freq": 117.8
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        131.263789,
        25.854483
      ]
    }
  }
];

// Navaidsファイルを読み込む
const navaidsFile = fs.readFileSync('./geojson/Navaids.geojson', 'utf8');
const navaids = JSON.parse(navaidsFile);

// 新しいポイントを既存のfeaturesに追加
navaids.features = navaids.features.concat(newPoints);

// 同じName1を持つVOR/DMEとTACANのペアを見つけてVORTACにマージする
const processedFeatures = [];
const processedNames = new Set();

// Name2のアルファベット順に並び替え
navaids.features.sort((a, b) => {
  const nameA = a.properties.name2;
  const nameB = b.properties.name2;
  return nameA.localeCompare(nameB);
});

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

// 元のファイルをバックアップ
fs.copyFileSync('./geojson/Navaids.geojson', './geojson/Navaids.geojson.bak');

// 更新したデータをファイルに保存
fs.writeFileSync('./geojson/Navaids.geojson', JSON.stringify(navaids, null, 2), 'utf8');

console.log('新しいNavaidポイントを追加し、アルファベット順に並べ替え、VOR/DMEとTACANをVORTACに変換しました。');
console.log(`合計 ${navaids.features.length} ポイント`); 