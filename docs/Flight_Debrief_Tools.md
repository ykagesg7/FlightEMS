# Flight Debrief Tools

Flight Academy の Planning には、飛行後デブリーフィング用の航跡表示機能があります。

## 対応形式

- GPX: `trkpt` の `lat` / `lon`、`ele`、`time`
- KML: `LineString coordinates`、一部の `gx:Track`
- CSV: `timestamp,lat,lon,altitude,speed,track`

CSV の列名は `latitude` / `longitude`、`ground_speed_kt` など一部の別名にも対応します。

## GPS記録

ブラウザの Geolocation API を使用します。画面を開いたままの簡易記録を想定しており、画面ロック中やバックグラウンドでの継続記録は保証しません。

## クラウド保存

ログイン済みユーザーは、Debrief パネルから航跡を Supabase に保存できます。航跡点列は非公開 Storage bucket に JSON として保存し、DB には所有者・メタデータ・サマリのみを保存します。

## 3D空域エクスプローラ（教育用 MVP）

- ルート: [`/explore/airspace-3d`](/explore/airspace-3d)。Planning の Debrief 付近から同リンク。
- CesiumJS。Planning / Leaflet とはバンドル分離（`vendor-cesium`）
- **再生**: `/planning` のローカル下書き（`flight-academy-plan-draft-v1`）があれば、レグの高度・地速（なければ TAS/CAS）で計画ルートを疑似再生する。無ければ九州沖のデモ航跡。計画再生は運動モデルであり実飛行記録ではない。
- **空域**: 変更予定空域に加え、航跡 bbox 付近の RAPCON / ACC Low / ACC High を立体表示。Floor/Ceiling が空の RAPCON は立体にしない（SFC–UNL を捏造しない）。既定表示は変更予定 + RAPCON。ACC は重いのでオフ。
- **機体**: 航跡の真方位に機首を合わせた 3D ダーツ（glTF）。再生開始時も速度ゼロで東を向かない。
- **操作ヒント**: マウス / タッチで図を切替。Ion トークン不要（Natural Earth II）
- 高度帯パースは教育用モデル（`SFC` / `FLxxx` / `UNL`→仮の FL600）

## 注意

この機能は学習・計画・飛行後解析向けの参考表示です。実運航・航法・管制用途には使用せず、公式 AIP、NOTAM、航空気象、機上計器、運航者手順を正としてください。
