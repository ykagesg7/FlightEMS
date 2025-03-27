# ウェイポイント管理スクリプト

このディレクトリには、ウェイポイントデータを管理するためのスクリプトが含まれています。

## 主要スクリプト

### マージスクリプト
- `mergeWaypoints.cjs` - 個別のウェイポイントファイルをマージして`Waypoints.json`を更新するスクリプト

### 座標変換スクリプト
- `convertCoordinates.cjs` - 度分秒形式の座標を10進数形式に変換するスクリプト
  - 緯度: ddmmssN/S形式 → dd.dddd形式（小数点以下4桁）
  - 経度: dddmmssE/W形式 → ddd.dddd形式（小数点以下4桁）

### ウェイポイント追加スクリプト
- `addWaypoints.cjs` - waypoints_A.jsonに新しいウェイポイントを追加するスクリプト
- `addWaypointB.cjs` - waypoints_B.jsonに特定のウェイポイントを追加するスクリプト
- `addWaypointsO.cjs` - waypoints_O.jsonに新しいウェイポイントを追加するスクリプト

### 座標正規化スクリプト
- `normalizeCoordinates.cjs` - ウェイポイントの座標を小数点以下4桁に統一するスクリプト

### ソートスクリプト
- `sortWaypointsB.cjs` - waypoints_B.jsonをアルファベット順にソートするスクリプト
- `sortWaypointsC.cjs` - waypoints_C.jsonをアルファベット順にソートするスクリプト
- `sortWaypointsO.cjs` - waypoints_O.jsonをアルファベット順にソートするスクリプト

### name1更新スクリプト
- `updateName1.cjs` - ウェイポイントのname1フィールドを修正するスクリプト（OMUTA: オオムタ→オームタなど）

## 使用方法

### 座標変換の例
```bash
# 度分秒から10進数への変換テスト
node scripts/convertCoordinates.cjs
```

### 新しいウェイポイントの追加
```bash
# A領域のウェイポイント追加
node scripts/addWaypoints.cjs

# B領域の特定ウェイポイント追加
node scripts/addWaypointB.cjs

# O領域のウェイポイント追加
node scripts/addWaypointsO.cjs
```

### ファイルのソート
```bash
# waypoints_B.jsonをアルファベット順にソート
node scripts/sortWaypointsB.cjs

# waypoints_C.jsonをアルファベット順にソート
node scripts/sortWaypointsC.cjs

# waypoints_O.jsonをアルファベット順にソート
node scripts/sortWaypointsO.cjs
```

### 更新の反映

ウェイポイントの追加やソート後は、必ず以下の手順でマージと地域分割を実行してください：

```bash
# マージスクリプトでWaypoints.jsonを更新
node scripts/mergeWaypoints.cjs

# 地域分割スクリプトで地域別ファイルを更新
node public/geojson/split-waypoints-regions.mjs
```

### name1フィールドの修正
```bash
# name1フィールドを修正
node scripts/updateName1.cjs
``` 