# ウェイポイントデータについて

このディレクトリには、航空ナビゲーション用のウェイポイントデータが含まれています。データは管理しやすいように以下の方法で分割されています。

## ファイル構造

### アルファベット別の分割

ウェイポイント識別子（ID）の最初の文字に基づいて分割されています。

- `waypoints_A.json` - Aで始まるウェイポイント
- `waypoints_B.json` - Bで始まるウェイポイント
- ...
- `waypoints_Z.json` - Zで始まるウェイポイント

これらのファイルをまとめて参照するためのインデックスは `index.json` にあります。

### 地域別の分割

日本の地域に基づいて分割されています。

- `waypoints_region_hokkaido.json` - 北海道地域のウェイポイント
- `waypoints_region_tohoku.json` - 東北地域のウェイポイント
- `waypoints_region_kanto.json` - 関東地域のウェイポイント
- `waypoints_region_chubu.json` - 中部地域のウェイポイント
- `waypoints_region_kinki.json` - 近畿地域のウェイポイント
- `waypoints_region_chugoku.json` - 中国地域のウェイポイント
- `waypoints_region_shikoku.json` - 四国地域のウェイポイント
- `waypoints_region_kyushu.json` - 九州地域のウェイポイント
- `waypoints_region_okinawa.json` - 沖縄地域のウェイポイント
- `waypoints_region_others.json` - その他の地域のウェイポイント

地域別のインデックスは `regions_index.json` にあります。

## データ形式

すべてのファイルはGeoJSON形式で、以下の構造になっています：

```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ABCDE",
        "type": "Non-Compulsory",
        "name1": "ウェイポイント名"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [経度, 緯度]
      }
    },
    // ...他のウェイポイント
  ]
}
```

### 座標形式

座標データは次の形式で統一されています：
- 経度：ddd.dddd（小数点以下4桁）
- 緯度：dd.dddd（小数点以下4桁）

例：`[135.4414, 33.3644]`

## 使用方法

アプリケーションの必要に応じて、アルファベット別または地域別にデータを読み込むことができます。

例えば、特定のIDのウェイポイントを検索する場合はアルファベット別のファイルを、特定の地域のウェイポイントを表示する場合は地域別のファイルを使用すると効率的です。

## 更新履歴

- 2025-03-28: ウェイポイントのname1を修正（OMUTA: オオムタ→オームタ, OTAKI: オオタキ→オタキ）
- 2025-03-27: O始まりのウェイポイントを47件追加
- 2025-03-26: Oのウェイポイントをアルファベット順にソート
- 2025-03-25: 座標形式を統一（経度：ddd.dddd、緯度：dd.dddd）
- 2025-03-24: A〜Cのウェイポイントをアルファベット順にソート
- 2025-03-23: 新規ウェイポイントの追加（A, B領域）
- 2025-03-22: 元のWaypoints.jsonからアルファベット別および地域別に分割 