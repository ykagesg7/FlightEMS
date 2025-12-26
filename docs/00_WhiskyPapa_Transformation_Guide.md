# Whisky Papa Transformation Guide: "The Pilot's Narrative"

**最終更新: 2025年12月26日（実装状況評価・ファイル整理計画）**

## 1. プロジェクト概要

本プロジェクトは、既存のパイロット学習アプリ `FlightAcademyTsx` を基盤とし、エアロバティックチーム「ウイスキーパパ（Whisky Papa）」の公式サイト兼ファンエンゲージメントプラットフォームへと昇華させるものである。

### コア・コンセプト: "Wingman Program"

単なる広報サイトではなく、ファンを「観客」から「僚機（Wingman）」へと育てる体験型プラットフォーム。

- **SEE (Hero/Gallery)**: 圧倒的な映像美で「空への憧れ」を作る。
- **KNOW (Mission/Planning)**: フライトプランナーやクイズを「ミッション」として提供し、パイロットの知性を体験させる。
- **FLY (Experience)**: ランクを上げたユーザーだけが、限定グッズ購入権や体験搭乗へのアクセス権を得る。

### ターゲット

- エアショーファン、航空機マニア
- パイロット志望者（自衛隊・民間）
- フライトシミュレーター愛好家 (Simmers)

---

## 2. チーム構成と役割（サイト内での表現）

チームメンバー全員の特性を機能として実装する。

| 役割 | メンバー | 機能・コンテンツ |
| :--- | :--- | :--- |
| **Pilot** | **Masa (内海昌浩)** | **Master Instructor**: ミッションの総監修。トップメッセージ。 |
| **Narrator** | **Jun (ナレーター)** | **Briefing Officer**: ミッション通達、ブログ（脚本風）、体験搭乗時のナレーション。 |
| **Photographer** | **Ohgane (PR)** | **Visual Director**: 公式ギャラリー（パララックス演出）。ファンの投稿写真の選定（Award）。 |
| **Shop** | **Osu (おす士長)** | **Quartermaster (補給係)**: PX（売店）の管理。ランク限定グッズ（ワッペン等）の提供。 |

---

## 3. ディレクトリ構成 (Hybrid Architecture)

「広報（Marketing）」と「アプリ（App）」を融合させたハイブリッド構成とする。

```text
src/
├── components/
│   ├── common/             # Header, Footer (Layout分岐対応)
│   ├── marketing/          # 広報・ストーリーテリング用
│   │   ├── Hero.tsx
│   │   ├── RankBadge.tsx
│   │   ├── MissionCard.tsx
│   │   └── ComingSoonBadge.tsx
│   ├── shop/               # 物販用
│   │   └── ProductCard.tsx
│   ├── gallery/            # 双方向ギャラリー
│   │   ├── PhotoGrid.tsx
│   │   └── UploadModal.tsx
│   ├── blog/               # ブログ機能
│   │   └── NarratorTemplate.tsx
│   ├── experience/         # 【新規】体験搭乗用
│   │   ├── BookingForm.tsx # 予約フォーム
│   │   └── SummonsEffect.tsx # 招集命令演出
│   ├── dashboard/          # 【新規】LMSダッシュボード用
│   │   ├── GoalSetting.tsx # 目標設定
│   │   └── ProgressChart.tsx # 進捗グラフ
│   ├── planning/           # 【既存資産】Flight Planning機能
│   └── academy/            # 【既存資産】学習・クイズ機能
│
├── layouts/
│   ├── MarketingLayout.tsx # 黒×黄色(WPカラー)基調
│   └── AppLayout.tsx       # HUD/Dashboardデザイン
│
├── pages/
│   ├── Home.tsx            # LP
│   ├── About.tsx           # Team & Extra300L Spec
│   ├── Gallery.tsx         # Official & Fan Posting
│   ├── Shop.tsx            # "The Hangar Store"
│   ├── Blog.tsx            # "Sky Notes"
│   ├── BlogDetail.tsx
│   ├── Experience.tsx      # 体験搭乗予約 (Wingman限定)
│   ├── mission/            # ゲーミフィケーション
│   │   └── Dashboard.tsx   # ランク確認・ミッション一覧
│   └── tools/              # ツール群
│       ├── planner/        # Flight Planner
│       └── exam/           # CPL Quiz
│
├── content/                # MDX
│   ├── pilot/              # Pilot記事
│   ├── narrator/           # Narrator記事
│   └── curriculum/         # 【拡充】CPL学習記事
│
└── styles/
    └── theme.ts            # Theme definitions
```

---

## 4. 実装状況（2025年12月26日更新）

### ✅ Phase 1: Brand Foundation (完了)

- MarketingLayout/AppLayout 実装
- ブランドカラー適用、Hero/Aboutページ実装

### ✅ Phase 2: Gamification (完了)

- ランクシステム (Spectator/Trainee/Wingman)
- ミッション機能、XP獲得ロジック
- データベース: `profiles`拡張、`missions`、`user_missions`テーブル

### ✅ Phase 3: Engagement (完了)

- ランク連動型 Hangar Store
- 双方向 Interactive Gallery（イベント管理、いいね機能、承認制）
- Sky Notes Blog (Narrator Template) - Mission Dashboardに統合
- データベース: `products`、`fan_photos`、`gallery_events`テーブル

### ⏸️ Phase 4: Real Experience (承認待ち - 長期的実装予定)

**状況**: 体験搭乗プログラム自体がまだ承認されていないため、実装は長期的に予定されています。

- **完了**: Coming Soonページ（Mission Dashboardのexperienceタブ）、ランク制限ロジック（Wingmanランクチェック）
- **未実装（承認後に実装予定）**:
  - 予約フォーム実装 (`BookingForm.tsx`)
  - 招集命令演出 (`SummonsEffect.tsx`)
  - データベース: `flight_bookings`テーブル
  - 予約管理 (Admin) 機能

**注記**: 現在は「承認待ち」状態を表示するComing Soonページのみ実装済み。体験搭乗プログラムの承認後、順次実装を開始します。

### ✅ Phase 4.5: Design System & Rebranding (完了)

- **デュアルテーマ戦略確立**:
  - **Marketing Theme**: Whisky Papaブランド（Yellow/Black）
  - **App Theme**: HUD/Cockpitスタイル（Day: Green, Dark: Red）
- **共通UIコンポーネント基盤**: `Button`, `Card`, `Typography` の統一
- **ページリブランディング**:
  - Home (Guest): ブランドカラーを全面適用
  - Dashboard: HUDスタイルへの完全移行
- **認証/初期化フロー改善**: `authStore` と `useGamification` の連携強化

### ✅ Phase 4.6: MarketingLayout統合とコンテンツ改善 (完了)

- **ナビゲーション機能の拡張**:
  - HUD時計の追加（ログイン後のみ）
  - PLANリンクの追加（ログイン後のみ）
  - MISSIONボタンの条件表示（ログイン後のみ）
  - SCHEDULEページの新設
- **認証ページのリブランディング**:
  - `AuthPage`を`MarketingLayout`配下へ移動
  - Whisky Papaテーマへの完全移行
- **MISSIONページの機能統合**:
  - PLANボタンの削除と飛行計画タブの追加
- **HOME/ABOUTページの改善**:
  - 公式サイトのコアメッセージ統合
  - Aerobatics要素のABOUTへの統合
- **Linksページの新設**:
  - 公式サイト、SNS、スポンサー、問い合わせ先のリンク集
  - フッターからのみアクセス可能

### ✅ Phase 4.7: リポジトリ整理（2025年12月24日完了）

- **不要ファイルの退避**:
  - 未参照ページ4ファイル（Blog、BlogDetail、Experience、AccountCenter）を`archive/2025-12-24/`に退避
  - 重複静的ファイル1ファイル（`src/content/05_TacanApproach.html`）を退避
  - 未使用候補1ファイル（`public/newpoints.json`）を退避
- **ルーティング整理**:
  - `/blog*`、`/experience`、`/account`は`/mission`や`/profile`へリダイレクト
  - `App.tsx`のコメントアウトされたlazy importを整理
- **ドキュメント整理**:
  - `docs/README.md`を新規作成し、主要ドキュメントへの導線を明確化
- **検証完了**:
  - ルーティング、静的ファイル、Git管理の確認完了
  - 詳細は`archive/2025-12-24/`内のレポートを参照

### 📊 Phase 5: Advanced LMS (部分実装)

**目標**: ユーザーの継続率向上と「パイロットの知性」への没入。

- **完了**:
  - 進捗追跡機能（`useArticleProgress`、`useLearningProgress`）
  - 進捗可視化（`ReadingProgressBar`、`ProgressSidebar`）
  - 学習ダッシュボード（`AdaptiveLearningDashboard`、`LearningAnalyticsDashboard`）
  - データベース: `learning_progress`テーブル
- **未実装**:
  - 目標設定機能 (`GoalSetting.tsx`)
  - 進捗グラフ (`ProgressChart.tsx`)
  - 弱点分析機能
  - データベース: `learning_goals`、`daily_progress`テーブル

**進捗**: 基本的な進捗管理は実装済み。目標設定・可視化機能は今後実装予定。

### 📝 Phase 6: Content Expansion & Analytics (未着手)

**目標**: コンテンツの質的向上とデータ駆動型改善。

- **未着手**:
  - CPL記事拡充: 重要度・頻出度分析に基づいた19記事の投入
  - ランキング機能: XPやクイズ正答率に基づくユーザーランキング（匿名/公開選択可）
  - モバイル最適化: PWAとしての挙動改善、タッチ操作の最適化

**注記**: モバイル対応は一部実装済み（レスポンシブデザイン）だが、PWA機能は未実装。

---

## 4.1. 実装達成度サマリー

**全体達成度: 約85%**

- ✅ **Phase 1-3**: 100%完了（コア機能実装済み）
- ✅ **Phase 4.5-4.7**: 100%完了（設計システム・統合完了）
- ⏸️ **Phase 4**: 約30%完了（Coming Soonページ実装済み、予約機能は承認待ち）
- 📊 **Phase 5**: 約60%完了（進捗管理実装済み、目標設定は未実装）
- 📝 **Phase 6**: 未着手

---

## 5. データベーススキーマ拡張計画

### ゲーミフィケーション関連（既存）

- **`profiles` テーブル拡張**:
  - `rank` (user_rank_type): 'spectator' | 'trainee' | 'wingman'
  - `xp_points` (INTEGER): ユーザーの経験値
- **`missions` テーブル**: ミッション定義
- **`user_missions` テーブル**: ユーザーのミッション達成状況

### エンゲージメント関連（既存）

- **`products` テーブル**: ランク連動型ショップ商品
- **`fan_photos` テーブル**: ファン投稿写真（承認制）

### 学習目標・進捗管理 (Phase 5用)

```sql
-- 学習目標テーブル
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'daily_questions', 'weekly_time', 'certification'
  target_value INTEGER NOT NULL,
  period_start DATE DEFAULT CURRENT_DATE,
  period_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 日次進捗ログ
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  questions_answered INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### 体験搭乗予約 (Phase 4用)

```sql
CREATE TABLE flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  preferred_date_1 DATE NOT NULL,
  preferred_date_2 DATE,
  preferred_date_3 DATE,
  status TEXT DEFAULT 'pending', -- pending, approved, completed, cancelled
  narrator_option BOOLEAN DEFAULT false, -- Junさんのナレーションオプション
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. 今後の開発ロードマップ

### 🚀 Phase 4: Real Experience - Full Implementation (承認後に実装)

**目標**: 「憧れ」を「現実」に変える予約フローの完遂。

**状況**: 体験搭乗プログラムの承認待ち。承認後、順次実装を開始します。

1. **予約フォーム実装 (`BookingForm.tsx`)**:
   - Wingmanランク限定アクセス制御。
   - 第3希望までの日程選択、ナレーションオプション選択。
   - データベース: `flight_bookings`テーブルの作成

2. **招集命令演出 (`SummonsEffect.tsx`)**:
   - 予約完了後、Junさんからの「招集命令」が表示されるモーダル演出。
   - タイプライターエフェクトとサウンド（任意）を活用。

3. **予約管理 (Admin)**:
   - 予約ステータスの更新、マサ氏・スタッフへの通知機能（Edge Functions）。

### 📚 Phase 5: Advanced LMS (Learning Management System)

**目標**: ユーザーの継続率向上と「パイロットの知性」への没入。

1. **目標設定機能 (`GoalSetting.tsx`)**:
   - 「1日10問」「週3時間」などの目標設定UI。

2. **進捗可視化 (`ProgressChart.tsx`)**:
   - ダッシュボードでのグラフ表示。達成度に応じたXPボーナス。

3. **弱点分析**:
   - クイズ結果から苦手カテゴリを特定し、推奨記事をレコメンド。

### 📝 Phase 6: Content Expansion & Analytics

**目標**: コンテンツの質的向上とデータ駆動型改善。

1. **CPL記事拡充**: 重要度・頻出度分析に基づいた19記事の投入。

2. **ランキング機能**: XPやクイズ正答率に基づくユーザーランキング（匿名/公開選択可）。

3. **モバイル最適化**: PWAとしての挙動改善、タッチ操作の最適化。

---

## 7. 開発時の注意点 (Update)

- **UX/Storytelling**:
  - Phase 4の予約完了画面は、単なる「送信完了」ではなく、物語の一部としての「命令受領」体験を提供するようデザインすること。

- **Data Integrity**:
  - 学習目標機能の実装時は、既存の `learning_records` との整合性を保ち、集計クエリのパフォーマンスに配慮すること。

- **Scalability**:
  - 今後コンテンツが増えるため、MDXの読み込みロジックや画像最適化を引き続き徹底すること。

- **既存資産の保護**: `FlightPlanning` コンポーネントのロジック（測地線計算等）は複雑なため、安易に書き換えず `src/components/planning` にカプセル化して再利用すること。

- **パフォーマンス**: ギャラリーや動画を多用するため、`Next/Image`相当の最適化や、Lazy Loadingを徹底すること。

- **MDX運用**: 記事はGit管理を基本とするが、将来的にCMS導入も視野に、データフェッチ部分は抽象化しておくこと。

- **Storage Bucket**: `fan-photos` バケットはSupabase Dashboardで手動作成が必要（公開読み取り、認証ユーザー書き込み、5MB制限）。
