const fs = require('fs');

// 新しく追加するポイントデータ
const newPoints = [
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "南鳥島",
      "name2": "MINAMITORISHIMA",
      "id": "MLT",
      "ch": "23x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        153.977500,
        24.289444
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "三沢",
      "name2": "MISAWA",
      "id": "MIS",
      "ch": null,
      "freq": 115.4
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        141.381108,
        40.703822
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "三沢",
      "name2": "MISAWA",
      "id": "MIS",
      "ch": "101x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        141.381108,
        40.703822
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "見島",
      "name2": "MISHIMA",
      "id": "MIT",
      "ch": "43x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        131.138056,
        34.771667
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "宮古",
      "name2": "MIYAKO",
      "id": "MQE",
      "ch": "113x",
      "freq": 116.6
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        141.951067,
        39.865639
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "宮古島",
      "name2": "MIYAKOJIMA",
      "id": "MJC",
      "ch": null,
      "freq": 113.45
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        125.293408,
        24.777392
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "宮古島",
      "name2": "MIYAKOJIMA",
      "id": "MJC",
      "ch": "81y",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        125.293147,
        24.777011
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "宮崎",
      "name2": "MIYAZAKI",
      "id": "MZE",
      "ch": "71x",
      "freq": 112.4
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        131.437467,
        31.878728
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "宮津",
      "name2": "MIYAZU",
      "id": "YME",
      "ch": "73x",
      "freq": 112.6
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        135.137022,
        35.480692
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "紋別",
      "name2": "MONBETSU",
      "id": "MVE",
      "ch": "76x",
      "freq": 112.9
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        143.395092,
        44.305267
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "鵡川",
      "name2": "MUKAWA",
      "id": "MKE",
      "ch": "111x",
      "freq": 116.4
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        141.955631,
        42.555006
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "武蔵",
      "name2": "MUSASHI",
      "id": "TFE",
      "ch": "124x",
      "freq": 117.7
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        131.728756,
        33.489714
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "長崎",
      "name2": "NAGASAKI",
      "id": "OLE",
      "ch": "113x",
      "freq": 116.6
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        129.917981,
        32.905247
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "名古屋",
      "name2": "NAGOYA",
      "id": "KCC",
      "ch": null,
      "freq": 114.2
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        136.914925,
        35.265267
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "名古屋",
      "name2": "NAGOYA",
      "id": "KCC",
      "ch": "89x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        136.914508,
        35.265486
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "那覇",
      "name2": "NAHA",
      "id": "NHC",
      "ch": null,
      "freq": 116.5
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        127.642867,
        26.208531
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "那覇",
      "name2": "NAHA",
      "id": "NHC",
      "ch": "112x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        127.642622,
        26.208197
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "中標津",
      "name2": "NAKASHIBETSU",
      "id": "NSE",
      "ch": "51y",
      "freq": 111.45
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        144.950503,
        43.577361
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "中種子",
      "name2": "NAKATANE",
      "id": "TGE",
      "ch": "101x",
      "freq": 115.4
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        130.991533,
        30.602156
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "南紀",
      "name2": "NANKI",
      "id": "NKE",
      "ch": "27y",
      "freq": 109.05
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        135.364969,
        33.661264
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "成田",
      "name2": "NARITA",
      "id": "NRE",
      "ch": "126x",
      "freq": 117.9
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        140.362536,
        35.782344
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "VOR/DME",
      "name1": "新潟",
      "name2": "NIIGATA",
      "id": "GTC",
      "ch": null,
      "freq": 115.5
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        139.114886,
        37.958294
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "新潟",
      "name2": "NIIGATA",
      "id": "GTC",
      "ch": "102x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        139.115567,
        37.958253
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "type": "TACAN",
      "name1": "玖珂",
      "name2": "KUGA",
      "id": "IWT",
      "ch": "90x",
      "freq": null
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        132.147394,
        34.079900
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
fs.copyFileSync('./geojson/Navaids.geojson', './geojson/Navaids.geojson.bak2');

// 更新したデータをファイルに保存
fs.writeFileSync('./geojson/Navaids.geojson', JSON.stringify(navaids, null, 2), 'utf8');

console.log('新しいNavaidポイントを追加し、アルファベット順に並べ替え、VOR/DMEとTACANをVORTACに変換しました。');
console.log(`合計 ${navaids.features.length} ポイント`); 