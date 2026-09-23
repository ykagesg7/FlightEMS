# Flight Academy 現状と段階2ロードマップ

**最終更新**: 2026-09-23（段階2 へ全面改稿。旧 Phase A〜E・KPI 表・更新履歴は [Closed_Sprints.md](Closed_Sprints.md) と git 履歴へ）  
**バージョン**: Roadmap v5.0.0

---

## このドキュメントの目的

いま進めている仕事（段階2）と、その現在地を置く。方針の理由は [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0、完了分は [Closed_Sprints.md](Closed_Sprints.md)、誰がどこで動くかは [ops/Work_Allocation.md](ops/Work_Allocation.md)。

月次計画ファイルは作らない。週次の配信は [05_Content_Pipeline.md](05_Content_Pipeline.md) の配信表だけを更新する。

---

## 1. 現在地（2026-09-23）

| 項目 | 状態 |
|------|------|
| 段階1（PPL/CPL 本文化と記事↔Quiz） | **完了**。今後は穴埋めのみ（[Closed_Sprints.md](Closed_Sprints.md)） |
| Articles ドリップ | 週3本を継続中。W38 CP 4-2 / 5-1 / 5-2、W39 CP 5-3 / 5-4 / 5-5 |
| CP 残り | `CP-5-6`〜`5-9` は DB 行のみで **MDX なし**。schedule に載せる前に MDX を書く |
| FN | 1-1〜1-10 の MDX がストック済（id は `FMT-1-*`）。ドリップ開始週は未定 |
| メンタリティ | 道真稿へ差し替えた `1.1.1`〜`1.1.4` は公開。残り **24 本** は非公開ゲート中 |
| 3D 空域 | `/explore/airspace-3d`（Cesium・隔離ルート）がある。Waypoint の立体表示は未実装 |
| 計測 | 週間 GA4 users 一桁、`quiz_*` 0。ALPM は保留 |

## 2. 段階2のワークストリーム

優先順は上から。1 を空けてまで 2 以下を進めない。

| # | ワークストリーム | ゴール | 次の一手 | 正本 |
|---|------------------|--------|----------|------|
| 1 | **CP / FN 記事** | 週3本を空けない。CP を git 上で完結させ、FN のドリップに移る | `CP-5-6`〜`5-9` の MDX。FN の開始週を Editorial で決める | [05](05_Content_Pipeline.md)、[Contact_Transition_2026](content_outlines/Contact_Transition_2026/README.md)、[FN_Formation_2026](content_outlines/FN_Formation_2026/README.md) |
| 2 | **メンタリティ改稿** | 非公開 24 本を道真稿に改稿し、1 本ずつ再公開 | 週次弧で「+1 本まで」を CP / FN の週に混ぜる | [05_Content_Pipeline.md](05_Content_Pipeline.md) §6、[ops/Gemini_Memoir_Article_System_Prompt.md](ops/Gemini_Memoir_Article_System_Prompt.md) |
| 3 | **Planning を用途別に整理** | 「学科の航法計算」「実フライトの計画」「振り返り」など用途ごとに入口を分け、画面をシンプルにする | 用途の棚卸しと IA 案（UI 変更はユーザー承認後） | [Component_Structure_Guide.md](Component_Structure_Guide.md) Planning 節、ルート `DESIGN.md` |
| 4 | **記事の LMS 型パッケージ** | 記事単体ではなく、コース（順序・進捗・理解チェック）として提供する | 既存の `meta.series` / `order` と進捗を使ったコース定義案（UI 変更は承認後） | [Component_Structure_Guide.md](Component_Structure_Guide.md) Articles、[05](05_Content_Pipeline.md) §5 |
| 5 | **3D GIS（無料枠）** | 空域と Waypoint を立体表示し、理解を助ける。差別化の柱 | 無料枠で成立する方式の選定（タイル・地形・配信量）。既存 `/explore/airspace-3d` を土台にする | [Component_Structure_Guide.md](Component_Structure_Guide.md)、[GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md) |

### 指標

週次 users、記事→Quiz 遷移、Planning 利用の3つだけを見る。数値は火曜の [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)。ALPM は保留（[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0）。

### 制約

- UI/UX の変更はユーザー承認後。先にルート `DESIGN.md` を読む。パッケージ版は変えない。
- 3D・地図は Vercel Hobby（Deployment Storage 10 GB）と外部サービスの無料枠に収める。Cesium をハブ HTML に注入しない。
- 壊してはいけない挙動は [Closed_Sprints.md](Closed_Sprints.md) §2。

## 3. 段階2でやらないこと

二重オンボーディング、気象・通信 PMF、アプリ内 AI ナビ、10代同意 UX、テストカバレッジ 50%、PPL 75/150。いずれも保留（[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0）。C-1〜C-5（ブランド刷新・SEO・PWA・A11y・Lighthouse CI）も未承認のまま着手しない。

## 4. リスク

| リスク | 軽減策 |
|--------|--------|
| schedule だけ入って MDX が無い（CP 5-6〜5-9 と同じ欠落） | schedule 追加は MDX のマージと同じ PR で行う |
| 公開が cron 依存 | 公開確認は Skill `article-publish-check`。人手で `is_published` を回さない |
| Obsidian がクラウドから見えない | Ingest / Editorial はローカル Cursor（[ops/Work_Allocation.md](ops/Work_Allocation.md)） |
| 3D の配信量で無料枠を超える | 方式選定の段階でデータ量と外部タイル条件を見積もる |
| Supabase / 外部 API の無料枠 | ログイン後限定・キャッシュ・上限設計（[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0） |
