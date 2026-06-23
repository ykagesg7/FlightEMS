# OpenSky 航空機レイヤー — Planning 地図（本番運用）

**Docs**: `docs/02_System_Spec.md` 地図節 · `docs/03_Development_Guide.md` OpenSky · `docs/04_Operations_Guide.md` OpenSky 運用

## 概要

Planning 地図の **航空機（参考・OpenSky）** オーバーレイ。OpenSky Network ADS-B を `GET /api/opensky-states` プロキシ経由で表示。教育・参考のみ。

## 主要モジュール

| 層 | パス |
|----|------|
| Vercel 入口 | `api/opensky-states.ts` |
| プロキシ本体 | `api/_lib/openskyStatesCore.ts` |
| OAuth2 | `api/_lib/openskyOAuthToken.ts` |
| クライアント fetch | `src/services/openskyTraffic.ts` |
| 定数・BBOX | `src/utils/openskyTraffic.ts`（`TRAFFIC_POLL_MS=180000`） |
| merge/stale | `src/pages/planning/components/map/liveTrafficLayerState.ts` |
| Leaflet フック | `src/pages/planning/components/map/hooks/useLiveTrafficLayer.ts` |
| ポップアップ | `src/pages/planning/components/map/popups/openskyTrafficPopup.ts` |
| dev プラグイン | `vite/devOpenskyApiPlugin.ts` |

## Vercel 環境変数（2026-06 本番）

- **`OPENSKY_CLIENT_ID`** — Production + Preview + Development
- **`OPENSKY_CLIENT_SECRET`** — Secret。Production + Preview 必須（Preview のみだと本番レイヤー空）
- **使わない**: `OPENSKY_USERNAME/PASSWORD`（2026-03〜非対応）、`NEXT_PUBLIC_SUPABASE_*`、`POSTGRES_*`（削除済み）
- Supabase 正本: **`VITE_SUPABASE_URL`** / **`VITE_SUPABASE_ANON_KEY`**

## 本番トラブルと対策（実績）

| 症状 | 原因 | 対策 |
|------|------|------|
| **502 ETIMEDOUT** | Vercel → OpenSky IPv4 直結不可 | `openskyStatesCore`: **`process.env.VERCEL` 時 fetch のみ** |
| **504 FUNCTION_INVOCATION_TIMEOUT** | OAuth + 3 段フォールバックが 30s 超 | 同上 fetch-only。token 8s / states 18s |
| 地図に機体なし | Secret が Preview のみ | Production に Secret 追加 → Redeploy |
| ポップアップが 3 分で消える | poll 更新の setIcon/setPopupContent | `useLiveTrafficLayer` が icao 追跡 → 再 open。`autoPan: false` |

## クライアント挙動

- **3 分 poll**（パン・ズームでは再取得しない）
- BBOX: 表示範囲 ∩ 日本域、**0.5° 量子化**
- 429/502 時: 前回マーカー **Stale**（最大 15 分・400 機 cap）
- CDN: `Cache-Control: s-maxage=150, stale-while-revalidate=180`
- リージョン: `vercel.json` **`regions: ["fra1"]`**

## 本番疎通

```bash
curl -sS "https://flight-lms.vercel.app/api/opensky-states?lamin=32&lamax=34&lomin=133&lomax=136"
```

HTTP 200 期待。コミット: `9a7ee0b`〜`707a003`。

## テスト

- `src/__tests__/api/openskyOAuthToken.test.ts`
- `src/__tests__/api/openskyStatesCore.test.ts`
- `src/__tests__/planning/liveTrafficLayerState.test.ts`
- `src/__tests__/utils/openskyTraffic.test.ts`