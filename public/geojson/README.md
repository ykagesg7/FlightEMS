# FlightAcademyウェイポイントデータ管理ガイド

## データ構造

FlightAcademyのウェイポイントデータは以下の階層で管理されています：

```
public/geojson/
├── Waypoints.json               # すべてのウェイポイントを統合したメインファイル
├── waypoints/                   # 分割されたウェイポイントデータディレクトリ
│   ├── waypoints_A.json         # アルファベット順のウェイポイントファイル
│   ├── waypoints_B.json
│   ├── ... (他のアルファベット)
│   ├── waypoints_region_hokkaido.json  # 地域別ウェイポイントファイル
│   ├── waypoints_region_tohoku.json
│   ├── ... (他の地域)
│   ├── index.json               # アルファベット順ファイルのインデックス
│   └── regions_index.json       # 地域別ファイルのインデックス
└── split-waypoints-regions.mjs  # 地域別分割スクリプト
```

## ウェイポイントデータ形式

各ウェイポイントはGeoJSON形式で、以下の構造を持ちます：

```json
{
  "type": "Feature",
  "properties": {
    "id": "WAYPOINT_ID",      // 識別子（通常5文字）
    "type": "Compulsory",     // タイプ：Compulsory または Non-Compulsory
    "name1": "ウェイポイント名" // 日本語名称
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      139.7670,              // 経度（ddd.dddd形式、小数点以下4桁）
      35.6814                // 緯度（dd.dddd形式、小数点以下4桁）
    ]
  }
}
```

## ウェイポイントの分類

ウェイポイントは以下の方法で分類されています：

1. **アルファベット別**: ウェイポイントIDの先頭文字によるファイル分け
2. **地域別**: 以下の10地域に分類
   - 北海道地域、東北地域、関東地域、中部地域、近畿地域
   - 中国地域、四国地域、九州地域、沖縄地域、その他地域

## 新しいウェイポイントの追加手順

新しいウェイポイントを追加する手順は以下の通りです：

1. **アルファベット別ファイルに追加**

   適切なアルファベットファイル（例：`waypoints_A.json`）に新しいウェイポイントを追加します。

   ```json
   {
     "type": "Feature",
     "properties": {
       "id": "ANEW1",
       "type": "Non-Compulsory",  // または "Compulsory"
       "name1": "新規ポイント"
     },
     "geometry": {
       "type": "Point",
       "coordinates": [
         135.4500,
         34.6800
       ]
     }
   }
   ```

2. **マージスクリプトの実行**

   すべてのウェイポイントをマージして`Waypoints.json`を更新します：

   ```bash
   node scripts/mergeWaypoints.cjs
   ```

3. **地域分割スクリプトの実行**

   地域別ファイルを更新します：

   ```bash
   node public/geojson/split-waypoints-regions.mjs
   ```

## ソート順とデータ整合性

* 各アルファベット別ファイル内のウェイポイントは、ID（例：ABASA, ABASI, ...）のアルファベット順に並べられています
* 新しいウェイポイントを追加した後、ファイル内のウェイポイントを再ソートするには、以下のようなスクリプトを実行します：

  ```bash
  node scripts/sortWaypointsX.cjs  # Xは対象のアルファベット（A, B, C等）
  ```

* すべてのウェイポイントの座標は、経度：ddd.dddd、緯度：dd.dddd形式で統一されています

## 注意事項

- **データの整合性**: 常に上記の手順に従い、必ずマージと分割の両方を実行してください。
- **タイプの保持**: ウェイポイントの`type`属性（`Compulsory`または`Non-Compulsory`）は維持されます。
- **IDの重複**: 同じIDのウェイポイントが存在しないように注意してください。
- **バックアップ**: 重要な変更を行う前には、既存のファイルをバックアップしてください。

## 開発向け情報

- マージスクリプト（`mergeWaypoints.cjs`）はCommonJSモジュールとして実装されています
- 分割スクリプト（`split-waypoints-regions.mjs`）はESモジュールとして実装されています
- 地域の座標範囲はスクリプト内の`regions`オブジェクトで定義されています

## その他のGeoJSONデータ

- `ACC_Sector_High.geojson` - 高高度セクター情報
- `ACC_Sector_Low.geojson` - 低高度セクター情報
- `Airports.geojson` - 空港データ
- `Navaids.geojson` - 航法援助施設データ
- `RAPCON.geojson` - レーダー進入管制データ
- `RestrictedAirspace.geojson` - 制限空域データ
- `TrainingAreaCivil.geojson` - 民間訓練区域
- `TrainingAreaHigh.geojson` - 高高度訓練区域
- `TrainingAreaLow.geojson` - 低高度訓練区域

## 利用方法

ウェイポイントデータを利用する場合は、分割されたファイルを利用することをお勧めします。これにより、アプリケーションのパフォーマンスが向上します。

例えば、特定の地域のウェイポイントのみを表示したい場合は、該当する地域のファイル（例：`waypoints/waypoints_region_kanto.json`）だけを読み込むことができます。

## トラブルシューティング

- **データが反映されない**: ブラウザのキャッシュをクリアするか、強制リロード（Ctrl+F5）してください
- **Non-Compulsoryデータが消失**: マージと分割の両方のスクリプトがプロパティを維持していることを確認してください
- **スクリプトエラー**: Node.jsのバージョンが互換性があることを確認してください（v14以上推奨）

## 更新履歴

- 2025-03-28: ウェイポイントのname1を修正（OMUTA: オオムタ→オームタ, OTAKI: オオタキ→オタキ）
- 2025-03-27: O始まりのウェイポイントを47件追加
- 2025-03-26: Oのウェイポイントをアルファベット順にソート
- 2025-03-25: 座標形式を統一（経度：ddd.dddd、緯度：dd.dddd）
- 2025-03-24: A〜Cのウェイポイントをアルファベット順にソート
- 2025-03-23: 新規ウェイポイントの追加（A, B領域）
- 2025-03-23: Non-Compulsoryタイプのウェイポイントデータ修正、READMEの包括的更新
- 2025-03-22: ウェイポイントデータをアルファベット別および地域別に分割 