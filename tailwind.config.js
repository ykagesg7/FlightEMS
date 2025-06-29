/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // HUD風カラーパレット（アニメーション削除版）
      colors: {
        hud: {
          primary: '#00ff41',     // HUD標準緑
          secondary: '#00ff88',   // 明るいHUD緑
          accent: '#00cc44',      // アクセントHUD緑
          dim: '#003311',         // 暗いHUD緑
          glow: '#44ff66',        // グローエフェクト
          warning: '#ffaa00',     // 警告オレンジ
          danger: '#ff2244',      // 危険赤
          info: '#00aaff',        // 情報青
          grid: '#004422',        // グリッドライン
        },
        military: {
          // フラットなデジタル迷彩カラーパレット
          camo: {
            dark: '#2a3441',      // 迷彩ダーク
            medium: '#3d4a5a',    // 迷彩ミディアム
            light: '#596980',     // 迷彩ライト
            accent: '#758899',    // 迷彩アクセント
            pixel: '#4a556b',     // ピクセル迷彩
            base: '#374151',      // ベース色
          },
          // 戦闘機カラー
          fighter: {
            gray: '#2d3748',      // 戦闘機グレー
            steel: '#4a5568',     // スチールグレー
            cockpit: '#1a202c',   // コックピットダーク
            panel: '#0d1117',     // パネルブラック
            hull: '#374151',      // 機体色
          }
        }
      },
      // HUD風フォント
      fontFamily: {
        hud: ['Courier New', 'monospace'],
        military: ['Arial Black', 'sans-serif'],
        tactical: ['Consolas', 'monospace'],
      },
      // シンプルなアニメーション（削減版）
      animation: {
        'hud-glow': 'hud-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'hud-glow': {
          '0%': {
            textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41',
            opacity: '0.9'
          },
          '100%': {
            textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
            opacity: '1'
          }
        }
      },
      // 大きなフラットデジタル迷彩パターン
      backgroundImage: {
        'digital-camo': `
          repeating-linear-gradient(
            0deg,
            #2a3441 0px,
            #2a3441 32px,
            #3d4a5a 32px,
            #3d4a5a 64px,
            #596980 64px,
            #596980 96px,
            #4a556b 96px,
            #4a556b 128px
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 24px,
            #374151 24px,
            #374151 48px,
            transparent 48px,
            transparent 72px,
            #2a3441 72px,
            #2a3441 96px
          )
        `,
        'hud-grid': `
          linear-gradient(rgba(0,255,65,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.15) 1px, transparent 1px)
        `,
        'cockpit-panel': `
          linear-gradient(135deg, #374151 0%, #2a3441 25%, #1a202c 50%, #0d1117 75%, #1a202c 100%)
        `,
        'fighter-hull': `
          linear-gradient(45deg, #2d3748 0%, #374151 25%, #4a5568 50%, #374151 75%, #2d3748 100%)
        `,
        // カード用の迷彩背景
        'camo-card': `
          repeating-linear-gradient(
            45deg,
            #2a3441 0px,
            #2a3441 16px,
            #3d4a5a 16px,
            #3d4a5a 32px,
            #596980 32px,
            #596980 48px,
            #4a556b 48px,
            #4a556b 64px
          )
        `
      },
      backgroundSize: {
        'camo-pattern': '128px 128px, 96px 96px',
        'hud-grid': '24px 24px, 24px 24px',
        'camo-card': '64px 64px'
      },
      // シンプルなボックスシャドウ
      boxShadow: {
        'hud-glow': '0 0 15px rgba(0, 255, 65, 0.4)',
        'hud-button': '0 0 8px rgba(0, 255, 65, 0.3)',
        'cockpit-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
        'fighter-panel': 'inset 0 1px 3px rgba(0, 0, 0, 0.7)',
        'hud-display': '0 0 20px rgba(0, 255, 65, 0.2)'
      },
      // カスタムブラー
      backdropBlur: {
        'hud': '2px',
        'tactical': '1px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
        dark: {
          css: {
            color: '#d1d5db',
            h1: { color: '#e5e7eb' },
            h2: { color: '#e5e7eb' },
            h3: { color: '#e5e7eb' },
            a: { color: '#60a5fa' },
            strong: { color: '#f9fafb' },
            blockquote: { color: '#d1d5db' },
            code: {
              color: '#e5e7eb',
              backgroundColor: '#374151',
            },
          },
        },
        // シンプルなHUD風タイポグラフィ
        hud: {
          css: {
            color: '#00ff41',
            fontFamily: 'Courier New, monospace',
            h1: {
              color: '#00ff41',
              textShadow: '0 0 8px #00ff41',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            },
            h2: {
              color: '#00ff88',
              textShadow: '0 0 6px #00ff88',
              letterSpacing: '0.03em',
            },
            h3: {
              color: '#00cc44',
              textShadow: '0 0 4px #00cc44',
            },
            a: {
              color: '#00ff88',
              textDecoration: 'none',
              '&:hover': {
                textShadow: '0 0 10px #00ff88',
              }
            },
            strong: {
              color: '#44ff66',
              textShadow: '0 0 4px #44ff66',
            },
            code: {
              color: '#00ff41',
              backgroundColor: 'rgba(0, 51, 17, 0.4)',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              borderRadius: '0',
              padding: '2px 6px',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
