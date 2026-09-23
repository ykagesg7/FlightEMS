---
name: FlightAcademy
version: 1.0.0
colors:
  brand_primary: "#7DAAF7"
  brand_primary_dark: "#5C86CC"
  brand_primary_light: "#9BC4FF"
  brand_secondary: "#0B1220"
  brand_surface: "#132033"
  hud_green: "#39FF14"
  hud_red: "#ff3b3b"
  hud_warning: "#ffaa00"
  hud_danger: "#ff2244"
  hud_info: "#00aaff"
typography:
  display: "Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, Yu Gothic, Yu Gothic UI, Meiryo, system-ui, sans-serif"
  body: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
  mono: "Courier New, Consolas, JetBrains Mono, monospace"
spacing:
  unit: "0.25rem"
  article_max_width: "48rem"
---

## Overview

**Flight Academy** splits tone by surface: **guest acquisition** routes (`/`, logged-out articles) use a calm navy learning brand; **Cockpit / HUD** neon accents belong to **logged-in app chrome** only (dashboard, planning instruments). See [「ゲスト面とアプリ内」](#ゲスト面とアプリ内). Learning content uses **Typography (`prose`)** with **`prose-invert`** for lesson readability (see `MDXContent` / component guide).

Implement UI with **Tailwind** tokens defined in [`tailwind.config.js`](tailwind.config.js) — prefer `brand.*`, `hud.*`, and CSS-variable-driven `semantic.*` over raw hex in components.

## Color usage

| Token role | Tailwind / variable | Usage |
|------------|---------------------|--------|
| Primary actions / links | `brand.primary` | Buttons, key highlights |
| App chrome / panels | `brand.secondary`, `brand.surface` | Layout backgrounds |
| Planning emphasis | `brand.primary` | Border or weight on planning UI — not a new hue, not neon green |
| Achievement / XP / completion | `hud.green` | Progress, streaks, completion states only |
| Night / low-light surfaces | `brand.secondary` (deeper navy shift) | Darker navy backgrounds — not `hud.red` |
| Warning / caution | `hud.warning` | Non-destructive alerts |
| Danger / destructive / error | `hud.danger` | Destructive actions, critical errors |

## ゲスト面とアプリ内

**ゲスト面**（未ログインの獲得導線）と**アプリ内**（ログイン後の学習・計画）でトーンを分ける。

| 面 | 対象 | トーン |
|----|------|--------|
| ゲスト面 | `/`、未ログイン `/articles`、記事ヘッダークローム | 紺（`brand.secondary` / `brand.surface`）、落ち着いた青、道真・梅・編隊の既存ビジュアル。**HUD ネオンは使わない** |
| アプリ内 | ダッシュボード、計画インストルメント、ログイン後クローム | 既存の Cockpit / HUD 美学（ネオンアクセント可） |

記事本文・幅・`prose-invert`、Profile Hub の規定はこの章で変更しない。

## CTA の順

ゲスト面の CTA 優先順位（上から主 → 副 → 第三）。価格表記はしない。

| 順位 | ラベル例 | スタイル |
|------|----------|----------|
| Primary | 登録 | 白地ボタン、文字色 `brand.secondary` |
| Secondary | 記事を読む | アウトライン。枠・文字色 `brand.primary`、背景は透明 |
| Tertiary | ログイン | テキストリンク。文字色 `brand.primary` |

**使わない文言**: ミッション開始、スクランブル。

## OG・SNS

- OG 画像とシリーズ告知カードはゲスト面のトーン（紺、落ち着いた青）に揃える。**HUD ネオンは使わない**。Impact や Arial Black 系のレタリングも使わない。
- 画像上の文字は少なく。
- `topgun_*` というアセット名、「ミッション開始」「スクランブル」は使わない。
- main 上の習慣ヒーロー（seek-first-to-understand、synergize、sharpen-the-saw）はそのまま。本規定は**新規** OG・シリーズカードにのみ適用。
- ピクセルサイズや制作パイプラインの規定はここでは設けない。

## 信頼

- **対象**: 社会人訓練生・航空学生、PPL/CPL 志望者。本プロダクトは記事と学習コンテンツを提供する。
- 法規は学習テーマとして名指ししてよい。法的結論は書かない。HUD 語彙を運用手順のように見せない。
- 価格表記やプラン名は書かない。

## Typography

- **Marketing / display headers**: `font-display`
- **Body**: `font-body`
- **Data, coordinates, numeric tables**: `font-mono` or `font-hud`
- **MDX articles**: follow [`docs/Component_Structure_Guide.md`](docs/Component_Structure_Guide.md) (`prose-invert`, code blocks, monetization grid `not-prose`)

## Components (principles)

- Reuse **`src/components/ui/*`** before adding new primitives.
- **MDX**: use shared `<Image>` / MDX components from `src/components/mdx/`; do not introduce raw `<img>` in lesson content (see MDX rule).
- **Accessibility**: preserve contrast on dark backgrounds; avoid relying solely on color for state.

## Layout

- Prefer existing page shells and `max-w-*` patterns used in articles (`max-w-3xl` inner column with `min-w-0` where flex children exist).
- **Breakpoints**: follow Tailwind defaults (`md`, `lg`, …).

## Profile Hub (`/profile`)

- **Mobile (`< md`)**: iOS Settings–style section list → detail drill-down via `?tab=`. Back link: `ProfileHubBackLink`.
- **Desktop (`md+`)**: sticky left `ProfileHubSidebar` + content; no list screen.
- **Completion**: `ProfileCompletionStrip` in mobile header area and sidebar (not a standalone card).
- **Danger zone**: account delete block uses `border-red-500/40` / red heading; confirm phrase required.
- **Unsaved changes**: mobile `ProfileStickySaveBar` when explicit-save forms are dirty; notifications auto-save (no bar).
- **Admin**: no admin items in Profile; use header ADMIN + `/admin` Hub.

## Japanese content

- Lesson voice and structure: follow [`.cursor/rules/mdx-article-guide.mdc`](.cursor/rules/mdx-article-guide.mdc).
- Avoid `§` in user-visible strings (rendering issues).
