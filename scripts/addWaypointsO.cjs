/**
 * waypoints_O.jsonに新しいウェイポイントを追加するスクリプト
 * 度分秒形式の座標を10進数に変換して追加します
 */

const fs = require('fs');
const path = require('path');
const { convertLatitude, convertLongitude } = require('./convertCoordinates.cjs');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_O.json');

// ファイルを読み込み
console.log(`${waypointsFilePath} を読み込み中...`);
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 追加するウェイポイント
const newWaypoints = [
  { id: 'OLIVE', name1: 'オリーブ', lat: '344518N', lon: '1342700E', type: 'Non-Compulsory' },
  { id: 'OLKUN', name1: 'オルクン', lat: '383509N', lon: '1395639E', type: 'Non-Compulsory' },
  { id: 'OLNAS', name1: 'オルナス', lat: '404509N', lon: '1433817E', type: 'Non-Compulsory' },
  { id: 'OLPOL', name1: 'オルポル', lat: '425348N', lon: '1413900E', type: 'Non-Compulsory' },
  { id: 'OLSAK', name1: 'オルサク', lat: '292240N', lon: '1315526E', type: 'Non-Compulsory' },
  { id: 'OLSAS', name1: 'オルサス', lat: '344828N', lon: '1395625E', type: 'Non-Compulsory' },
  { id: 'OLSEG', name1: 'オルセグ', lat: '344801N', lon: '1413536E', type: 'Non-Compulsory' },
  { id: 'OLSER', name1: 'オルサー', lat: '302037N', lon: '1295756E', type: 'Non-Compulsory' },
  { id: 'OLSOP', name1: 'オルソップ', lat: '353105N', lon: '1344729E', type: 'Non-Compulsory' },
  { id: 'OLSOX', name1: 'オルソックス', lat: '403808N', lon: '1414116E', type: 'Non-Compulsory' },
  { id: 'OLSUB', name1: 'オルサブ', lat: '331327N', lon: '1295911E', type: 'Non-Compulsory' },
  { id: 'OLTEN', name1: 'オルテン', lat: '431003N', lon: '1414443E', type: 'Non-Compulsory' },
  { id: 'OLTOM', name1: 'オルトム', lat: '350134N', lon: '1372742E', type: 'Non-Compulsory' },
  { id: 'OLVAL', name1: 'オルバル', lat: '260411N', lon: '1272441E', type: 'Non-Compulsory' },
  { id: 'OLVIN', name1: 'オルビン', lat: '332854N', lon: '1420740E', type: 'Non-Compulsory' },
  { id: 'OMIYA', name1: 'オミヤ', lat: '355506N', lon: '1393551E', type: 'Non-Compulsory' },
  { id: 'OMOGO', name1: 'オモゴ', lat: '334050N', lon: '1331233E', type: 'Non-Compulsory' },
  { id: 'OMUTA', name1: 'オオムタ', lat: '330332N', lon: '1302701E', type: 'Non-Compulsory' },
  { id: 'ONAGA', name1: 'オナガ', lat: '431413N', lon: '1440524E', type: 'Non-Compulsory' },
  { id: 'ONASU', name1: 'オナス', lat: '345253N', lon: '1405514E', type: 'Non-Compulsory' },
  { id: 'ONGHA', name1: 'オンガ', lat: '334719N', lon: '1304712E', type: 'Non-Compulsory' },
  { id: 'ONMAE', name1: 'オンマエ', lat: '343419N', lon: '1344005E', type: 'Non-Compulsory' },
  { id: 'ONSEN', name1: 'オンセン', lat: '244904N', lon: '1412840E', type: 'Non-Compulsory' },
  { id: 'ONSKE', name1: 'オンスケ', lat: '303723N', lon: '1303853E', type: 'Non-Compulsory' },
  { id: 'ONUMI', name1: 'オヌミ', lat: '430649N', lon: '1440524E', type: 'Non-Compulsory' },
  { id: 'OPANO', name1: 'オパノ', lat: '425846N', lon: '1413808E', type: 'Non-Compulsory' },
  { id: 'OPARL', name1: 'オパール', lat: '353532N', lon: '1395302E', type: 'Non-Compulsory' },
  { id: 'OPERA', name1: 'オペラ', lat: '352950N', lon: '1324237E', type: 'Non-Compulsory' },
  { id: 'OPPAR', name1: 'オッパー', lat: '352216N', lon: '1394405E', type: 'Non-Compulsory' },
  { id: 'ORAMO', name1: 'オラモ', lat: '323519N', lon: '1310846E', type: 'Non-Compulsory' },
  { id: 'ORISU', name1: 'オーリス', lat: '452758N', lon: '1410351E', type: 'Non-Compulsory' },
  { id: 'ORVIL', name1: 'オービル', lat: '350243N', lon: '1364540E', type: 'Non-Compulsory' },
  { id: 'OSAMU', name1: 'オサム', lat: '341818N', lon: '1352600E', type: 'Non-Compulsory' },
  { id: 'OSETO', name1: 'オセト', lat: '325037N', lon: '1293747E', type: 'Non-Compulsory' },
  { id: 'OSIRO', name1: 'オシロ', lat: '245450N', lon: '1311113E', type: 'Non-Compulsory' },
  { id: 'OSROB', name1: 'オスロブ', lat: '425537N', lon: '1432234E', type: 'Non-Compulsory' },
  { id: 'OSTEP', name1: 'オステップ', lat: '330832N', lon: '1302632E', type: 'Non-Compulsory' },
  { id: 'OSTIG', name1: 'オスティグ', lat: '362307N', lon: '1393420E', type: 'Non-Compulsory' },
  { id: 'OSUZU', name1: 'オスズ', lat: '322037N', lon: '1315257E', type: 'Non-Compulsory' },
  { id: 'OTAKI', name1: 'オオタキ', lat: '344636N', lon: '1345254E', type: 'Non-Compulsory' },
  { id: 'OTKEV', name1: 'オトケブ', lat: '340613N', lon: '1344218E', type: 'Non-Compulsory' },
  { id: 'OTOWA', name1: 'オトワ', lat: '331455N', lon: '1355253E', type: 'Non-Compulsory' },
  { id: 'OVSID', name1: 'オヴシッド', lat: '315719N', lon: '1303943E', type: 'Non-Compulsory' },
  { id: 'OWARI', name1: 'オワリ', lat: '352106N', lon: '1365858E', type: 'Non-Compulsory' },
  { id: 'OYABE', name1: 'オヤベ', lat: '363618N', lon: '1364513E', type: 'Non-Compulsory' },
  { id: 'OYODO', name1: 'オヨド', lat: '315341N', lon: '1314132E', type: 'Non-Compulsory' },
  { id: 'OZORA', name1: 'オゾラ', lat: '432908N', lon: '1441153E', type: 'Non-Compulsory' }
];

// IDの重複チェック
const existingIds = new Set(waypoints.features.map(feature => feature.properties.id));
const duplicates = [];

// 新しいウェイポイントを追加
let addedCount = 0;

newWaypoints.forEach(wp => {
  // 重複チェック
  if (existingIds.has(wp.id)) {
    duplicates.push(wp.id);
    return; // この項目はスキップ
  }
  
  // 座標を10進数に変換
  const lat = convertLatitude(wp.lat);
  const lon = convertLongitude(wp.lon);
  
  // GeoJSON形式のフィーチャーオブジェクトを作成
  const feature = {
    type: "Feature",
    properties: {
      id: wp.id,
      type: wp.type,
      name1: wp.name1
    },
    geometry: {
      type: "Point",
      coordinates: [lon, lat]
    }
  };
  
  // ウェイポイントを追加
  waypoints.features.push(feature);
  addedCount++;
  existingIds.add(wp.id); // 追加したIDをセットに追加（後続の重複チェック用）
});

// IDでソート
waypoints.features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));

// ファイルに書き戻す
fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');

console.log(`✅ ${addedCount}件のウェイポイントをwaypoints_O.jsonに追加しました`);

if (duplicates.length > 0) {
  console.log(`⚠️ 以下のIDは重複しているため追加をスキップしました: ${duplicates.join(', ')}`);
} 