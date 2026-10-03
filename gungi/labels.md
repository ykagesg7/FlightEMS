# FlightEMS 用ラベル一覧（作成は上様、または承認後に家老）

| ラベル | 色 | 説明 | 付与者 |
|---|---|---|---|
| `gungi-task` | `5319e7` | 軍議パイプラインの対象 Issue | 家老 / テンプレ |
| `status:ready` | `0e8a16` | 着手可能（侍大将起動待ち） | 家老 / 上様 |
| `status:in-progress` | `fbca04` | 侍大将が作業中 | 家老 |
| `status:review` | `1d76db` | CI Green、上様の決裁待ち | 家老 |
| `status:stalled` | `b60205` | 三振で停止。上様の出馬が必要 | 家老 |
| `strike:1` | `f9d0c4` | CI 失敗 1 回目（修正依頼済み） | 家老 |
| `strike:2` | `e99695` | CI 失敗 2 回目（次で停止） | 家老 |
| `domain:planning` | `c5def5` | フライトプランニング・航法計算 | 家老 |
| `domain:3d` | `c5def5` | Cesium 3D 表示 | 家老 |
| `domain:content` | `c5def5` | MDX 記事・レッスン | 家老 |
| `domain:quiz` | `c5def5` | 設問・Supabase データ | 家老 |
| `domain:infra` | `c5def5` | CI・設定・依存 | 家老 |
| `scout` | `d4c5f9` | 斥候の巡回で検知した変更 | 家老 |
| `needs-source` | `d93f0b` | 法規・数値の出典確認が必要 | 家老 / 侍大将 |
| `safety-review` | `d93f0b` | 航空安全の隔離レビュー（aviation-safety-review）が必要 | 家老 |
| `golden-change-approved` | `000000` | ゴールデン期待値の変更を上様が承認 | **上様のみ** |
| `run-e2e` | `bfdadc` | PR で Playwright E2E を実行（任意ジョブ） | 誰でも |

`gh` での一括作成例（上様が実行する場合）:
```bash
gh label create "gungi-task" --repo ykagesg7/FlightEMS --color 5319e7 --description "軍議パイプラインの対象 Issue"
# …以下同様
```
