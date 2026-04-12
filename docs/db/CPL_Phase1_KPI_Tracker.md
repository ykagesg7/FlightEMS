# CPL Phase 1 — KPI「19本」トラッカー（正本）

**目的**: [03_計画改善ロードマップ.md](../03_計画改善ロードマップ.md)・[00_Flight_Academy_Strategy.md](../00_Flight_Academy_Strategy.md) の **Phase 1（19 執筆単位）** とリポジトリ実態を **1 表に固定**する。  
**更新ルール**: 本文化・`learning_test_mapping`・シリーズ変更時にこの表を更新し、[06_記事作成ロードマップ.md](../06_記事作成ロードマップ.md) の KPI 節からリンクする。

**数値の定義**

- **本文化**: `meta.series` が `CPL-Learning-Stub` **ではない**（専用シリーズで本文執筆済みとみなす）。スタブは同一条件で「スタブ」。
- **マッピング**: [14_記事単元網羅とバックログ.md](../14_記事単元網羅とバックログ.md) のスナップショットに準拠。再集計は §5 SQL。

**KPI 19 本の内訳（[06](../06_記事作成ロードマップ.md) と整合）**

| # | `learning_contents.id` / MDX | 科目 | 深さ（2026-04-12 時点） | `learning_test_mapping` |
|---|------------------------------|------|-------------------------|-------------------------|
| 1 | `3.1.1_AviationLegal0` | 航空法規 | 本文化（`CPL-Aviation-Legal`） | あり |
| 2 | `3.1.2_AviationLegal1` | 航空法規 | 本文化 | あり |
| 3 | `3.1.3_AviationLegal2` | 航空法規 | 本文化 | あり |
| 4 | `3.1.4_AviationLegal3` | 航空法規 | 本文化 | あり |
| 5 | `3.1.5_AirspaceClassification` | 航空法規 | 本文化 | あり |
| 6 | `3.1.6_IFRMinimumAltitude` | 航空法規 | 本文化 | あり |
| 7 | `3.2.1_PropellerTheory` | 航空工学 | 本文化（`CPL-Aeronautical-Engineering`） | あり |
| 8 | `3.2.2_WingTheory` | 航空工学 | 本文化 | あり |
| 9 | `3.2.3_StabilityControl` | 航空工学 | 本文化 | あり |
| 10 | `3.2.4_HydraulicElectrical` | 航空工学 | 本文化 | あり |
| 11 | `3.2.5_EngineTheory` | 航空工学 | 本文化 | あり |
| 12 | `3.2.6_InstrumentSystem` | 航空工学 | 本文化 | あり |
| 13 | `3.5.1_AirTrafficServices` | 航空通信 | 本文化（`CPL-Communication`） | あり |
| 14 | `3.5.2_AeronauticalInformation` | 航空通信 | 本文化 | あり |
| 15 | `3.5.3_RadioCommunication` | 航空通信 | 本文化 | あり |
| 16 | `3.4.1_DeadReckoning` | 空中航法 | 本文化（`CPL-Navigation`） | あり（[20260412_learning_test_mapping_nav_341_343.sql](../../scripts/database/20260412_learning_test_mapping_nav_341_343.sql) 投入後） |
| 17 | `3.4.2_VORNavigation` | 空中航法 | 本文化 | あり（同上） |
| 18 | `3.4.3_GPSNavigation` | 空中航法 | 本文化 | あり（同上） |
| 19 | `3.4.4_FlightPlanning` | 空中航法 | 本文化 | あり |

**集計（手動・上表と同期）**

- **本文化**: **19 / 19**
- **スタブ**: **0 / 19**（Phase 1 KPI 19 本の範囲）
- **マッピングあり**: **19 / 19**（3.4.1〜3.4.3 は [20260412_learning_test_mapping_nav_341_343.sql](../../scripts/database/20260412_learning_test_mapping_nav_341_343.sql) を Supabase に適用後に成立。未適用の環境では §14 の再集計で要確認）

**03 の成功指標（5/19・10/19・19/19）** は、上表の **「本文化」行数**を数えて照合する（MDX ファイル総数やスタブ総数ではない）。

---

## Phase 1 以外（同一ロードマップ内の関連だが KPI 19 に含めない例）

以下は [06](../06_記事作成ロードマップ.md) Phase 2 または [14](../14_記事単元網羅とバックログ.md) で並行管理する。

- 航空工学: `3.2.7`〜`3.2.12` など
- 航空気象: `3.3.1`〜`3.3.12`（スタブ配置・マッピングは [14](../14_記事単元網羅とバックログ.md)）
- 航空法規: `3.1.7`〜`3.1.8`（Phase 2 リスト）

---

**最終更新**: 2026-04-12
