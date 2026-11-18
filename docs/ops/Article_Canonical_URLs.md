# 記事 URL 正本（canonical）設計

最終更新: 2026-11-18（GA4 計測分裂対策）

## 背景

同一記事が **MDX ファイル名（`PPL-1-1-1_Topic.mdx`）** と **`meta.slug`（ケバブケース）** の2系統で開けると、GA4 の `page_path` が分裂する。さらに SPA 内遷移では Vercel の恒久リダイレクトより先にクライアントルータが動き、レガシー URL で `page_view` が送られることがあった。

## 正本 URL の決め方

1. **正本パス**は `/articles/<segment>`（末尾スラッシュなし）。
2. **`<segment>`** は MDX の `export const meta.slug` を優先する（先頭の `/articles/` は付けない）。slug 未設定時のみ MDX ファイル名（拡張子なし）をそのまま使う。
3. **ケバブケース**（小文字 + ハイフン）を標準とする。PPL/CPL コードプレフィックス（`ppl-2-1-6-` など）は slug に含めてよい。
4. **MDX ファイル名は変更しない**（`learning_contents.id`・Supabase 進捗・テスト紐付けのキー）。URL 正本は slug のみ。
5. **別記事の注意**: `3-3-10-cloud-types`（CPL）と `ppl-2-1-6-cloud-types-and-formation`（PPL）は内容が関連しても **別 MDX・別正本**。相互リダイレクトはしない。

## URL が決まるレイヤ

| レイヤ | 役割 |
|--------|------|
| MDX `meta.slug` | 正本 segment のソース |
| MDX ファイル名 | `learning_contents.id`、モジュール import キー |
| `virtual:articles-index` | ビルド時メタ索引 |
| React Router `/articles/:contentId` | 表示。レガシー param は `ArticleDetailRoute` で即時 replace |
| `config/article-legacy-redirects.json` | アプリ同期用 +（生成時）Vercel 恒久 308 の正本リスト |
| Vercel `redirects` | 直アクセス・クローラ向け（**本 PR では vercel.json 本体は未変更**。既存ルールが正本） |
| `/learning/:contentId` | `learning_contents.id` から正本 slug へ replace |
| sitemap / prerender | `articlePrettySlug` 基準（`vite/prerenderArticlesPlugin.ts`） |
| GA4 `page_path` | `canonicalizeAnalyticsPagePath` で正本に正規化 |

## リダイレクト方式（優先順）

1. **アプリ内（優先）**: `ArticleDetailRoute` がレンダー時に `Navigate replace`。`GoogleAnalyticsTracker` も正本 path を送信。
2. **Vercel 恒久リダイレクト**: `/articles/<mdx-basename>` → 正本（直リンク・未 JS 環境向け）。件数: 170。
3. **学習導線**: `/learning/<id>` → `articleHrefForContentId`。

## canonical の入れ方（SPA）

- クライアント: `ArticleMetaTags`（react-helmet-async）が `buildArticleCanonicalPath` 由来の絶対 URL を `<link rel="canonical">` に出力。
- 静的クローラ向け: ビルド時 prerender の `vite/articleHeadTags.ts` が同名タグを HTML に埋め込み（主要記事）。
- **効き方**: 検索エンジンは prerender / 初回 HTML の canonical を参照。SPA 遷移後も Helmet で正本が上書きされる。レガシー URL で HTML が生成された場合は Vercel 308 が正本へ誘導する。

## 内部リンクとサイトマップ

- 内部リンクは `buildArticleCanonicalPath` / `articleHrefForContentId` を使用（UI コンポーネントは対応済み）。
- MDX 本文内の `/articles/<filename>` は `npm run fix:article-links` で正本へ一括置換（本文の文章は変更しない）。
- サイトマップ: `vite/generateSitemap.ts` → `api/sitemap.xml.ts`（正本 slug のみ列挙）。

## DB 変更案（実行しない）

`learning_contents` に slug 列はなく、`id` = MDX basename で整合。**本件のための本番 UPDATE は不要**。

履歴の `user_progress.content_id` / GA 以外で URL 文字列を保存している場合のみ、正本 path への正規化を検討:

```sql
-- 案（要事前 SELECT で件数確認）: 旧 URL 形式が content_id に入っている場合
-- SELECT content_id, count(*) FROM user_article_progress GROUP BY 1 HAVING content_id LIKE '/articles/%';
```

```sql
-- ロールバック案（バックアップテーブル経由を推奨）
-- UPDATE user_article_progress SET content_id = '<legacy>' WHERE content_id = '<canonical>';
```

## GA4 への影響

- リリース後、新規セッションの記事 `page_path` は正本 slug に集約される。
- 過去データはレガシー path が残る。Explore で `page_path` 正規表現または手動合算が必要（GA4 側の canonical URL マージは設定しない）。
- クライアント内遷移の二重ヒット（レガシー→正本）は `ArticleDetailRoute` + `canonicalizeAnalyticsPagePath` で抑止。

## 確認手順（本番）

1. `https://flight-lms.vercel.app/articles/IF-1-3_IMC_Scan` → 表示 URL が `/articles/if-1-3-imc-scan`（ネットワークで 308 または replace）。
2. ページソースまたは Elements で `link rel="canonical"` が正本の絶対 URL。
3. 同様に `3.3.10_CloudTypes`、`CPL-Hub-Navigation`。
4. `ppl-2-1-6-cloud-types-and-formation` は **リダイレクトされない**（PPL 正本のまま）。

## 別名 → 正本 対応表（全件）

対応行数（別名あり）: **200** / 記事数: **193** / 恒久リダイレクト: **170**

| 正本 URL | 別名 URL | 根拠 |
|----------|----------|------|
| /articles/3-1-1-aviation-legal-0 | /articles/3.1.1_AviationLegal0 | MDX basename (`3.1.1_AviationLegal0.mdx`) |
| /articles/3-1-2-aviation-legal-skill-review | /articles/3.1.2_AviationLegal1 | MDX basename (`3.1.2_AviationLegal1.mdx`) |
| /articles/3-1-3-medical-certificate-basics | /articles/3.1.3_AviationLegal2 | MDX basename (`3.1.3_AviationLegal2.mdx`) |
| /articles/3-1-4-aviation-legal-3 | /articles/3.1.4_AviationLegal3 | MDX basename (`3.1.4_AviationLegal3.mdx`) |
| /articles/3-1-5-airspace-classification | /articles/3.1.5_AirspaceClassification | MDX basename (`3.1.5_AirspaceClassification.mdx`) |
| /articles/3-1-6-ifr-minimum-altitude | /articles/3.1.6_IFRMinimumAltitude | MDX basename (`3.1.6_IFRMinimumAltitude.mdx`) |
| /articles/3-1-7-flight-rules | /articles/3.1.7_FlightRules | MDX basename (`3.1.7_FlightRules.mdx`) |
| /articles/3-1-8-airport-operations | /articles/3.1.8_AirportOperations | MDX basename (`3.1.8_AirportOperations.mdx`) |
| /articles/3-2-1-propeller-theory | /articles/3.2.1_PropellerTheory | MDX basename (`3.2.1_PropellerTheory.mdx`) |
| /articles/3-2-10-weight-and-balance | /articles/3.2.10_WeightAndBalance | MDX basename (`3.2.10_WeightAndBalance.mdx`) |
| /articles/3-2-11-stall-and-spin | /articles/3.2.11_StallAndSpin | MDX basename (`3.2.11_StallAndSpin.mdx`) |
| /articles/3-2-12-engine-systems | /articles/3.2.12_EngineSystems | MDX basename (`3.2.12_EngineSystems.mdx`) |
| /articles/3-2-2-wing-theory | /articles/3.2.2_WingTheory | MDX basename (`3.2.2_WingTheory.mdx`) |
| /articles/3-2-3-stability-control | /articles/3.2.3_StabilityControl | MDX basename (`3.2.3_StabilityControl.mdx`) |
| /articles/3-2-4-hydraulic-electrical | /articles/3.2.4_HydraulicElectrical | MDX basename (`3.2.4_HydraulicElectrical.mdx`) |
| /articles/3-2-5-engine-theory | /articles/3.2.5_EngineTheory | MDX basename (`3.2.5_EngineTheory.mdx`) |
| /articles/3-2-6-instrument-system | /articles/3.2.6_InstrumentSystem | MDX basename (`3.2.6_InstrumentSystem.mdx`) |
| /articles/3-2-7-lift-and-drag | /articles/3.2.7_LiftAndDrag | MDX basename (`3.2.7_LiftAndDrag.mdx`) |
| /articles/3-2-8-power-and-performance | /articles/3.2.8_PowerAndPerformance | MDX basename (`3.2.8_PowerAndPerformance.mdx`) |
| /articles/3-2-9-pitot-static-system | /articles/3.2.9_PitotStaticSystem | MDX basename (`3.2.9_PitotStaticSystem.mdx`) |
| /articles/3-3-1-standard-atmosphere | /articles/3.3.1_StandardAtmosphere | MDX basename (`3.3.1_StandardAtmosphere.mdx`) |
| /articles/3-3-10-cloud-types | /articles/3.3.10_CloudTypes | MDX basename (`3.3.10_CloudTypes.mdx`) |
| /articles/3-3-11-visibility-and-fog | /articles/3.3.11_VisibilityAndFog | MDX basename (`3.3.11_VisibilityAndFog.mdx`) |
| /articles/3-3-12-turbulence | /articles/3.3.12_Turbulence | MDX basename (`3.3.12_Turbulence.mdx`) |
| /articles/3-3-2-clouds-and-precipitation | /articles/3.3.2_CloudsAndPrecipitation | MDX basename (`3.3.2_CloudsAndPrecipitation.mdx`) |
| /articles/3-3-3-fronts-and-weather-systems | /articles/3.3.3_FrontsAndWeatherSystems | MDX basename (`3.3.3_FrontsAndWeatherSystems.mdx`) |
| /articles/3-3-4-low-pressure-systems | /articles/3.3.4_LowPressureSystems | MDX basename (`3.3.4_LowPressureSystems.mdx`) |
| /articles/3-3-5-atmospheric-stability | /articles/3.3.5_AtmosphericStability | MDX basename (`3.3.5_AtmosphericStability.mdx`) |
| /articles/3-3-6-atmospheric-composition | /articles/3.3.6_AtmosphericComposition | MDX basename (`3.3.6_AtmosphericComposition.mdx`) |
| /articles/3-3-7-westerlies-and-wind | /articles/3.3.7_WesterliesAndWind | MDX basename (`3.3.7_WesterliesAndWind.mdx`) |
| /articles/3-3-8-icao-standard-atmosphere | /articles/3.3.8_ICAOStandardAtmosphere | MDX basename (`3.3.8_ICAOStandardAtmosphere.mdx`) |
| /articles/3-3-9-weather-hazards | /articles/3.3.9_WeatherHazards | MDX basename (`3.3.9_WeatherHazards.mdx`) |
| /articles/3-4-1-dead-reckoning | /articles/3.4.1_DeadReckoning | MDX basename (`3.4.1_DeadReckoning.mdx`) |
| /articles/3-4-2-vor-navigation | /articles/3.4.2_VORNavigation | MDX basename (`3.4.2_VORNavigation.mdx`) |
| /articles/3-4-3-gps-navigation | /articles/3.4.3_GPSNavigation | MDX basename (`3.4.3_GPSNavigation.mdx`) |
| /articles/3-4-4-flight-planning | /articles/3.4.4_FlightPlanning | MDX basename (`3.4.4_FlightPlanning.mdx`) |
| /articles/3-4-5-ndb-navigation | /articles/3.4.5_NDBNavigation | MDX basename (`3.4.5_NDBNavigation.mdx`) |
| /articles/3-4-6-dme-navigation | /articles/3.4.6_DMENavigation | MDX basename (`3.4.6_DMENavigation.mdx`) |
| /articles/3-4-7-dead-reckoning-advanced | /articles/3.4.7_DeadReckoningAdvanced | MDX basename (`3.4.7_DeadReckoningAdvanced.mdx`) |
| /articles/3-5-1-air-traffic-services | /articles/3.5.1_AirTrafficServices | MDX basename (`3.5.1_AirTrafficServices.mdx`) |
| /articles/3-5-2-aeronautical-information | /articles/3.5.2_AeronauticalInformation | MDX basename (`3.5.2_AeronauticalInformation.mdx`) |
| /articles/3-5-3-radio-communication | /articles/3.5.3_RadioCommunication | MDX basename (`3.5.3_RadioCommunication.mdx`) |
| /articles/3-5-4-emergency-procedures | /articles/3.5.4_EmergencyProcedures | MDX basename (`3.5.4_EmergencyProcedures.mdx`) |
| /articles/3-5-5-atc-phraseology | /articles/3.5.5_ATCPhraseology | MDX basename (`3.5.5_ATCPhraseology.mdx`) |
| /articles/analogy-thinking-1 | /articles/2.3.1_AnalogyThinking1 | MDX basename (`2.3.1_AnalogyThinking1.mdx`) |
| /articles/analogy-thinking-2 | /articles/2.3.2_AnalogyThinking2 | MDX basename (`2.3.2_AnalogyThinking2.mdx`) |
| /articles/analogy-thinking-3 | /articles/2.3.3_AnalogyThinking3 | MDX basename (`2.3.3_AnalogyThinking3.mdx`) |
| /articles/answer-first-word | /articles/4.1.3_AnswerFirstWord | MDX basename (`4.1.3_AnswerFirstWord.mdx`) |
| /articles/blessing-and-admonition | /articles/1.3.6_BlessingAndAdmonition | MDX basename (`1.3.6_BlessingAndAdmonition.mdx`) |
| /articles/chores-are-the-job | /articles/4.1.1_ChoresAreTheJob | MDX basename (`4.1.1_ChoresAreTheJob.mdx`) |
| /articles/concrete-abstract | /articles/2.1.2_ConcreteAbstract | MDX basename (`2.1.2_ConcreteAbstract.mdx`) |
| /articles/cp-1-1-area-and-purpose | /articles/CP-1-1_AreaAndPurpose | MDX basename (`CP-1-1_AreaAndPurpose.mdx`) |
| /articles/cp-1-1-area-and-purpose | /articles/ctx-1-1-area-and-purpose | route alias (CTX→CP 等) |
| /articles/cp-1-1-area-and-purpose | /articles/CTX-1-1_AreaAndPurpose | route alias (CTX→CP 等) |
| /articles/cp-1-2-energy | /articles/CP-1-2_Energy | MDX basename (`CP-1-2_Energy.mdx`) |
| /articles/cp-1-2-energy | /articles/ctx-1-2-energy | route alias (CTX→CP 等) |
| /articles/cp-1-2-energy | /articles/CTX-1-2_Energy | route alias (CTX→CP 等) |
| /articles/cp-1-3-controls-g-pio | /articles/CP-1-3_ControlsGPio | MDX basename (`CP-1-3_ControlsGPio.mdx`) |
| /articles/cp-1-3-controls-g-pio | /articles/ctx-1-3-controls-g-pio | route alias (CTX→CP 等) |
| /articles/cp-1-3-controls-g-pio | /articles/CTX-1-3_ControlsGPio | route alias (CTX→CP 等) |
| /articles/cp-2-1-deep-stall | /articles/CP-2-1_DeepStall | MDX basename (`CP-2-1_DeepStall.mdx`) |
| /articles/cp-2-2-accelerated-stall | /articles/CP-2-2_AcceleratedStall | MDX basename (`CP-2-2_AcceleratedStall.mdx`) |
| /articles/cp-2-3-roll-authority | /articles/CP-2-3_RollAuthority | MDX basename (`CP-2-3_RollAuthority.mdx`) |
| /articles/cp-2-4-unload | /articles/CP-2-4_Unload | MDX basename (`CP-2-4_Unload.mdx`) |
| /articles/cp-2-5-trim-failure | /articles/CP-2-5_TrimFailure | MDX basename (`CP-2-5_TrimFailure.mdx`) |
| /articles/cp-2-6-pitchback-sliceback | /articles/CP-2-6_PitchbackSliceback | MDX basename (`CP-2-6_PitchbackSliceback.mdx`) |
| /articles/cp-3-1-configured-handling | /articles/CP-3-1_ConfiguredHandling | MDX basename (`CP-3-1_ConfiguredHandling.mdx`) |
| /articles/cp-3-2-pattern-ats | /articles/CP-3-2_PatternATS | MDX basename (`CP-3-2_PatternATS.mdx`) |
| /articles/cp-4-1-nose-high | /articles/CP-4-1_NoseHigh | MDX basename (`CP-4-1_NoseHigh.mdx`) |
| /articles/cp-4-2-nose-low | /articles/CP-4-2_NoseLow | MDX basename (`CP-4-2_NoseLow.mdx`) |
| /articles/cp-5-1-aerobatic-contract | /articles/CP-5-1_AerobaticContract | MDX basename (`CP-5-1_AerobaticContract.mdx`) |
| /articles/cp-5-2-aileron-roll | /articles/CP-5-2_AileronRoll | MDX basename (`CP-5-2_AileronRoll.mdx`) |
| /articles/cp-5-3-lazy-eight | /articles/CP-5-3_LazyEight | MDX basename (`CP-5-3_LazyEight.mdx`) |
| /articles/cp-5-4-barrel-roll | /articles/CP-5-4_BarrelRoll | MDX basename (`CP-5-4_BarrelRoll.mdx`) |
| /articles/cp-5-5-loop | /articles/CP-5-5_Loop | MDX basename (`CP-5-5_Loop.mdx`) |
| /articles/cp-5-6-split-s-immelmann | /articles/CP-5-6_SplitSImmelmann | MDX basename (`CP-5-6_SplitSImmelmann.mdx`) |
| /articles/cp-5-7-cuban-eight | /articles/CP-5-7_CubanEight | MDX basename (`CP-5-7_CubanEight.mdx`) |
| /articles/cp-5-8-cloverleaf | /articles/CP-5-8_Cloverleaf | MDX basename (`CP-5-8_Cloverleaf.mdx`) |
| /articles/cp-5-9-chandelle | /articles/CP-5-9_Chandelle | MDX basename (`CP-5-9_Chandelle.mdx`) |
| /articles/cpl-hub-communication | /articles/CPL-Hub-Communication | MDX basename (`CPL-Hub-Communication.mdx`) |
| /articles/cpl-hub-meteorology | /articles/CPL-Hub-Meteorology | MDX basename (`CPL-Hub-Meteorology.mdx`) |
| /articles/cpl-hub-navigation | /articles/CPL-Hub-Navigation | MDX basename (`CPL-Hub-Navigation.mdx`) |
| /articles/debriefing-mentality | /articles/1.3.3_DebriefingMentality | MDX basename (`1.3.3_DebriefingMentality.mdx`) |
| /articles/end-with-future | /articles/1.1.2_EndWithFuture | MDX basename (`1.1.2_EndWithFuture.mdx`) |
| /articles/engineering-basics | /articles/engineering_basics | MDX basename (`engineering_basics.mdx`) |
| /articles/fmt-1-1-wingman-vfr | /articles/FMT-1-1_WingmanVFR | MDX basename (`FMT-1-1_WingmanVFR.mdx`) |
| /articles/fmt-1-10-lost-wingman | /articles/FMT-1-10_LostWingman | MDX basename (`FMT-1-10_LostWingman.mdx`) |
| /articles/fmt-1-2-runway-lineup-takeoff | /articles/FMT-1-2_RunwayLineupTakeoff | MDX basename (`FMT-1-2_RunwayLineupTakeoff.mdx`) |
| /articles/fmt-1-3-fingertip-route | /articles/FMT-1-3_FingertipRoute | MDX basename (`FMT-1-3_FingertipRoute.mdx`) |
| /articles/fmt-1-4-ops-check-fence | /articles/FMT-1-4_OpsCheckFence | MDX basename (`FMT-1-4_OpsCheckFence.mdx`) |
| /articles/fmt-1-5-lead-change | /articles/FMT-1-5_LeadChange | MDX basename (`FMT-1-5_LeadChange.mdx`) |
| /articles/fmt-1-6-spread | /articles/FMT-1-6_Spread | MDX basename (`FMT-1-6_Spread.mdx`) |
| /articles/fmt-1-7-trail-family | /articles/FMT-1-7_TrailFamily | MDX basename (`FMT-1-7_TrailFamily.mdx`) |
| /articles/fmt-1-8-rejoin | /articles/FMT-1-8_Rejoin | MDX basename (`FMT-1-8_Rejoin.mdx`) |
| /articles/fmt-1-9-tactical-lab | /articles/FMT-1-9_TacticalLAB | MDX basename (`FMT-1-9_TacticalLAB.mdx`) |
| /articles/give-and-take | /articles/1.2.6_GiveAndTake | MDX basename (`1.2.6_GiveAndTake.mdx`) |
| /articles/give-and-take-2 | /articles/1.2.7_GiveAndTake2 | MDX basename (`1.2.7_GiveAndTake2.mdx`) |
| /articles/if-1-1-trust-instruments | /articles/IF-1-1_TrustInstruments | MDX basename (`IF-1-1_TrustInstruments.mdx`) |
| /articles/if-1-2-partial-panel | /articles/IF-1-2_PartialPanel | MDX basename (`IF-1-2_PartialPanel.mdx`) |
| /articles/if-1-3-imc-scan | /articles/IF-1-3_IMC_Scan | MDX basename (`IF-1-3_IMC_Scan.mdx`) |
| /articles/if-1-4-attitude-turns | /articles/IF-1-4_Attitude_Turns | MDX basename (`IF-1-4_Attitude_Turns.mdx`) |
| /articles/if-1-5-air-data-cross-check | /articles/IF-1-5_AirData_CrossCheck | MDX basename (`IF-1-5_AirData_CrossCheck.mdx`) |
| /articles/just-enough-is-not-enough | /articles/4.1.5_JustEnoughIsNotEnough | MDX basename (`4.1.5_JustEnoughIsNotEnough.mdx`) |
| /articles/l1-q3-1-path-to-pilot | /articles/L1-Q3-1_PathToPilot | MDX basename (`L1-Q3-1_PathToPilot.mdx`) |
| /articles/l1-q4-1-michizane-briefing | /articles/L1-Q4-1_MichizaneBriefing | MDX basename (`L1-Q4-1_MichizaneBriefing.mdx`) |
| /articles/l1-q4-2-aviator-mindset | /articles/L1-Q4-2_AviatorMindset | MDX basename (`L1-Q4-2_AviatorMindset.mdx`) |
| /articles/logical-presentation-1 | /articles/2.2.1_LogicalPresentation1 | MDX basename (`2.2.1_LogicalPresentation1.mdx`) |
| /articles/logical-presentation-2 | /articles/2.2.2_LogicalPresentation2 | MDX basename (`2.2.2_LogicalPresentation2.mdx`) |
| /articles/logical-presentation-3 | /articles/2.2.3_LogicalPresentation3 | MDX basename (`2.2.3_LogicalPresentation3.mdx`) |
| /articles/logical-presentation-4 | /articles/2.2.4_LogicalPresentation4 | MDX basename (`2.2.4_LogicalPresentation4.mdx`) |
| /articles/millionaire-teaching-1 | /articles/2.4.1_MillionaireTeaching1 | MDX basename (`2.4.1_MillionaireTeaching1.mdx`) |
| /articles/millionaire-teaching-2 | /articles/2.4.2_MillionaireTeaching2 | MDX basename (`2.4.2_MillionaireTeaching2.mdx`) |
| /articles/millionaire-teaching-3 | /articles/2.4.3_MillionaireTeaching3 | MDX basename (`2.4.3_MillionaireTeaching3.mdx`) |
| /articles/millionaire-teaching-4 | /articles/2.4.4_MillionaireTeaching4 | MDX basename (`2.4.4_MillionaireTeaching4.mdx`) |
| /articles/ooda-keep-the-loop-moving | /articles/1.3.7_OodaKeepTheLoopMoving | MDX basename (`1.3.7_OodaKeepTheLoopMoving.mdx`) |
| /articles/ppl-1-1-1-temperature-basics | /articles/PPL-1-1-1_TemperatureBasics | MDX basename (`PPL-1-1-1_TemperatureBasics.mdx`) |
| /articles/ppl-1-1-10-takeoff-landing-performance | /articles/PPL-1-1-10_TakeoffLandingPerformance | MDX basename (`PPL-1-1-10_TakeoffLandingPerformance.mdx`) |
| /articles/ppl-1-1-11-control-surfaces | /articles/PPL-1-1-11_ControlSurfaces | MDX basename (`PPL-1-1-11_ControlSurfaces.mdx`) |
| /articles/ppl-1-1-2-airspeed-basics | /articles/PPL-1-1-2_AirspeedBasics | MDX basename (`PPL-1-1-2_AirspeedBasics.mdx`) |
| /articles/ppl-1-1-3-bernoulli-principle | /articles/PPL-1-1-3_BernoulliPrinciple | MDX basename (`PPL-1-1-3_BernoulliPrinciple.mdx`) |
| /articles/ppl-1-1-4-drag-basics | /articles/PPL-1-1-4_DragBasics | MDX basename (`PPL-1-1-4_DragBasics.mdx`) |
| /articles/ppl-1-1-5-axes-stability | /articles/PPL-1-1-5_AxesStability | MDX basename (`PPL-1-1-5_AxesStability.mdx`) |
| /articles/ppl-1-1-6-stall-spin | /articles/PPL-1-1-6_StallSpin | MDX basename (`PPL-1-1-6_StallSpin.mdx`) |
| /articles/ppl-1-1-7-vn-diagram | /articles/PPL-1-1-7_VnDiagram | MDX basename (`PPL-1-1-7_VnDiagram.mdx`) |
| /articles/ppl-1-1-8-propeller-basics | /articles/PPL-1-1-8_PropellerBasics | MDX basename (`PPL-1-1-8_PropellerBasics.mdx`) |
| /articles/ppl-1-1-9-flight-performance | /articles/PPL-1-1-9_FlightPerformance | MDX basename (`PPL-1-1-9_FlightPerformance.mdx`) |
| /articles/ppl-1-2-1-gyro-basics | /articles/PPL-1-2-1_GyroBasics | MDX basename (`PPL-1-2-1_GyroBasics.mdx`) |
| /articles/ppl-1-2-2-pitot-static | /articles/PPL-1-2-2_PitotStatic | MDX basename (`PPL-1-2-2_PitotStatic.mdx`) |
| /articles/ppl-1-2-3-magnetic-compass | /articles/PPL-1-2-3_MagneticCompass | MDX basename (`PPL-1-2-3_MagneticCompass.mdx`) |
| /articles/ppl-1-2-4-reciprocating-engine | /articles/PPL-1-2-4_ReciprocatingEngine | MDX basename (`PPL-1-2-4_ReciprocatingEngine.mdx`) |
| /articles/ppl-1-2-5-carburetor-mixture | /articles/PPL-1-2-5_CarburetorMixture | MDX basename (`PPL-1-2-5_CarburetorMixture.mdx`) |
| /articles/ppl-1-2-6-ignition-magneto | /articles/PPL-1-2-6_IgnitionMagneto | MDX basename (`PPL-1-2-6_IgnitionMagneto.mdx`) |
| /articles/ppl-1-2-7-lubrication-cooling | /articles/PPL-1-2-7_LubricationCooling | MDX basename (`PPL-1-2-7_LubricationCooling.mdx`) |
| /articles/ppl-1-2-8-fuel-system-vapor-lock | /articles/PPL-1-2-8_FuelSystemVaporLock | MDX basename (`PPL-1-2-8_FuelSystemVaporLock.mdx`) |
| /articles/ppl-1-2-9-t-scan-instrument-scan | /articles/PPL-1-2-9_TScanInstrumentScan | MDX basename (`PPL-1-2-9_TScanInstrumentScan.mdx`) |
| /articles/ppl-2-1-1-atmosphere-and-isa-basics | /articles/PPL-2-1-1_AtmosphereAndIsaBasics | MDX basename (`PPL-2-1-1_AtmosphereAndIsaBasics.mdx`) |
| /articles/ppl-2-1-2-temperature-lapse-and-inversion | /articles/PPL-2-1-2_TemperatureLapseAndInversion | MDX basename (`PPL-2-1-2_TemperatureLapseAndInversion.mdx`) |
| /articles/ppl-2-1-3-pressure-altimeter-settings | /articles/PPL-2-1-3_PressureAltimeterSettings | MDX basename (`PPL-2-1-3_PressureAltimeterSettings.mdx`) |
| /articles/ppl-2-1-4-moisture-humidity-dewpoint | /articles/PPL-2-1-4_MoistureHumidityDewpoint | MDX basename (`PPL-2-1-4_MoistureHumidityDewpoint.mdx`) |
| /articles/ppl-2-1-5-atmospheric-stability-basics | /articles/PPL-2-1-5_AtmosphericStabilityBasics | MDX basename (`PPL-2-1-5_AtmosphericStabilityBasics.mdx`) |
| /articles/ppl-2-1-6-cloud-types-and-formation | /articles/PPL-2-1-6_CloudTypesAndFormation | MDX basename (`PPL-2-1-6_CloudTypesAndFormation.mdx`) |
| /articles/ppl-2-1-7-fog-types-and-formation | /articles/PPL-2-1-7_FogTypesAndFormation | MDX basename (`PPL-2-1-7_FogTypesAndFormation.mdx`) |
| /articles/ppl-2-2-1-wind-observation-basics | /articles/PPL-2-2-1_WindObservationBasics | MDX basename (`PPL-2-2-1_WindObservationBasics.mdx`) |
| /articles/ppl-2-2-2-air-masses-and-fronts | /articles/PPL-2-2-2_AirMassesAndFronts | MDX basename (`PPL-2-2-2_AirMassesAndFronts.mdx`) |
| /articles/ppl-2-2-3-pressure-systems-and-japan-weather | /articles/PPL-2-2-3_PressureSystemsAndJapanWeather | MDX basename (`PPL-2-2-3_PressureSystemsAndJapanWeather.mdx`) |
| /articles/ppl-2-3-1-flight-weather-hazards-basics | /articles/PPL-2-3-1_FlightWeatherHazardsBasics | MDX basename (`PPL-2-3-1_FlightWeatherHazardsBasics.mdx`) |
| /articles/ppl-2-3-2-metar-taf-and-weather-reports | /articles/PPL-2-3-2_MetarTafAndWeatherReports | MDX basename (`PPL-2-3-2_MetarTafAndWeatherReports.mdx`) |
| /articles/ppl-2-3-3-wind-shear-and-volcanic-ash | /articles/PPL-2-3-3_WindShearAndVolcanicAsh | 予約 slug（`config/article-reserved-slugs.json`、MDX 未整備） |
| /articles/ppl-2-3-3-wind-shear-and-volcanic-ash | /learning/PPL-2-3-3_WindShearAndVolcanicAsh | learning_contents 導線（MDX 未整備） |
| /articles/ppl-3-1-1-earth-coordinates-and-time | /articles/PPL-3-1-1_EarthCoordinatesAndTime | MDX basename (`PPL-3-1-1_EarthCoordinatesAndTime.mdx`) |
| /articles/ppl-3-1-2-navigation-elements-and-altitude | /articles/PPL-3-1-2_NavigationElementsAndAltitude | MDX basename (`PPL-3-1-2_NavigationElementsAndAltitude.mdx`) |
| /articles/ppl-3-1-3-aeronautical-charts-basics | /articles/PPL-3-1-3_AeronauticalChartsBasics | MDX basename (`PPL-3-1-3_AeronauticalChartsBasics.mdx`) |
| /articles/ppl-3-1-4-wind-triangle-and-flight-computer | /articles/PPL-3-1-4_WindTriangleAndFlightComputer | MDX basename (`PPL-3-1-4_WindTriangleAndFlightComputer.mdx`) |
| /articles/ppl-3-1-5-flight-planning-basics | /articles/PPL-3-1-5_FlightPlanningBasics | MDX basename (`PPL-3-1-5_FlightPlanningBasics.mdx`) |
| /articles/ppl-3-2-1-pilotage-and-position-fix | /articles/PPL-3-2-1_PilotageAndPositionFix | MDX basename (`PPL-3-2-1_PilotageAndPositionFix.mdx`) |
| /articles/ppl-3-2-2-radio-navigation-overview | /articles/PPL-3-2-2_RadioNavigationOverview | MDX basename (`PPL-3-2-2_RadioNavigationOverview.mdx`) |
| /articles/ppl-3-3-1-vfr-operations-and-airspace | /articles/PPL-3-3-1_VfrOperationsAndAirspace | MDX basename (`PPL-3-3-1_VfrOperationsAndAirspace.mdx`) |
| /articles/ppl-3-3-2-spatial-disorientation-basics | /articles/PPL-3-3-2_SpatialDisorientationBasics | MDX basename (`PPL-3-3-2_SpatialDisorientationBasics.mdx`) |
| /articles/ppl-4-1-1-air-traffic-services-overview | /articles/PPL-4-1-1_AirTrafficServicesOverview | MDX basename (`PPL-4-1-1_AirTrafficServicesOverview.mdx`) |
| /articles/ppl-4-1-2-search-and-rescue-basics | /articles/PPL-4-1-2_SearchAndRescueBasics | MDX basename (`PPL-4-1-2_SearchAndRescueBasics.mdx`) |
| /articles/ppl-4-2-1-radio-phraseology-basics | /articles/PPL-4-2-1_RadioPhraseologyBasics | MDX basename (`PPL-4-2-1_RadioPhraseologyBasics.mdx`) |
| /articles/ppl-4-2-2-clearance-readback-basics | /articles/PPL-4-2-2_ClearanceReadbackBasics | MDX basename (`PPL-4-2-2_ClearanceReadbackBasics.mdx`) |
| /articles/ppl-4-2-3-aerodrome-control-basics | /articles/PPL-4-2-3_AerodromeControlBasics | MDX basename (`PPL-4-2-3_AerodromeControlBasics.mdx`) |
| /articles/ppl-4-2-4-flight-plan-filing-basics | /articles/PPL-4-2-4_FlightPlanFilingBasics | MDX basename (`PPL-4-2-4_FlightPlanFilingBasics.mdx`) |
| /articles/ppl-4-3-1-comm-failure-and-light-signals | /articles/PPL-4-3-1_CommFailureAndLightSignals | MDX basename (`PPL-4-3-1_CommFailureAndLightSignals.mdx`) |
| /articles/ppl-4-3-2-mayday-pan-pan-basics | /articles/PPL-4-3-2_MaydayPanPanBasics | MDX basename (`PPL-4-3-2_MaydayPanPanBasics.mdx`) |
| /articles/ppl-5-1-1-aviation-law-definitions | /articles/PPL-5-1-1_AviationLawDefinitions | MDX basename (`PPL-5-1-1_AviationLawDefinitions.mdx`) |
| /articles/ppl-5-1-2-chicago-convention-overview | /articles/PPL-5-1-2_ChicagoConventionOverview | MDX basename (`PPL-5-1-2_ChicagoConventionOverview.mdx`) |
| /articles/ppl-5-2-1-aircraft-nationality-and-registration | /articles/PPL-5-2-1_AircraftNationalityAndRegistration | MDX basename (`PPL-5-2-1_AircraftNationalityAndRegistration.mdx`) |
| /articles/ppl-5-2-2-airworthiness-and-maintenance-overview | /articles/PPL-5-2-2_AirworthinessAndMaintenanceOverview | MDX basename (`PPL-5-2-2_AirworthinessAndMaintenanceOverview.mdx`) |
| /articles/ppl-5-3-1-pilot-certificate-basics | /articles/PPL-5-3-1_PilotCertificateBasics | MDX basename (`PPL-5-3-1_PilotCertificateBasics.mdx`) |
| /articles/ppl-5-3-2-medical-certificate-basics | /articles/PPL-5-3-2_MedicalCertificateBasics | MDX basename (`PPL-5-3-2_MedicalCertificateBasics.mdx`) |
| /articles/ppl-5-3-3-aviation-english-requirements | /articles/PPL-5-3-3_AviationEnglishRequirements | MDX basename (`PPL-5-3-3_AviationEnglishRequirements.mdx`) |
| /articles/ppl-5-4-1-airspace-and-facilities-overview | /articles/PPL-5-4-1_AirspaceAndFacilitiesOverview | MDX basename (`PPL-5-4-1_AirspaceAndFacilitiesOverview.mdx`) |
| /articles/ppl-5-4-2-captain-authority-and-preflight | /articles/PPL-5-4-2_CaptainAuthorityAndPreflight | MDX basename (`PPL-5-4-2_CaptainAuthorityAndPreflight.mdx`) |
| /articles/ppl-5-4-3-recurrent-proficiency-overview | /articles/PPL-5-4-3_RecurrentProficiencyOverview | MDX basename (`PPL-5-4-3_RecurrentProficiencyOverview.mdx`) |
| /articles/ppl-5-4-4-safety-endangering-prohibitions | /articles/PPL-5-4-4_SafetyEndangeringProhibitions | MDX basename (`PPL-5-4-4_SafetyEndangeringProhibitions.mdx`) |
| /articles/ppl-5-4-5-accident-incident-reporting-basics | /articles/PPL-5-4-5_AccidentIncidentReportingBasics | MDX basename (`PPL-5-4-5_AccidentIncidentReportingBasics.mdx`) |
| /articles/ppl-5-4-6-aerodrome-ground-operations-basics | /articles/PPL-5-4-6_AerodromeGroundOperationsBasics | MDX basename (`PPL-5-4-6_AerodromeGroundOperationsBasics.mdx`) |
| /articles/ppl-5-4-7-ifr-minimum-altitude-intro-for-ppl | /articles/PPL-5-4-7_IFRMinimumAltitudeIntroForPPL | MDX basename (`PPL-5-4-7_IFRMinimumAltitudeIntroForPPL.mdx`) |
| /articles/prioritizing-most-important | /articles/1.1.3_PrioritizingMostImportant | MDX basename (`1.1.3_PrioritizingMostImportant.mdx`) |
| /articles/put-a-frame-on-failure | /articles/4.2.2_PutAFrameOnFailure | MDX basename (`4.2.2_PutAFrameOnFailure.mdx`) |
| /articles/results-are-everything | /articles/1.3.5_ResultsAreEverything | MDX basename (`1.3.5_ResultsAreEverything.mdx`) |
| /articles/right-people-on-board | /articles/1.2.5_RightPeopleOnBoard | MDX basename (`1.2.5_RightPeopleOnBoard.mdx`) |
| /articles/say-expectations | /articles/4.1.4_SayExpectations | MDX basename (`4.1.4_SayExpectations.mdx`) |
| /articles/seek-first-to-understand | /articles/1.1.5_SeekFirstToUnderstand | MDX basename (`1.1.5_SeekFirstToUnderstand.mdx`) |
| /articles/sharpen-the-saw | /articles/1.1.7_SharpenTheSaw | MDX basename (`1.1.7_SharpenTheSaw.mdx`) |
| /articles/shuraba-mentality | /articles/1.3.4_ShurabaMentality | MDX basename (`1.3.4_ShurabaMentality.mdx`) |
| /articles/single-seat-mentality | /articles/1.3.1_SingleSeatMentality | MDX basename (`1.3.1_SingleSeatMentality.mdx`) |
| /articles/speak-before-asked | /articles/4.1.2_SpeakBeforeAsked | MDX basename (`4.1.2_SpeakBeforeAsked.mdx`) |
| /articles/synergize | /articles/1.1.6_Synergize | MDX basename (`1.1.6_Synergize.mdx`) |
| /articles/take-the-gain-from-feedback | /articles/4.2.3_TakeTheGainFromFeedback | MDX basename (`4.2.3_TakeTheGainFromFeedback.mdx`) |
| /articles/thinking-stamina | /articles/4.2.5_ThinkingStamina | MDX basename (`4.2.5_ThinkingStamina.mdx`) |
| /articles/thinking-vs-worrying-master | /articles/2.1.1_Thinking | MDX basename (`2.1.1_Thinking.mdx`) |
| /articles/turn-feedback-into-action | /articles/4.2.1_TurnFeedbackIntoAction | MDX basename (`4.2.1_TurnFeedbackIntoAction.mdx`) |
| /articles/unconscious-success | /articles/1.1.1_UnconsciousSuccess | MDX basename (`1.1.1_UnconsciousSuccess.mdx`) |
| /articles/weather-basics | /articles/weather_basics | MDX basename (`weather_basics.mdx`) |
| /articles/win-win-thinking | /articles/1.1.4_WinWinThinking | MDX basename (`1.1.4_WinWinThinking.mdx`) |
| /articles/wingman-mentality | /articles/1.3.2_WingmanMentality | MDX basename (`1.3.2_WingmanMentality.mdx`) |
| /articles/yes-has-a-short-shelf-life | /articles/4.2.4_YesHasAShortShelfLife | MDX basename (`4.2.4_YesHasAShortShelfLife.mdx`) |
