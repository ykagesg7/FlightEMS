/**
 * Whisky Papa Flight Academy Theme Constants
 * TypeScript用のテーマ定数定義
 * Tailwind設定とCSS変数と同期
 */

/**
 * Whisky Papa Brand Colors (Marketing/Show)
 */
export const BrandColors = {
  primary: '#FFD700',      // Whisky Papa Yellow
  primaryDark: '#FFC700',
  primaryLight: '#FFE44D',
  secondary: '#121212',    // Whisky Papa Black
  secondaryLight: '#1a1a1a',
  secondaryDark: '#0a0a0a',
} as const;

/**
 * HUD/Cockpit Colors (App/Focus)
 */
export const HUDColors = {
  green: '#39FF14',        // Day mode HUD green
  red: '#ff3b3b',          // Dark/Night mode HUD red
  redLight: '#ff6666',
  warning: '#ffaa00',
  danger: '#ff2244',
  info: '#00aaff',
} as const;

/**
 * Semantic Color Tokens (Context-aware)
 * These map to either Brand or HUD colors depending on context
 */
export const SemanticColors = {
  primary: 'var(--semantic-primary)',
  secondary: 'var(--semantic-secondary)',
  accent: 'var(--semantic-accent)',
  surface: 'var(--semantic-surface)',
  border: 'var(--semantic-border)',
  text: 'var(--semantic-text)',
  textMuted: 'var(--semantic-text-muted)',
} as const;

/**
 * Typography Tokens
 */
export const Typography = {
  display: ['Arial Black', 'Impact', 'sans-serif'],
  body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['Courier New', 'Consolas', 'JetBrains Mono', 'monospace'],
  hud: ['Courier New', 'monospace'],  // Legacy alias
  military: ['Arial Black', 'sans-serif'],  // Legacy alias
  tactical: ['Consolas', 'monospace'],  // Legacy alias
} as const;

/**
 * Legacy Whisky Papa Theme (Backward compatibility)
 * @deprecated Use BrandColors instead
 */
export const WhiskyPapaTheme = {
  colors: {
    yellow: BrandColors.primary,
    yellowDark: BrandColors.primaryDark,
    yellowLight: BrandColors.primaryLight,
    black: BrandColors.secondary,
    blackLight: BrandColors.secondaryLight,
    blackDark: BrandColors.secondaryDark,
    hudGreen: HUDColors.green,
  },
  fonts: {
    hud: Typography.hud,
    military: Typography.military,
    tactical: Typography.tactical,
  },
} as const;

export type WhiskyPapaColor = keyof typeof WhiskyPapaTheme.colors;
export type BrandColor = keyof typeof BrandColors;
export type HUDColor = keyof typeof HUDColors;
export type SemanticColor = keyof typeof SemanticColors;

