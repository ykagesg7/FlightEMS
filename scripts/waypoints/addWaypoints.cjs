const fs = require('fs');
const path = require('path');
const { convertLatitude, convertLongitude } = require('./convertCoordinates.cjs');

// ウェイポイントファイルのパス
const waypointsFilePath = path.resolve('public/geojson/waypoints/waypoints_A.json');

// 追加するウェイポイントのデータ
const newWaypoints = [
  { id: "ABASA", name1: "アバサ", lat: "242621N", lon: "1231508E" },
  { id: "ABASI", name1: "アバシ", lat: "440001N", lon: "1440834E" },
  { id: "ABECK", name1: "アベック", lat: "325413N", lon: "1304906E" },
  { id: "ABENO", name1: "アベノ", lat: "343532N", lon: "1354156E" },
  { id: "ABIRA", name1: "アビラ", lat: "424754N", lon: "1415751E" },
  { id: "ABKMA", name1: "アブクマ", lat: "370545N", lon: "1402518E" },
  { id: "ABUMI", name1: "アブミ", lat: "324442N", lon: "1313533E" },
  { id: "ACTOR", name1: "アクター", lat: "352734N", lon: "1395025E" },
  { id: "ADDAN", name1: "アッダン", lat: "264110N", lon: "1281829E" },
  { id: "ADDUM", name1: "アダム", lat: "345329N", lon: "1401421E" },
  { id: "ADGUN", name1: "アドガン", lat: "350345N", lon: "1360117E" },
  { id: "ADKET", name1: "アドケット", lat: "351554N", lon: "1392448E" },
  { id: "ADKIP", name1: "アドキップ", lat: "340659N", lon: "1344341E" },
  { id: "ADPAB", name1: "アドパッブ", lat: "272115N", lon: "1284002E" },
  { id: "AGARI", name1: "アガリ", lat: "243103N", lon: "1231125E" },
  { id: "AGATA", name1: "アガタ", lat: "341023N", lon: "1292748E" },
  { id: "AGIKA", name1: "アギカ", lat: "300013N", lon: "1312628E" },
  { id: "AGNES", name1: "アグネス", lat: "352449N", lon: "1395222E" },
  { id: "AGPUK", name1: "アグパック", lat: "342908N", lon: "1360451E" },
  { id: "AGRIT", name1: "アグリット", lat: "324632N", lon: "1291848E" },
  { id: "AIBAR", name1: "アイバー", lat: "243142N", lon: "1242240E" },
  { id: "AIBIS", name1: "アイビス", lat: "375736N", lon: "1385926E" },
  { id: "AIDAH", name1: "アイダー", lat: "352703N", lon: "1395123E" },
  { id: "AIKOK", name1: "アイコク", lat: "423838N", lon: "1431548E" },
  { id: "AINOS", name1: "アイノス", lat: "334059N", lon: "1302303E" },
  { id: "AIRAH", name1: "アイラ", lat: "311409N", lon: "1310615E" },
  { id: "AIRIS", name1: "アイリス", lat: "414248N", lon: "1405727E" },
  { id: "AJISE", name1: "アジセ", lat: "315847N", lon: "1303659E" },
  { id: "AKAGI", name1: "アカギ", lat: "362328N", lon: "1394156E" },
  { id: "AKANA", name1: "アカナ", lat: "335425N", lon: "1334101E" },
  { id: "AKANN", name1: "アカン", lat: "432014N", lon: "1440958E" },
  { id: "AKAOH", name1: "アカオー", lat: "344141N", lon: "1334535E" },
  { id: "AKAPU", name1: "アカプ", lat: "343156N", lon: "1364255E" },
  { id: "AKASI", name1: "アカシ", lat: "343523N", lon: "1350000E" },
  { id: "AKBEN", name1: "アクベン", lat: "330909N", lon: "1395329E" },
  { id: "AKBOX", name1: "アクボックス", lat: "320326N", lon: "1314114E" },
  { id: "AKLIP", name1: "アクリップ", lat: "335659N", lon: "1310057E" },
  { id: "AKUBI", name1: "アクビ", lat: "325702N", lon: "1294039E" },
  { id: "AKVAS", name1: "アクバス", lat: "293513N", lon: "1272753E" },
  { id: "ALBAT", name1: "アルバット", lat: "332152N", lon: "1352629E" },
  { id: "ALBAX", name1: "アルバックス", lat: "233410N", lon: "1251932E" },
  { id: "ALDET", name1: "アルデット", lat: "405441N", lon: "1403947E" },
  { id: "ALISA", name1: "アリサ", lat: "343043N", lon: "1340804E" },
  { id: "ALLAN", name1: "アラン", lat: "341404N", lon: "1345728E" },
  { id: "ALLIE", name1: "アリー", lat: "352637N", lon: "1395105E" },
  { id: "ALPUS", name1: "アルプス", lat: "352657N", lon: "1381749E" },
  { id: "ALVIS", name1: "アルヴィス", lat: "341650N", lon: "1350133E" },
  { id: "AMAGO", name1: "アマゴ", lat: "361950N", lon: "1361743E" },
  { id: "AMAHA", name1: "アマハ", lat: "351248N", lon: "1395402E" },
  { id: "AMARU", name1: "アマル", lat: "384959N", lon: "1395409E" },
  { id: "AMBER", name1: "アンバー", lat: "342942N", lon: "1352043E" },
  { id: "AMEZY", name1: "アメジー", lat: "342827N", lon: "1351851E" }
];

// ファイルを読み込み
const waypointsFile = fs.readFileSync(waypointsFilePath, 'utf8');
const waypoints = JSON.parse(waypointsFile);

// 既存のID一覧を取得
const existingIds = new Set(waypoints.features.map(feature => feature.properties.id));

// 新しいウェイポイントの追加
let addedCount = 0;

newWaypoints.forEach(waypoint => {
  // 既に存在するIDの場合はスキップ
  if (existingIds.has(waypoint.id)) {
    console.log(`SKIP: ${waypoint.id} - 既に存在します`);
    return;
  }

  // 緯度経度を変換（小数点以下4桁に丸める）
  const lat = convertLatitude(waypoint.lat); // convertLatitude内で4桁に丸める
  const lon = convertLongitude(waypoint.lon); // convertLongitude内で4桁に丸める

  // GeoJSON形式のフィーチャーを作成
  const feature = {
    "type": "Feature",
    "properties": {
      "id": waypoint.id,
      "type": "Non-Compulsory",
      "name1": waypoint.name1
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        lon,
        lat
      ]
    }
  };

  // ウェイポイントを追加
  waypoints.features.push(feature);
  addedCount++;
  console.log(`ADD: ${waypoint.id} - ${waypoint.name1} [${lon}, ${lat}]`);
});

// IDでソート
waypoints.features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));

// ファイルに書き戻す
fs.writeFileSync(waypointsFilePath, JSON.stringify(waypoints, null, 2), 'utf8');

console.log(`✅ ${addedCount}件のウェイポイントを追加しました。合計${waypoints.features.length}件となりました。`); 