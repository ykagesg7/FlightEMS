# FlightAcademyTsx - 高度な機能とトラブルシューティング

このドキュメントでは、FlightAcademyTsxの高度な機能、自動化ツール、データ検証、およびトラブルシューティングについて詳しく説明します。

## 目次

1. [マニューバービューア機能](#マニューバービューア機能)
2. [AIエージェント自動化](#aiエージェント自動化)
3. [JSONデータ検証](#jsonデータ検証)
4. [高度なデータ管理](#高度なデータ管理)
5. [図表作成機能](#図表作成機能)
6. [トラブルシューティング](#トラブルシューティング)

## マニューバービューア機能

マニューバービューアは、編隊飛行などの複雑な機動を視覚的に理解するための教育ツールです。

### 実装の詳細

マニューバービューアは以下の技術で実装されています：

- HTML5 Canvas
- JavaScript（アニメーション処理）
- イベントリスナー（ユーザー操作）

### マニューバーファイルの構造

```
public/
└── maneuver/
    ├── straight_join.html
    ├── turning_join.html
    └── [新しいマニューバーファイル].html
```

### 新しいマニューバーの追加

新しいマニューバーを追加する手順：

1. `public/maneuver/` ディレクトリに新しいHTMLファイルを作成
2. 既存のマニューバーファイルをテンプレートとして使用
3. HTMLファイル内で以下の要素を定義：
   - Canvas要素
   - 制御用UI（再生、一時停止、リセットなど）
   - JavaScript関数によるアニメーション処理

4. `src/components/LearningTab.tsx`ファイルを更新：
   ```typescript
   const getManeuverFile = (slideNum: number): string => {
     const maneuverMap: Record<number, string> = {
       5: '/maneuver/straight_join.html',
       7: '/maneuver/turning_join.html',
       // 新しいマニューバーマッピングを追加
       20: '/maneuver/your_new_maneuver.html',
     };
     return maneuverMap[slideNum] || '';
   };
   
   const hasManeuverViewer = (slideNum: number): boolean => {
     const slidesWithManeuvers = [5, 7, 12, 14, 18, 20]; // 新しいスライド番号を追加
     return slidesWithManeuvers.includes(slideNum);
   };
   ```

### インタラクティブ要素の追加

今後の開発では、以下のインタラクティブ要素の追加を検討しています：

1. **パラメータ調整機能：**
   - 速度、旋回角度、距離などのパラメータをスライダーで調整
   - リアルタイムにアニメーションに反映

2. **視点切り替え：**
   - トップビュー、サイドビュー、3D視点などの切り替え
   - 各航空機からの視点表示

3. **シナリオ選択：**
   - 複数のシナリオ（標準、異常、修正など）を選択可能に
   - 各シナリオに応じたアニメーション変更

## AIエージェント自動化

FlightAcademyTsxでは、開発・メンテナンスを効率化するためにAIエージェントを活用しています。

### 自動化できるタスク

1. **コード生成**:
   - 新規コンポーネントのテンプレート作成
   - ユーティリティ関数の実装
   - テストケースの生成

2. **データ処理**:
   - ウェイポイントデータの変換と検証
   - 空港データの更新と整理
   - GeoJSONファイルの最適化

3. **ドキュメント生成**:
   - コードからのAPIドキュメント生成
   - リリースノートの作成
   - コメントの充実化

### Cursor.AIの活用方法

1. **セットアップ**:
   - Cursor.AIをインストール
   - プロジェクトをCursor.AIで開く
   - GitHubリポジトリと連携

2. **基本的なプロンプト例**:
   ```
   このTypeScriptコンポーネントをリファクタリングして、パフォーマンスを向上させてください。
   ```

   ```
   以下のJSONデータを検証し、フォーマットエラーがあれば修正してください。
   ```

   ```
   このマニューバービューアに、パラメータ調整機能を追加するコードを生成してください。
   ```

3. **高度なプロンプト例**:
   ```
   FadeInOnScroll.tsxコンポーネントを作成してください。このコンポーネントはビューポートに入った時に子要素をフェードインさせる機能を持ちます。IntersectionObserverを使用し、TypeScript型を適切に定義してください。
   ```

   ```
   以下のフライトパラメータ計算ロジックを最適化し、風の影響を考慮するよう拡張してください。また、単体テストも追加してください。
   ```

### GitHub連携とコンフリクト解決

Cursor.AIとGithub連携により、以下の作業が効率化されます：

1. **コンフリクト解決**:
   - マージコンフリクトが発生した場合、AIアシスタントに「コンフリクトを解決してください」と指示
   - 特定のファイルタイプ（JSON、TypeScript、Markdown）に応じた解決策の提案

2. **コード品質向上**:
   - コミット前のコードレビュー
   - エラーの原因特定と修正案の提示
   - ドキュメント自動生成

## JSONデータ検証

FlightAcademyTsxでは、ウェイポイント、空港、NAVAIDなど多数のJSONデータを扱います。これらのデータの整合性を保つための検証システムを実装しています。

### 検証スキーマ

各種データには、以下のようなJSON Schemaを定義しています：

```json
// waypoint.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "type": { "type": "string", "enum": ["Feature"] },
    "properties": {
      "type": "object",
      "required": ["id", "name1", "lat", "lon"],
      "properties": {
        "id": { "type": "string", "pattern": "^[A-Z0-9]{1,5}$" },
        "name1": { "type": "string" },
        "name2": { "type": "string" },
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lon": { "type": "number", "minimum": -180, "maximum": 180 },
        "type": { "type": "string", "enum": ["WPT", "VOR", "NDB", "DME"] }
      }
    },
    "geometry": {
      "type": "object",
      "required": ["type", "coordinates"],
      "properties": {
        "type": { "type": "string", "enum": ["Point"] },
        "coordinates": {
          "type": "array",
          "minItems": 2,
          "maxItems": 2,
          "items": { "type": "number" }
        }
      }
    }
  }
}
```

### 検証スクリプト

データを検証するためのスクリプトは以下にあります：

```
scripts/
├── validateWaypoints.js
├── validateAirports.js
└── validateNavaids.js
```

使用例：
```bash
node scripts/validateWaypoints.js public/geojson/waypoints.json
```

### データ修正ツール

データの問題を自動的に修正するツールも用意されています：

```bash
node scripts/fixWaypointData.js public/geojson/waypoints.json
```

これにより、一般的な問題（座標の順序、IDの正規化など）が自動的に修正されます。

## 高度なデータ管理

### ウェイポイントデータの分割と統合

ウェイポイントデータは、以下の形式で管理されています：

1. **アルファベット別**：
   - `waypoints_A.json`、`waypoints_B.json`など
   - アルファベットごとにIDが分類

2. **地域別**：
   - `waypoints_kanto.json`、`waypoints_kansai.json`など
   - 地理的な位置に基づいて分類

データ管理スクリプトの利用方法：

```bash
# アルファベット別のファイルを統合
node scripts/mergeWaypoints.cjs

# 統合ファイルを地域別に分割
node public/geojson/split-waypoints-regions.mjs
```

### 座標形式の統一

すべての座標データは以下の形式に統一されています：

- 経度: ddd.dddd（小数点4桁）
- 緯度: dd.dddd（小数点4桁）

座標データを変換するためのユーティリティ関数：

```typescript
// src/utils/coordinateUtils.ts
export function formatCoordinate(coordinate: number, isLongitude = false): number {
  const precision = 4;
  return parseFloat(coordinate.toFixed(precision));
}
```

## 図表作成機能

FlightAcademyTsxでは、mermaidライブラリを使用して、MDXドキュメント内にインタラクティブな図表を埋め込む機能を提供しています。

### DiagramComponentの使用方法

`DiagramComponent`は以下のように使用します：

```jsx
<DiagramComponent
  chart={`
    graph TD
      A[出発空港] -->|離陸| B(上昇段階)
      B --> C{高度決定}
      C -->|巡航高度| D[巡航段階]
      C -->|最適高度なし| E[高度調整]
      D --> F[目的地到着]
  `}
  title="フライトフェーズの流れ"
  caption="基本的なフライトフェーズと意思決定の流れ"
  theme="forest"
/>
```

### サポートされている図表タイプ

- フローチャート（TD: top-down、LR: left-right）
- シーケンス図
- クラス図
- 状態図
- ER図
- ガントチャート
- 円グラフ

### カスタマイズオプション

- `theme`: 'default', 'forest', 'dark', 'neutral'のいずれか
- `title`: 図表の上部に表示されるタイトル
- `caption`: 図表の下部に表示される説明文
- `className`: 追加のCSSクラス

### エクスポート機能

図表はSVGまたはPNG形式でエクスポートできます：

- SVGダウンロードボタン: ベクター形式でエクスポート
- PNGダウンロードボタン: ラスター形式でエクスポート

## トラブルシューティング

### 一般的な問題と解決策

1. **起動時のエラー**
   ```
   問題: アプリケーションが起動しない、または白い画面のまま
   解決策: 
   - node_modulesを削除し、npm installを再実行
   - ブラウザキャッシュのクリア
   - Viteのキャッシュをクリア: npm run clean:cache
   ```

2. **APIキーの問題**
   ```
   問題: WeatherAPIへのリクエストが失敗する
   解決策:
   - .env.localファイルにVITE_WEATHER_API_KEYが正しく設定されているか確認
   - APIキーの有効性を確認
   - CORSの問題がある場合は、プロキシサーバーを使用
   ```

3. **マップが表示されない**
   ```
   問題: レイヤーやマーカーが表示されない
   解決策:
   - ネットワーク接続を確認
   - レイヤーコントロールで正しいレイヤーが選択されているか確認
   - コンソールエラーを確認して特定の問題を特定
   ```

4. **パッケージの依存関係エラー**
   ```
   問題: パッケージの相互依存関係による競合
   解決策:
   - npm ls <パッケージ名>でバージョンを確認
   - package.jsonの依存関係を更新
   - npm i --force で強制インストール（最終手段）
   ```

### mermaidライブラリの問題

```
問題: "Failed to resolve import "mermaid" from "src/components/mdx/DiagramComponent.tsx". Does the file exist?"
解決策:
- npm install mermaid を実行して依存関係をインストール
- tsconfig.jsonに適切なパスマッピングを追加
- @ts-ignoreコメントが正しく配置されているか確認
```

### React コンポーネントのエラー

詳細は[React コンポーネント トラブルシューティング](./troubleshooting/REACT_COMPONENTS.md)を参照してください。一般的なエラーの例：

1. **未使用の関数や変数**
   ```
   'functionName' is declared but its value is never read.
   ```
   解決策: 不要な関数や変数を削除するか、コメントアウトする

2. **MDX CalloutBox未定義**
   ```
   Uncaught Error: Expected component `CalloutBox` to be defined: you likely forgot to import, pass, or provide it.
   ```
   解決策: MDXProvider の `components` オブジェクトに適切なマッピングを追加する

3. **Hooks 使用順序エラー**
   ```
   Warning: Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks.
   ```
   解決策: Hooks はコンポーネントのトップレベルでのみ呼び出す

### ドキュメントとコード間の不一致への対処

ドキュメントとコードの間に不一致が見つかった場合は、以下の手順に従ってください：

1. コードの実装を確認する（ソースコードが真実）
2. 必要に応じてドキュメントを更新する
3. 変更をIssueとして報告し、プルリクエストを作成する

---

最終更新日: 2024年7月10日
