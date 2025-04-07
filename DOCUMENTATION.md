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
- 出発空港選択時の地上標高と地上気温の自動設定
- WeatherAPIを使用した空港の最新気象情報の表示と活用
- 気象データキャッシュ機能による効率的なデータ共有とAPI呼び出しの最適化
- マニューバービューアによる編隊飛行手順の視覚的学習支援

## 関連ドキュメント
- [基本情報とセットアップ](./README.md)
- [開発状況と計画](./DEVELOPMENT_STATUS.md)
- [開発参加ガイド](./CONTRIBUTING.md)

## 開発環境のセットアップ

基本的なセットアップ手順については、[README.md](./README.md)を参照してください。

## フォルダ構成と機能

### プロジェクト構造
```
FlightAcademyTsx/
├── public/
│   ├── geojson/         # 空港、ウェイポイント、NAVAIDなどの地理データ
│   │   ├── Airports.geojson
│   │   ├── Navaids.geojson
│   │   ├── Waypoints.json
│   │   └── RJFA.geojson  # 地域特有の航空データ
│   └── maneuver/        # マニューバーアニメーションファイル
│       ├── straight_join.html
│       ├── turning_join.html
│       ├── straight_overshoot.html
│       ├── turning_overshoot.html
│       └── breakout.html
├── src/
│   ├── components/       # Reactコンポーネント
│   ├── contexts/         # React Contextの定義
│   ├── hooks/            # カスタムReactフック
│   ├── types/            # TypeScript型定義
│   ├── api/              # API関連の関数
│   └── utils/            # ユーティリティ関数
├── package.json
└── tsconfig.json
```

### 主要ディレクトリとファイルの説明

#### `src/components/`
アプリケーションのUIコンポーネントを含むディレクトリです。

- **MapTab.tsx**: 地図表示と対話機能を担当する主要コンポーネント。Leafletを使用して地図、ウェイポイント、NAVAIDなどを表示します。レイヤー管理と地図操作機能を実装しています。空港マーカーのクリック時には気象情報を含む詳細なポップアップが表示されます。キャッシュから気象データを取得し、無い場合のみAPIから取得します。Navaidにマウスオーバーすると「ID（日本語名 英語名）」形式のツールチップが表示され、クリック時のポップアップでも同様のヘッダー表示と詳細情報（Type, CH, Freq, Position）を確認できます。
- **FlightParameters.tsx**: 速度、高度、出発時刻などのフライトパラメータを設定するコンポーネント。TASとMachの数値を微調整するボタンも実装し、高精度な飛行パラメータの設定が可能です。出発空港が選択されると、その空港の標高が地上標高に自動的に設定され、WeatherAPIから取得した最新の気温データが地上気温に反映されます。データ取得中はローディングインジケーターが表示されます。WeatherCacheContextを使用して、1時間有効なキャッシュから気象データを取得します。
- **FlightSummary.tsx**: 総距離、ETE、ETAなどの計算結果を表示し、各ルートセグメントの詳細情報も表示します。
- **PlanningTab.tsx**: フライトプラン全体の管理と計算を行うメインコンポーネント。GeoJSONから空港データを取得し、Airports型のオブジェクトとして処理します。空港データには標高情報（Elev(ft)）などの詳細情報も含まれています。
- **RoutePlanning.tsx**: 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行います。
- **WaypointList.tsx**: フライトプランに含まれるウェイポイントのリストを表示・管理します。
- **WaypointForm.tsx**: カスタムウェイポイントの追加や編集用フォーム。
- **NavaidSelector.tsx**: 無線航法施設（NAVAID）の選択と追加を行うコンポーネント。磁方位と距離を指定することで、NAVAIDからのオフセットポイントをウェイポイントとして追加できます。WaypointFormコンポーネントとUIデザインを統一し、一貫したユーザー体験を提供します。
- **LearningTab.tsx**: 学習コンテンツを提供するタブコンポーネント。編隊飛行の基本、Rejoin、Overshoot、Breakoutなどの知識をスライド形式で表示します。ManeuverViewerコンポーネントを内包し、特定のスライドで関連するマニューバーアニメーションを表示します。

#### `src/contexts/`
グローバルな状態管理のためのReact Contextを含むディレクトリです。

- **WeatherCacheContext.tsx**: 気象データキャッシュを管理するContext。React Context APIを使用して、異なるコンポーネント間で気象データを共有し、不要なAPI呼び出しを防ぎます。

```typescript
// WeatherCacheContext.tsxの主要部分
import React, { createContext, useState, useContext, ReactNode } from 'react';

// WeatherDataの型定義
export interface WeatherData {
  current?: {
    condition?: {
      text: string;
      japanese?: string;
      icon?: string;
    };
    temp_c?: number;
    // その他のプロパティ...
  };
  // その他のプロパティ...
}

// キャッシュの型定義
export interface WeatherCache {
  [airportId: string]: {
    data: WeatherData;
    timestamp: number;
  };
}

// キャッシュの有効期間 (1時間 = 60 * 60 * 1000ミリ秒)
export const CACHE_DURATION = 60 * 60 * 1000;

// Providerコンポーネント
export const WeatherCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weatherCache, setWeatherCache] = useState<WeatherCache>({});

  return (
    <WeatherCacheContext.Provider value={{ weatherCache, setWeatherCache }}>
      {children}
    </WeatherCacheContext.Provider>
  );
};

// カスタムフック
export const useWeatherCache = (): { 
  weatherCache: WeatherCache; 
  setWeatherCache: React.Dispatch<React.SetStateAction<WeatherCache>>
} => {
  const context = useContext(WeatherCacheContext);
  if (context === undefined) {
    throw new Error('useWeatherCache must be used within a WeatherCacheProvider');
  }
  return context;
};

// ユーティリティ関数：キャッシュから気象データを取得
export const getCachedWeatherData = (
  cache: WeatherCache,
  airportId: string
): { data: WeatherData | null; isValid: boolean } => {
  const cachedEntry = cache[airportId];
  const now = Date.now();

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    return { data: cachedEntry.data, isValid: true };
  }

  return { data: cachedEntry?.data || null, isValid: false };
};
```

#### `src/api/`
外部APIとの通信を行う関数を含むディレクトリです。

- **weather.ts**: WeatherAPIとの通信処理を行う関数を提供します。空港の位置情報（緯度・経度）から気象データを取得し、必要な情報をフィルタリングします。

```typescript
// Weather APIからデータを取得する関数
export async function fetchWeatherData(lat: number, lon: number) {
  try {
    // 環境変数からAPIキーを取得
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY || 'デフォルトキー';
    
    // 直接Weather APIにリクエスト
    console.log(`直接Weather APIを呼び出します: lat=${lat}, lon=${lon}`);
    const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: apiKey,
        q: `${lat},${lon}`,
        days: 1,
        aqi: 'no'
      }
    });
    
    return filterWeatherData(response.data);
  } catch (error) {
    console.error('天気データの取得に失敗しました:', error);
    throw error;
  }
}
```

#### `src/types/`
アプリケーション全体で使用される型定義を含みます。

- **index.ts**: 主要型定義（FlightPlan、Waypoint、Airport、Navaid、RouteSegmentなど）を含みます。

```typescript
// 主要な型定義の例
export interface Airport {
  value: string;
  name: string;
  label: string;
  type: 'civilian' | 'military' | 'joint';
  latitude: number;
  longitude: number;
  properties?: {
    id?: string;
    name1?: string;
    type?: string;
    "Elev(ft)"?: number;
    RWY1?: string;
    RWY2?: string;
    RWY3?: string;
    RWY4?: string;
    "MAG Var"?: number;
    [key: string]: any;
  };
}

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
  groundTempC: number; // 地上気温 (摂氏)
  groundElevationFt: number; // 地上標高 (フィート)
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
- `calculateAirspeeds`: 高精度な計算モデルを使用して各種対気速度を計算

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

- **Airports.geojson**: 空港データ（ID、名称、標高、滑走路情報など）
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

## 主要コンポーネントの実装詳細

### MapTab.tsx
マップ表示の中心コンポーネント。Leafletを使用して対話型地図を提供し、ウェイポイント、空港、NAVAIDを表示します。レイヤー管理と地図操作機能を実装しています。空港マーカーのクリック時には気象情報を含む詳細なポップアップが表示されます。WeatherCacheContextを使用して、同一空港の気象データをキャッシュし、重複API呼び出しを削減します。

```typescript
// 空港の気象情報を取得して表示する関数 (キャッシュ対応版)
const fetchAirportWeather = (
  feature: GeoJSON.Feature, 
  map: L.Map,
  weatherCache: WeatherCache, 
  setWeatherCache: React.Dispatch<React.SetStateAction<WeatherCache>>
) => {
  if (!feature.properties || !feature.geometry) return;
  
  const airportId = feature.properties.id;
  const geometry = feature.geometry as GeoJSON.Point;
  const [longitude, latitude] = geometry.coordinates;
  
  // ローディングポップアップを表示
  const loadingPopup = L.popup({
    className: 'airport-custom-popup',
    maxWidth: 300
  })
    .setLatLng([latitude, longitude])
    .setContent(loadingPopupContent)
    .openOn(map);
  
  // キャッシュの確認
  const cachedEntry = weatherCache[airportId];
  const now = Date.now();
  
  // キャッシュが存在し、かつ有効期限内の場合
  if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
    console.log(`${airportId}の気象情報をキャッシュから取得しました`);
    const weatherPopupContent = createWeatherPopupContent(feature.properties, cachedEntry.data);
    loadingPopup.setContent(weatherPopupContent);
    loadingPopup.update();
    return; // API呼び出しをスキップ
  }
  
  // キャッシュがないか期限切れの場合は新しく取得
  fetchWeatherData(latitude, longitude)
    .then(weatherData => {
      // ポップアップを更新
      const weatherPopupContent = createWeatherPopupContent(feature.properties, weatherData);
      loadingPopup.setContent(weatherPopupContent);
      loadingPopup.update();
      
      // キャッシュを更新
      setWeatherCache(prevCache => ({
        ...prevCache,
        [airportId]: { data: weatherData, timestamp: Date.now() }
      }));
    })
    .catch(error => {
      // エラー処理
      // ...
    });
};
```

### FlightParameters.tsx
フライトパラメータを設定するコンポーネント。速度（CAS）、高度、出発時刻の入力と、それに基づくTAS、Mach、予想到着時刻（ETA）などの計算を行います。出発空港選択時に地上標高と地上気温を自動的に設定する機能も実装しています。WeatherCacheContextを使用して、気象データをキャッシュから取得し、API呼び出しを最適化しています。

```typescript
// 出発空港が選択されたら、その標高と地上気温を自動設定する (キャッシュ対応版)
useEffect(() => {
  if (flightPlan.departure) {
    // Airport型のpropertiesから標高データを取得
    const elevation = flightPlan.departure.properties?.["Elev(ft)"];
    
    if (elevation !== undefined) {
      console.log(`空港「${flightPlan.departure.name}」の標高 ${elevation}ft を設定しました`);
      setFlightPlan(prev => ({
        ...prev,
        groundElevationFt: Number(elevation)
      }));
    }

    // 地上気温の設定 (キャッシュ確認と利用)
    if (flightPlan.departure.latitude && flightPlan.departure.longitude) {
      const airportId = flightPlan.departure.value; // 空港ID
      const cachedEntry = weatherCache[airportId];
      const now = Date.now();
      
      // キャッシュが存在し、かつ有効期限内の場合はキャッシュを使用
      if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
        const cachedTemp = cachedEntry.data.current?.temp_c;
        if (cachedTemp !== undefined) {
          console.log(`キャッシュから空港「${flightPlan.departure.name}」の地上気温 ${cachedTemp}℃ を設定しました`);
          setFlightPlan(prev => ({
            ...prev,
            groundTempC: Math.round(cachedTemp)
          }));
          return; // API呼び出しをスキップ
        }
      }
      
      // キャッシュがないか期限切れの場合はAPIから取得
      setIsLoading(true);
      fetchWeatherData(flightPlan.departure.latitude, flightPlan.departure.longitude)
        .then((weatherData: WeatherData) => {
          if (weatherData.current?.temp_c !== undefined) {
            const temp_c = weatherData.current.temp_c;
            console.log(`APIから空港「${flightPlan.departure?.name}」の地上気温 ${temp_c}℃ を取得・設定しました`);
            setFlightPlan(prev => ({
              ...prev,
              groundTempC: Math.round(temp_c)
            }));
            
            // 取得したデータをキャッシュに保存
            setWeatherCache(prevCache => ({
              ...prevCache,
              [airportId]: { data: weatherData, timestamp: Date.now() }
            }));
          }
        })
        .catch(error => {
          console.error('地上気温の取得に失敗しました:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }
}, [flightPlan.departure, setFlightPlan, weatherCache, setWeatherCache]);
```

### PlanningTab.tsx
フライトプランニング機能の中心コンポーネント。フライトパラメータの管理、ルート計画、フライトサマリーの計算を担当します。GeoJSONからのデータ読み込み処理も行います。

```typescript
// 空港データを取得するuseEffect
React.useEffect(() => {
  const fetchAirports = async () => {
    try {
      const response = await fetch('/geojson/Airports.geojson');
      const geojsonData = await response.json();
      const airportList = geojsonData.features.map((feature: any) => ({
        value: feature.properties.id,
        label: `${feature.properties.name1} (${feature.properties.id})`,
        name: feature.properties.name1,
        type: feature.properties.type,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        // GeoJSONのpropertiesを含める
        properties: { ...feature.properties },
      }));

      // 空港タイプでグループ化
      const groupedAirports = Object.entries(groupBy(airportList, 'type')).map(([type, options]) => ({
        label: type,
        options,
      }));
      setAirportOptions(groupedAirports);
    } catch (error) {
      console.error("空港データの読み込みに失敗しました", error);
    }
  };

  fetchAirports();
  // ...
}, []);
```

### LearningTab.tsx
学習コンテンツを提供する中心コンポーネント。編隊飛行の知識をスライド形式で表示し、特定のスライドではManeuverViewerコンポーネントを通じて関連するマニューバーアニメーションを表示します。

```typescript
// ManeuverViewerコンポーネント - マニューバーアニメーションを表示
const ManeuverViewer: React.FC<ManeuverViewerProps> = ({ slideNumber, isVisible }) => {
  // スライド番号に基づいて表示するHTMLファイルを決定
  const getManeuverFile = (slideNum: number): string => {
    // 特定のスライドに対応するマニューバーファイルをマッピング
    const maneuverMap: Record<number, string> = {
      5: '/maneuver/straight_join.html', // 例：スライド5にはstraight_join.htmlを表示
      7: '/maneuver/turning_join.html',  // 例：スライド7にはturning_join.htmlを表示
      12: '/maneuver/straight_overshoot.html',
      14: '/maneuver/turning_overshoot.html',
      18: '/maneuver/breakout.html',
      // 必要に応じて他のスライドとファイルのマッピングを追加
    };

    return maneuverMap[slideNum] || '';
  };

  const maneuverFile = getManeuverFile(slideNumber);

  if (!isVisible || !maneuverFile) {
    return null;
  }

  return (
    <div className="maneuver-viewer mt-4 border-2 border-indigo-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 py-2 px-4 font-semibold text-indigo-800 flex justify-between items-center">
        <span>詳細図解ビューア</span>
        <a 
          href={maneuverFile}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          別ウィンドウで開く
        </a>
      </div>
      <iframe 
        src={maneuverFile} 
        className="w-full h-[500px]"
        title={`Maneuver Visualization for Slide ${slideNumber}`}
        allowFullScreen
      />
    </div>
  );
};

// LearningTabコンポーネントの主要部分
const LearningTab: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showManeuver, setShowManeuver] = useState(false);
  // ...

  // 特定のスライドにマニューバービューアが利用可能かチェック
  const hasManeuverViewer = (slideNum: number): boolean => {
    const slidesWithManeuvers = [5, 7, 12, 14, 18]; // マニューバー対応スライド
    return slidesWithManeuvers.includes(slideNum);
  };

  // トグルマニューバービューア
  const toggleManeuverViewer = () => {
    setShowManeuver(!showManeuver);
  };

  // ...

  return (
    <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
      {/* ナビゲーションコントロール */}
      <div className="navigation bg-indigo-800 text-center p-4 flex justify-between items-center">
        {/* ... */}
        <div>
          {hasManeuverViewer(currentSlide) && (
            <button 
              className="nav-btn bg-green-500 text-white border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold hover:bg-green-600 mr-2"
              onClick={toggleManeuverViewer}
            >
              {showManeuver ? '図解を隠す' : '図解を表示'}
            </button>
          )}
          {/* ... */}
        </div>
      </div>

      {/* スライドコンテンツ */}
      {/* ... */}

      {/* マニューバービューアの埋め込み */}
      <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
      
      {/* ... */}
    </div>
  );
};
```

## 技術的考慮事項
- **状態管理**: 
  - ReactのContext APIを使用した効率的な状態管理
  - `WeatherCacheContext`を使用した気象データのグローバルな共有
  - useStateフックを使用したコンポーネントレベルの状態管理
- **地図ライブラリ**: Leafletを使用して対話型マップを実現
- **GeoJSON処理**: 航空データをGeoJSON形式で管理・表示
- **計算処理**: 航空計算（TAS、Mach、磁方位、ETEなど）を実装。TASは1kt単位、Machは0.01単位で微調整可能
- **レスポンシブデザイン**: Tailwind CSSを使用したレスポンシブUIの実装
- **コードの最適化**: 未使用変数の削除やコンポーネント間のデザイン統一など、コードの品質と保守性を重視
- **UIの一貫性**: 関連するコンポーネント間でデザインパターンを統一し、ユーザー体験を向上
- **Leafletイベント処理**: レイヤーグループ内の個別要素に対するイベントハンドリングを実装し、クリック操作の信頼性を向上
- **Weather API連携**: 
  - 非同期データ取得とエラーハンドリングによる安定した気象情報表示
  - ローディング状態の視覚的フィードバックの提供
  - 気象データキャッシュによるAPI呼び出しの最適化（1時間有効）
  - タブ切り替え時や同一空港選択時の重複API呼び出しを抑制
- **型安全性**: TypeScriptの型定義を活用し、特に空港データ構造と気象データキャッシュに対応した強力な型チェックを実装。Optional chainingを活用して安全なデータアクセスを実現
- **キャッシュ戦略**:
  - 空港IDをキーとしたキャッシュエントリの管理
  - キャッシュエントリの有効期限（1時間）の設定
  - タイムスタンプベースの有効期限チェック
  - 複数コンポーネント間でのキャッシュデータの共有
- **マニューバーアニメーション**:
  - Canvas APIを使用した航空機の動きの視覚化
  - iframeを使用したモジュラーなアニメーション組み込み
  - スライド内容に連動したアニメーション表示
  - 直感的な制御インターフェース（トグルボタン、別ウィンドウ表示）

## マニューバービューアの仕組み

マニューバービューアは以下のコンポーネントで構成されています：

1. **LearningTab.tsx**: メインの学習コンテンツコンテナ
   - スライド表示と管理
   - マニューバービューアの表示/非表示制御
   - マニューバーアニメーションとスライド内容の連携

2. **ManeuverViewer**: LearningTab内の子コンポーネント
   - スライド番号に基づく適切なアニメーションファイルの選択
   - iframeを使用したアニメーションの埋め込み
   - 別ウィンドウでの表示機能

3. **マニューバーHTMLファイル**（`public/maneuver/`ディレクトリ）
   - Canvas APIを使用した実際のアニメーション描画
   - 航空機の動きの計算と表現
   - アニメーション制御（再生、一時停止、リセット）
   - スタンドアロンでも動作可能な設計

今後のアップデートでは、以下の機能拡張を計画しています：
- パラメータ調整可能なインタラクティブ要素の追加
- より複雑な機動のアニメーション追加
- 物理ベースのシミュレーション強化
- 3D表示への対応
- 視点切り替え機能

## 開発者向けガイドライン
新機能の追加や既存機能の修正を行う際は、以下の点に注意してください：

1. TypeScriptの型定義を適切に行う
2. コンポーネントの責務を明確に分離する
3. パフォーマンスを考慮したコードを書く（特にマップ関連の処理）
4. UIの一貫性を保つ
5. 変更前に既存の機能が損なわれないことを確認する
6. optional chainingを活用し、データの欠損に強いコードを書く
7. APIキーなどの機密情報は環境変数で管理する
8. 非同期処理にはローディング状態の表示と適切なエラーハンドリングを実装する
9. 重複API呼び出しを避けるためにキャッシュを活用する
10. コンポーネント間で共有するデータはContextを使用して管理する
11. マニューバーアニメーション開発時は、HTMLファイルを単体で開発してからiframeに組み込む

## 環境変数と設定

環境変数の設定方法や本番環境へのデプロイについては、[README.md](./README.md)を参照してください。より詳細な開発情報や課題については、[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md)を参照してください。

## 利用における注意事項
このプロジェクトは航空関連の教育・訓練を目的としており、実際のフライトナビゲーションに使用することは推奨されません。訓練と学習の補助ツールとしてご利用ください。

---

最終更新日: 2024年7月8日 