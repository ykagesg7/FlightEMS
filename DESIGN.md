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
  display: "Arial Black, Impact, sans-serif"
  body: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
  mono: "Courier New, Consolas, JetBrains Mono, monospace"
spacing:
  unit: "0.25rem"
  article_max_width: "48rem"
---

## Overview

**Flight Academy（Cockpit / HUD）** aesthetic: dark navy surfaces, Air Force–inspired blue primary, and HUD-style neon accents for focus states. Learning content uses **Typography (`prose`)** with **`prose-invert`** for lesson readability (see `MDXContent` / component guide).

Implement UI with **Tailwind** tokens defined in [`tailwind.config.js`](tailwind.config.js) — prefer `brand.*`, `hud.*`, and CSS-variable-driven `semantic.*` over raw hex in components.

## Color usage

| Token role | Tailwind / variable | Usage |
|------------|---------------------|--------|
| Primary actions / links | `brand.primary` | Buttons, key highlights |
| App chrome / panels | `brand.secondary`, `brand.surface` | Layout backgrounds |
| HUD day accent | `hud.green` | Tactical / planning emphasis |
| HUD night accent | `hud.red` | Night mode emphasis |
| Warning / caution | `hud.warning` | Non-destructive alerts |
| Danger | `hud.danger` | Destructive or critical |

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

## Japanese content

- Lesson voice and structure: follow [`.cursor/rules/mdx-article-guide.mdc`](.cursor/rules/mdx-article-guide.mdc).
- Avoid `§` in user-visible strings (rendering issues).
