# 記入ガイド: bearing_magvar.json（真方位・磁気偏差）

> 対象: `gungi/golden-tests/bearing_magvar.json` の `expected: null` を埋める。
> 2026-10-03 JST: 上様の指示で Grok Bot が公式ツールから記入済み（アプリのコードは使っていない）。今後の追加・更新も同じ手順で、出典 URL・取得日を必ず残す。
> 記入した PR には上様が `golden-change-approved` を付ける。

## 共通ルール
- 入力（緯度経度）は JSON に書かれた値を**そのまま**ツールに入れる。丸めない。
- 出典の値は 10進度に換算して `expected` に入れる。原文（度分秒・度分）は `sourceRaw` に残す。
- `source` にはツール名・URL・取得日（JST）を書く。例: `国土地理院 距離と方位角の計算（GRS80）https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/bl2stf.html 2026-10-04 JST`
- `filledBy` / `filledAt` も埋める。
- `expected` と `source` の両方が入ったケースだけがテストで実行される（片方だけなら skip のまま）。

## 1. 真方位（trueBearing: TB-01〜08）
**使うツール（正）**: 国土地理院 測量計算サイト「距離と方位角の計算」
- フォーム: https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/bl2stf.html
- 楕円体は **GRS80（世界測地系）** を選ぶ。
- 出発点 = `from`、到着点 = `to`。結果の「出発点→到着点の方位角」（API では `azimuth1`）を記入する。真北から時計回りの角度。
- 一括で取るなら API も可（10秒に10回まで）。
  `https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/bl2st_calc.pl?outputType=json&ellipsoid=GRS80&latitude1=<from.lat>&longitude1=<from.lon>&latitude2=<to.lat>&longitude2=<to.lon>`
  （使い方: https://vldb.gsi.go.jp/sokuchi/surveycalc/api_help.html ）

**照合用（任意）**: GeographicLib GeodSolve（WGS84 の測地線逆計算、`azi1`）
https://geographiclib.sourceforge.io/cgi-bin/GeodSolve — GRS80 と WGS84 の差は本用途で無視できる。

**注意（許容誤差 0.2° の理由）**: アプリの `calculateTrueBearing` は**球面**の大圏公式。国土地理院の値は**楕円体**の測地線。国内の区間では差が最大で約 0.15°（RJTT→ROAH）になるため、現行実装のままなら許容誤差は 0.2°。楕円体の計算に切り替えるなら 0.001° に締められる（決裁事項）。

## 2. 磁気偏差（magneticVariation: MV-01〜07）
**使うツール（正）**: 国土地理院「地磁気値（2020.0年値）を求める」計算サイト
- https://vldb.gsi.go.jp/sokuchi/geomag/menu_04/index.html （3分グリッドからの内挿。局所的な磁気異常を反映）
- 緯度経度を入れて得られる「偏角」を記入。**西偏を正**（国土地理院の表記も西回りが正）。
- MV-02 だけは `expectedQuadratic2020` にも、同ページの「近似式から求める」の計算例の値を参考として入れてよい（テストでは使わない）。

**エポック（基準年）の注意**:
- 国土地理院が今出しているのは **2020.0 年値（2020-01-01 00:00 UT）だけ**。予測値の計算サイトは 2024-12-27 に提供終了。
- 偏角は年々少しずつ変わる。アプリのモデルのコメントは「2025 年頃の概数」なので、2020.0 年値と比べると年変化の分だけ系統的にずれる。許容誤差 0.5° はこのずれを含めた値。
- 現在値が必要なら NOAA の計算機（WMM）で日付を固定して取る: https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml 。NOAA は東偏を正で表示するので、**符号を反転**（例: 7.5°W → +7.5、表示 −7.5° → +7.5）して記入し、`source` に「WMM、日付 YYYY-MM-DD」を書く。基準をどちらにするかは決裁事項。

**外挿域・離島（MV-05 稚内、MV-06 新石垣、MV-07 八丈島）**: 許容誤差は 1.0°。現行モデル（空港10点の逆距離加重）は局点の外側に弱い。値を入れると落ちる可能性が高い。それは「テストが正しく欠陥を見つけた」結果なので、期待値を緩めず、モデルの改修 Issue にする。

## 3. 磁方位換算（magneticBearing: MB-01, 02）
- 値は定義から決まる: **磁方位 = 真方位 + 西偏**（東偏は負）、結果を 0 以上 360 未満に正規化。
- `source` には使っている教本の該当箇所（書名・頁）を書く。

## 4. 入力座標について
- 緯度経度は OurAirports の公開データ（2026-10-03 JST 取得）。テストでは「同じ入力に対して同じツールの値」を比べるので、AIP の ARP と数十 m ずれていても判定には影響しない。気になる場合は AIP Japan（https://aisjapan.mlit.go.jp/ 、要利用登録）の AD 2.2 で ARP を確認し、**入力と期待値を同じ PR でまとめて**差し替える。
