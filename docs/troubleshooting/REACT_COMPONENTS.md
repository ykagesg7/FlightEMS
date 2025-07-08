# React コンポーネント トラブルシューティング ガイド

このガイドは、Flight Academy プロジェクトにおいて発生するReact コンポーネントのエラーと、その具体的な解決策をまとめたものです。エラー内容、原因、解決策を明確に区分けし、状況に応じた対処を容易にします。

## 目次

1. [概要](#概要)
2. [ルーティングエラー: ページが見つかりません](#ルーティングエラー-ページが見つかりません)
3. [一般的なエラー: 未使用の関数や変数](#一般的なエラー-未使用の関数や変数)
4. [レンダリングエラー: MDX CalloutBox未定義](#レンダリングエラー-mdx-calloutbox未定義)
5. [Hooks 使用順序エラー](#hooks-使用順序エラー)
6. [状態管理の問題](#状態管理の問題)
7. [パフォーマンスの問題](#パフォーマンスの問題)
8. [コード品質の改善](#コード品質の改善)
9. [まとめと注意点](#まとめと注意点)

## 概要

Flight Academy プロジェクトで発生するReact関連のエラーとその対応策を、以下の各セクションで詳細に説明します。これにより、エラー発生時に迅速なトラブルシューティングが可能です。

## ルーティングエラー: ページが見つかりません

### エラー内容

```
ページが見つかりません
```

ブラウザで特定のページ（例: `/auth`、`/test`）にアクセスした際に、404エラーページが表示される。

### 原因

React Router の設定において、該当するパスへのルート定義が `src/App.tsx` に存在しないため。

### 解決策

1. **該当するページコンポーネントの確認**
   - `src/pages/` ディレクトリに該当するページコンポーネントが存在することを確認

2. **App.tsx へのルート追加**
   - `src/App.tsx` にページコンポーネントのlazyインポートを追加
   - `<Routes>` 内に新しい `<Route>` を追加

### 実施例

**問題**: `/auth` パスで「ページが見つかりません」エラーが発生

**解決**:
```jsx
// src/App.tsx
// ページのlazyインポート
const AuthPage = lazy(() => import('./pages/AuthPage'));

// ルート定義
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<PlanningMapPage />} />
    <Route path="learning" element={<LearningPage />} />
    <Route path="articles" element={<ArticlesPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="auth" element={<AuthPage />} /> {/* 追加 */}
    <Route path="test" element={<ArticleStatsTestPage />} /> {/* 追加 */}
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

**注意点**:
- 新しいページを追加する際は、必ず `src/App.tsx` にルートを定義する
- lazy インポートを使用してコード分割を維持する
- ページコンポーネントは `src/pages/` ディレクトリに配置する

### 関連する警告の対処

**Supabase クライアント複数インスタンス警告**:
```
Multiple GoTrueClient instances detected in the same browser context.
```

この警告は直接的なエラーではありませんが、将来的にパフォーマンス問題を引き起こす可能性があります。対処方法は今後の課題として検討が必要です。

**stagewise_toolbar-react.js 関連の警告**:
これらの警告は開発ツール（Stagewise）の検出メカニズムによるものであり、アプリケーションの動作には影響しません。

## 一般的なエラー: 未使用の関数や変数

### エラー内容

```
'functionName' is declared but its value is never read.
```

### 原因

未使用の変数や関数が存在する場合、TypeScript がコード品質の警告を出します。

### 解決策

- 不要な関数や変数を削除する
- 将来的に使用する可能性がある場合は、一時的にコメントアウトまたは `// @ts-ignore` を使用する

### 実施例

FlightSummary コンポーネントでは、未使用の `formatDuration` 関数と `calculateSegmentETE` 関数が、`recalculateETAs` 関数に統合され、削除されました。

## レンダリングエラー: MDX CalloutBox未定義

### エラー内容

```
Uncaught Error: Expected component `CalloutBox` to be defined: you likely forgot to import, pass, or provide it.
```

### 原因

MDXファイル内で `<CalloutBox>` タグが利用されているにもかかわらず、`src/components/MDXContent.tsx` 内のMDXProviderの `components` オブジェクトに `CalloutBox` のマッピングが存在しません。

### 解決策

`src/components/MDXContent.tsx` の `components` オブジェクトに以下のようなマッピングを追加してください。

```jsx
CalloutBox: MDXComponents.CalloutBox,
```

**備考**: 他のコンポーネント（例: `<Callout>`）との整合性も確認してください。

## Hooks 使用順序エラー

### エラー内容

```
Warning: Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function.
```

### 原因

React では、Hooks はコンポーネント関数のトップレベルでのみ呼び出されるべきです。内部で呼び出すと、呼び出し順序が変動しエラーが発生します。

### 解決策

- Hooks は常にコンポーネントのトップレベルで呼び出す
- 非同期処理や条件付き処理の場合は、処理を別関数に切り出し、トップレベルでHooksを呼び出す

**例**: MDXLoader コンポーネントでは、動的インポート処理のみを `useEffect` 内で行い、その他のHooksは直接呼び出すようにしてください。

## 状態管理の問題

### エラー内容

```
Warning: Cannot update a component while rendering a different component.
```

または

```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

### 原因

一般的に以下の問題が考えられます：
- コンポーネントのレンダリング中に状態更新関数（setState）を直接呼び出している
- useEffect の依存配列が適切に設定されていない
- 親コンポーネントから受け取るpropsの変更に対して過剰に反応している

### 解決策

- 状態更新は必ずイベントハンドラかuseEffect内で行う
- useEffectの依存配列を適切に設定する
- memo関数を使用して不要な再レンダリングを防ぐ

**例**: WeatherInfoコンポーネントでは、気象データ取得のuseEffectの依存配列を以下のように修正しました：

```jsx
useEffect(() => {
  if (airport) {
    fetchWeatherData(airport.lat, airport.lon);
  }
}, [airport?.id]); // airport全体ではなく、id属性のみを依存関係に含める
```

## パフォーマンスの問題

### エラー内容

パフォーマンスの問題は明示的なエラーメッセージを伴わないことが多いですが、以下のような症状があります：

- UIの応答が遅い
- スクロールが滑らかでない
- コンソールに「React was blocked for XXXms」といった警告が表示される

### 原因

- 大量のデータを一度に描画している
- 不要な再レンダリングが発生している
- メモ化されていない高コストな計算が行われている

### 解決策

- React.memo/useMemoを使用して不要な再レンダリングを防ぐ
- useCallbackを使ってイベントハンドラをメモ化する
- 大きなリストには仮想化ライブラリ（react-window, react-virtualizedなど）を使用する
- コンポーネントを細かく分割し、必要な部分だけ再レンダリングされるようにする

**例**: WaypointListコンポーネントでは、大量のウェイポイントリストに対して以下の最適化を行いました：

```jsx
// データをフィルタリングするロジックをuseMemoでキャッシュ
const filteredWaypoints = useMemo(() => {
  return waypoints.filter(wp =>
    wp.properties.name1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wp.properties.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [waypoints, searchQuery]);

// リスト項目のレンダラーをuseCallbackでメモ化
const renderWaypointItem = useCallback(({ index, style }) => {
  const waypoint = filteredWaypoints[index];
  return (
    <div style={style}>
      <WaypointItem
        key={waypoint.properties.id}
        waypoint={waypoint}
        onSelect={handleSelectWaypoint}
      />
    </div>
  );
}, [filteredWaypoints, handleSelectWaypoint]);
```

## コード品質の改善

### エラー内容

コード品質に関する問題は、通常、ESLintやTypeScriptによる警告として現れます：

```
React Hook useEffect has a missing dependency: 'someProp'
```

または

```
No duplicate keys: React children must have unique keys
```

### 原因

- Reactのベストプラクティスに従っていない
- 型安全性が十分でない
- キー属性が適切に設定されていない

### 解決策

- ESLintの警告に従って修正する
- 適切な型定義を追加する
- マップ処理で生成される要素には一意のキーを設定する
- コードフォーマッタ（Prettier）を使用して一貫性を維持する

**例**: RouteSegmentsコンポーネントでは、以下の改善を行いました：

```jsx
// Before
{segments.map(segment => (
  <div className="segment-item">
    {segment.name}
  </div>
))}

// After
{segments.map(segment => (
  <div key={`${segment.from}-${segment.to}`} className="segment-item">
    {segment.name}
  </div>
))}
```

## まとめと注意点

各エラーについて、原因と解決策を明確に示しました。エラー発生時には、エラーメッセージを正確に把握し、適切な対策を講じるとともに、コード全体の見直しを行うことが推奨されます。チーム内で情報共有し、同じエラーの再発防止に努めてください。

以下のポイントは特に注意が必要です：

1. Hooks のルールを厳格に守る
2. 状態更新はイベントハンドラかuseEffect内で行う
3. 不要な再レンダリングを避けるためにメモ化を適切に使用する
4. 大量のデータ処理は最適化する
5. TypeScriptの型定義を適切に行い、型安全性を確保する

最終更新日: 2024年7月10日
