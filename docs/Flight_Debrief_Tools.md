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

## 注意

この機能は学習・計画・飛行後解析向けの参考表示です。実運航・航法・管制用途には使用せず、公式 AIP、NOTAM、航空気象、機上計器、運航者手順を正としてください。
