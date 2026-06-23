# 航空機レイヤー — Planning 地図（本番運用 / airplanes.live）

**Docs**: `docs/02_System_Spec.md` 地図節 · `docs/03_Development_Guide.md` 航空機レイヤー · `docs/04_Operations_Guide.md` 航空機レイヤー運用

## 重要（2026-06-24 移行）

データ取得先は **OpenSky → airplanes.live** に変更。**ブラウザ直 fetch・サーバプロキシ廃止**。

### なぜ移行したか（OpenSky が Vercel から利用不可）

- OpenSky は **AWS/Vercel 等クラウド IP を意図的に遮断**（公式ドキュメント明記）。Vercel サーバレスは全リージョン（fra1/iad1）で接続タイムアウト → 恒常的 **502/504**。
- OpenSky の CORS は **自社オリジンのみ**許可 → ブラウザ直 fetch も不可。
- Static IP / Secure Compute を買ってもポリシー上ブロック継続。
- → コードで回避不能。住宅 IP（利用者ブラウザ）から CORS `*` で取れる **airplanes.live** へ移行。

## 概要

Planning 地図の **航空機（参考）** オーバーレイ。**airplanes.live**（`https://api.airplanes.live/v2`・ADSBExchange v2 互換）を **ブラウザから直接** fetch。API キー・サーバ env・プロキシ不要（CORS `*`）。教育・非商用・参考のみ。

## 主要モジュール（現行 / airplanes.live）

| 層 | パス |
|----|------|
| クライアント fetch | `src/services/openskyTraffic.ts`（airplanes.live 直 fetch） |
| 変換・パース・定数 | `src/utils/openskyTraffic.ts`（`AIRPLANES_LIVE_BASE`・`bboxToPointRadiusNm`・`parseAirplanesLiveJson`・`filterAircraftToBBox`・`TRAFFIC_POLL_MS=180000`） |
| merge/stale | `src/pages/planning/components/map/liveTrafficLayerState.ts` |
| Leaflet フック | `src/pages/planning/components/map/hooks/useLiveTrafficLayer.ts` |
| ポップアップ | `src/pages/planning/components/map/popups/openskyTrafficPopup.ts` |

## API（airplanes.live）

- ベース `https://api.airplanes.live/v2`、`/point/{lat}/{lon}/{radiusNm}`（最大 **250NM**）
- レスポンス `{ ac: [...], now, total }`（ADSBExchange v2）。`now` はミリ秒のことがあり秒へ正規化
- 写像: `hex`→icao24(`~`除去・小文字)、`flight`→callsign、`alt_baro`(ft,`"ground"`)→baroAltitudeM(m)、`alt_geom`(ft)→geoAltitudeM(m)、`gs`(kt)→velocityMs(m/s)、`track`/`true_heading`→trueTrackDeg、`seen_pos`→lastContact
- レート制限 **1 req/sec**（クライアント 3 分 poll で余裕）

## 旧 OpenSky 資産（未使用・dev のみ温存）

- `api/opensky-states.ts`・`api/_lib/openskyStatesCore.ts`・`api/_lib/openskyOAuthToken.ts`・`vite/devOpenskyApiPlugin.ts`
- Vercel env `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` は未使用（削除可）

## クライアント挙動

- **3 分 poll**（パン・ズームでは再取得しない）
- 表示範囲 ∩ 日本域 → 中心+半径（最大 250NM）→ 取得後に矩形へ絞り込み
- 429/失敗時: 前回マーカー **Stale**（最大 15 分・400 機 cap）
- ポップアップ: `openskyTrafficPopup.ts`・`autoPan: false`、3 分更新で開いていた icao を追跡し再 open

## 本番疎通

```bash
curl -sS "https://api.airplanes.live/v2/point/35.5/139.5/100"
```

HTTP 200・`ac` 配列を期待。地図は `/planning` でレイヤー ON。

## テスト

- `src/__tests__/utils/openskyTraffic.test.ts`（airplanes.live 写像・bbox→point+radius・filter）
- `src/__tests__/planning/liveTrafficLayerState.test.ts`
- 旧: `src/__tests__/api/openskyOAuthToken.test.ts`・`openskyStatesCore.test.ts`（dev プロキシ用に残置）