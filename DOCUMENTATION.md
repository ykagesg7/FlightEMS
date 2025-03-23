# FlightAcademyTsx - 技術ドキュメント

## プロジェクト概要
FlightAcademyTsxは、フライトプランニング用の対話型ウェブアプリケーションです。パイロットや航空学生がフライトルートを計画し、航法データを視覚化して、飛行計画の詳細を計算することができます。React、TypeScript、およびLeafletマップライブラリを使用して構築されています。

### 主な機能
- 対話型マップインターフェースでの経路計画
- 空港、ウェイポイント、NAVAIDの視覚化
- フライトパラメータ（速度、高度、出発時間）の設定
- 詳細なフライトサマリー（総距離、ETE、ETA、各セグメントの詳細）の計算
- ルートセグメントごとの磁方位、速度、高度、ETAの表示
- カスタムウェイポイントの追加と管理

## 開発環境のセットアップ

基本的なセットアップ手順については、[README.md](./README.md)を参照してください。

## フォルダ構成と機能

### プロジェクト構造
```
FlightAcademyTsx/
├── public/
│   └── geojson/         # 空港、ウェイポイント、NAVAIDなどの地理データ
│       ├── Airports.geojson
│       ├── Navaids.geojson
│       ├── Waypoints.json
│       └── RJFA.geojson  # 地域特有の航空データ
├── src/
│   ├── components/       # Reactコンポーネント
│   ├── hooks/            # カスタムReactフック
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ関数
├── package.json
└── tsconfig.json
```

### 主要ディレクトリとファイルの説明

#### `src/components/`
アプリケーションのUIコンポーネントを含むディレクトリです。

- **MapTab.tsx**: 地図表示と対話機能を担当する主要コンポーネント。Leafletを使用して地図、ウェイポイント、NAVAIDなどを表示します。
- **FlightParameters.tsx**: 速度、高度、出発時刻などのフライトパラメータを設定するコンポーネント。
- **FlightSummary.tsx**: 総距離、ETE、ETAなどの計算結果を表示し、各ルートセグメントの詳細情報も表示します。
- **PlanningTab.tsx**: フライトプラン全体の管理と計算を行うメインコンポーネント。
- **RoutePlanning.tsx**: 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行います。
- **WaypointList.tsx**: フライトプランに含まれるウェイポイントのリストを表示・管理します。
- **WaypointForm.tsx**: カスタムウェイポイントの追加や編集用フォーム。

#### `src/types/`
アプリケーション全体で使用される型定義を含みます。

- **index.ts**: 主要型定義（FlightPlan、Waypoint、Airport、Navaid、RouteSegmentなど）を含みます。

```typescript
// 主要な型定義の例
export interface FlightPlan {
  departure: Airport | null;
  arrival: Airport | null;
  waypoints: Waypoint[];
  speed: number;
  altitude: number;
  departureTime: string;
  tas: number;
  mach: number;
  totalDistance: number;
  ete?: string;
  eta?: string;
  routeSegments?: RouteSegment[];
}

export interface RouteSegment {
  from: string;
  to: string;
  speed: number; // CAS
  bearing: number; // 磁方位
  altitude: number;
  eta?: string; // 予定到着時刻
  distance?: number;
}
```

#### `src/utils/`
計算や変換などのユーティリティ関数を含みます。

- **index.ts**: 基本的なユーティリティ関数（距離計算、TAS計算、時間フォーマットなど）を提供します。
- **bearing.ts**: 磁方位計算関連の関数を提供します。
- **format.ts**: 表示フォーマット関連の関数を提供します。

主な機能:
- `calculateDistance`: 2点間の距離を海里単位で計算
- `calculateTAS`: 指示対気速度(CAS)から真対気速度(TAS)を計算
- `calculateMach`: TASからマッハ数を計算
- `calculateETE`: 予想飛行時間を計算
- `calculateETA`: 予想到着時刻を計算
- `calculateMagneticBearing`: 2点間の磁方位を計算
- `formatTime`: 分を時間:分形式にフォーマット
- `formatDMS`: 10進数の緯度経度を度分秒形式にフォーマット

#### `src/hooks/`
カスタムReactフックを含みます。

- **useMapRoute.ts**: マップ上のルート表示用のデータを準備するフック。

```typescript
// useMapRouteフックの例
export const useMapRoute = (flightPlan: FlightPlan) => {
  return useMemo(() => {
    const points: [number, number][] = [];
    // 出発地点、ウェイポイント、到着地点の座標を配列に変換
    if (flightPlan.departure) {
      points.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
    }
    flightPlan.waypoints.forEach(waypoint => {
      points.push([waypoint.latitude, waypoint.longitude]);
    });
    if (flightPlan.arrival) {
      points.push([flightPlan.arrival.latitude, flightPlan.arrival.longitude]);
    }
    return points;
  }, [flightPlan]);
};
```

#### `public/geojson/`
マップに表示するための地理データを含みます。

- **Airports.geojson**: 空港データ
- **Navaids.geojson**: 無線航法施設データ
- **Waypoints.json**: ウェイポイントデータ
- **RJFA.geojson**: 特定エリアの航空データ

#### ウェイポイントデータの管理体制

ウェイポイントデータは以下の方法で体系的に管理されています：

1. **マスターファイル**：
   - `Waypoints.json` - すべてのウェイポイントを含む総合ファイル

2. **分割ファイル**：
   - **アルファベット別**：`public/geojson/waypoints/waypoints_A.json`〜`waypoints_Z.json`
   - **地域別**：`public/geojson/waypoints/waypoints_region_*.json`（北海道、東北、関東など）

3. **データフォーマット**：
   - 座標形式の統一（経度：ddd.dddd、緯度：dd.dddd - 小数点以下4桁）
   - 各ウェイポイントはIDのアルファベット順にソート
   - 各ウェイポイントは `id`, `type`（Compulsory/Non-Compulsory）, `name1`（読み）の属性を持つ

4. **管理スクリプト**：
   - `scripts/` ディレクトリに管理用スクリプトを集約
   - 座標変換、ウェイポイント追加、ソート、name1フィールド更新などの機能
   - すべての変更は `mergeWaypoints.cjs` と `split-waypoints-regions.mjs` を通じて全ファイルに反映

## 実装状況の概要

最新の実装状況と開発計画の詳細については、[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md)を参照してください。

### 主要な実装済み機能
- 基本的なマップ表示（Leaflet使用）
- 空港、ウェイポイント、NAVAIDの表示
- フライトパラメータ（速度、高度、出発時間）の設定と計算
- フライトプランの作成と管理
- ルートセグメントごとの詳細情報（速度、磁方位、高度、ETA）の表示

## 主要コンポーネントの実装詳細

### MapTab.tsx
マップ表示の中心コンポーネント。Leafletを使用して対話型地図を提供し、ウェイポイント、空港、NAVAIDを表示します。

```typescript
// 主要な機能の例
const MapContent: React.FC<{ flightPlan: FlightPlan, map: L.Map | null, setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>> }> = ({ flightPlan, map, setFlightPlan }) => {
  // NAVAIDレイヤーの作成例
  const overlayLayers = useMemo(() => ({
    "Navaids": L.geoJSON(null, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: getNavaidColor(feature.properties.type),
          color: '#000',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.6
        });
      },
      onEachFeature: (feature, layer) => {
        // ポップアップ内容の設定
        layer.bindPopup(`
          <div class="navaid-custom-popup">
            <div class="navaid-popup-header">${feature.properties.id}</div>
            <div>${feature.properties.name}</div>
            <div>Type: ${feature.properties.type}</div>
            <div>CH: ${feature.properties.ch || 'N/A'}</div>
            <button class="add-to-route-btn px-2 py-1 mt-2 bg-blue-500 text-white rounded text-sm">Add to Route</button>
          </div>
        `);

        // クリックイベントの処理
        layer.on('click', () => {
          // Add to Routeボタンのイベント処理
          setTimeout(() => {
            const addButton = document.querySelector('.navaid-custom-popup .add-to-route-btn');
            if (addButton) {
              addButton.addEventListener('click', (e) => {
                e.preventDefault();
                // NAVAIDをウェイポイントとして追加するロジック
                // ...
              });
            }
          }, 10);
        });
      }
    }),
    // 他のレイヤー定義...
  }), []);
};
```

### PlanningTab.tsx
フライトプランニング機能の中心コンポーネント。フライトパラメータの管理、ルート計画、フライトサマリーの計算を担当します。

```typescript
// ルート情報の計算例
const updateFlightSummary = React.useCallback(() => {
  let totalDistance = 0;
  const routeSegments: RouteSegment[] = [];
  let cumulativeEte = 0;

  // 出発地、経由地点、到着地を含む配列を作成
  const allPoints = flightPlan.departure 
    ? [flightPlan.departure, ...flightPlan.waypoints, flightPlan.arrival].filter(Boolean)
    : [];

  // 各セグメントごとに距離、方位、到着時刻を計算
  for (let i = 0; i < allPoints.length - 1; i++) {
    const currentPoint = allPoints[i];
    const nextPoint = allPoints[i + 1];
    
    if (currentPoint && nextPoint) {
      // 距離、方位、ETEなどの計算と累積
      // ...
      routeSegments.push({
        from: currentPoint.id,
        to: nextPoint.id,
        speed: flightPlan.speed,
        bearing: bearing,
        altitude: flightPlan.altitude,
        eta: segmentEta,
        distance: distance
      });
    }
  }

  // FlightPlanステートを更新
  setFlightPlan(prevFlightPlan => ({
    ...prevFlightPlan,
    totalDistance: totalDistance,
    ete: eteFormatted,
    eta: etaFormatted,
    routeSegments: routeSegments
  }));
}, [flightPlan]);
```

### RoutePlanning.tsx
フライトプラン全体の管理と計算を行うメインコンポーネント。

```typescript
// ルート情報の計算例
const updateFlightSummary = React.useCallback(() => {
  let totalDistance = 0;
  const routeSegments: RouteSegment[] = [];
  let cumulativeEte = 0;

  // 出発地、経由地点、到着地を含む配列を作成
  const allPoints = flightPlan.departure 
    ? [flightPlan.departure, ...flightPlan.waypoints, flightPlan.arrival].filter(Boolean)
    : [];

  // 各セグメントごとに距離、方位、到着時刻を計算
  for (let i = 0; i < allPoints.length - 1; i++) {
    const currentPoint = allPoints[i];
    const nextPoint = allPoints[i + 1];
    
    if (currentPoint && nextPoint) {
      // 距離、方位、ETEなどの計算と累積
      // ...
      routeSegments.push({
        from: currentPoint.id,
        to: nextPoint.id,
        speed: flightPlan.speed,
        bearing: bearing,
        altitude: flightPlan.altitude,
        eta: segmentEta,
        distance: distance
      });
    }
  }

  // FlightPlanステートを更新
  setFlightPlan(prevFlightPlan => ({
    ...prevFlightPlan,
    totalDistance: totalDistance,
    ete: eteFormatted,
    eta: etaFormatted,
    routeSegments: routeSegments
  }));
}, [flightPlan]);
```

## 技術的考慮事項
- **状態管理**: ReactのコンテキストとuseStateフックを使用
- **地図ライブラリ**: Leafletを使用して対話型マップを実現
- **GeoJSON処理**: 航空データをGeoJSON形式で管理・表示
- **計算処理**: 航空計算（TAS、Mach、磁方位、ETEなど）を実装
- **レスポンシブデザイン**: Tailwind CSSを使用したレスポンシブUIの実装

## 開発者向けガイドライン
新機能の追加や既存機能の修正を行う際は、以下の点に注意してください：

1. TypeScriptの型定義を適切に行う
2. コンポーネントの責務を明確に分離する
3. パフォーマンスを考慮したコードを書く（特にマップ関連の処理）
4. UIの一貫性を保つ
5. 変更前に既存の機能が損なわれないことを確認する

## 環境変数と設定

環境変数の設定方法や本番環境へのデプロイについては、[README.md](./README.md)を参照してください。

## 利用における注意事項
このプロジェクトは航空関連の教育・訓練を目的としており、実際のフライトナビゲーションに使用することは推奨されません。訓練と学習の補助ツールとしてご利用ください。 