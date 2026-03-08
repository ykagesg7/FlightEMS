/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Flight Academy Cockpit Academy (USAF-inspired)
        brand: {
          primary: '#7DAAF7',      // Air Force Blue
          'primary-dark': '#5C86CC',
          'primary-light': '#9BC4FF',
          secondary: '#0B1220',     // Dark Navy
          'secondary-light': '#132033',
          'secondary-dark': '#060B14',
          accent: '#7DAAF7',       // Alias for primary
          surface: '#132033',      // Alias for secondary
          'surface-light': '#1B2B45',
          'surface-dark': '#060B14',
        },
        // HUD/Cockpit Colors (App/Focus)
        hud: {
          green: '#39FF14',         // Day mode HUD green
          red: '#ff3b3b',          // Dark/Night mode HUD red
          'red-light': '#ff6666',
          primary: 'var(--hud-primary-color)',
          secondary: 'var(--hud-secondary-color)',
          accent: 'var(--hud-accent-color)',
          dim: 'var(--hud-dim-color)',
          glow: 'var(--hud-glow-color)',
          warning: '#ffaa00',
          danger: '#ff2244',
          info: '#00aaff',
          grid: 'var(--hud-grid-color)',
          surface: 'var(--panel)',  // Cockpit panel background
          'surface-dark': '#0b0b0b',
        },
        // Semantic Colors (Context-aware)
        semantic: {
          primary: 'var(--semantic-primary)',    // Brand yellow or HUD green/red
          secondary: 'var(--semantic-secondary)', // Brand black or HUD dim
          accent: 'var(--semantic-accent)',
          surface: 'var(--semantic-surface)',
          border: 'var(--semantic-border)',
          text: 'var(--semantic-text)',
          'text-muted': 'var(--semantic-text-muted)',
        },
        // Military/Camo Colors (Legacy support)
        military: {
          camo: {
            dark: '#2a3441',
            medium: '#3d4a5a',
            light: '#596980',
            accent: '#758899',
            pixel: '#4a556b',
            base: '#374151',
          },
          fighter: {
            gray: '#2d3748',
            steel: '#4a5568',
            cockpit: '#1a202c',
            panel: '#0d1117',
            hull: '#374151',
          }
        },
        // Legacy alias (maps to Cockpit Academy for backward compat)
        whiskyPapa: {
          yellow: '#7DAAF7',       // Now Air Force Blue
          'yellow-dark': '#5C86CC',
          'yellow-light': '#9BC4FF',
          black: '#0B1220',        // Now Dark Navy
          'black-light': '#132033',
          'black-dark': '#060B14',
        }
      },
      fontFamily: {
        // Display fonts (Marketing/Headers)
        display: ['Arial Black', 'Impact', 'sans-serif'],  // Impactful headers
        // Body fonts (Readable content)
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Monospace fonts (HUD/Data)
        mono: ['Courier New', 'Consolas', 'JetBrains Mono', 'monospace'],
        hud: ['Courier New', 'monospace'],  // Legacy alias
        military: ['Arial Black', 'sans-serif'],  // Legacy alias
        tactical: ['Consolas', 'monospace'],  // Legacy alias
      },
      animation: {
        'hud-glow': 'hud-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'hud-glow': {
          '0%': {
            textShadow: '0 0 5px var(--hud-glow-color), 0 0 10px var(--hud-glow-color)',
            opacity: '0.9'
          },
          '100%': {
            textShadow: '0 0 10px var(--hud-glow-color), 0 0 20px var(--hud-glow-color)',
            opacity: '1'
          }
        }
      },
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
          linear-gradient(var(--hud-grid-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--hud-grid-color) 1px, transparent 1px)
        `,
        'cockpit-panel': `
          linear-gradient(135deg, #374151 0%, #2a3441 25%, #1a202c 50%, #0d1117 75%, #1a202c 100%)
        `,
        'fighter-hull': `
          linear-gradient(45deg, #2d3748 0%, #374151 25%, #4a5568 50%, #374151 75%, #2d3748 100%)
        `,
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
      boxShadow: {
        'hud-glow': '0 0 15px var(--hud-glow-color)',
        'hud-button': '0 0 8px var(--hud-glow-color)',
        'cockpit-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
        'fighter-panel': 'inset 0 1px 3px rgba(0, 0, 0, 0.7)',
        'hud-display': '0 0 20px var(--hud-glow-color)'
      },
      backdropBlur: {
        'hud': '2px',
        'tactical': '1px',
      },
      typography: (theme) => ({
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
        hud: {
          css: {
            color: 'var(--hud-primary-color)',
            fontFamily: 'Courier New, monospace',
            h1: {
              color: 'var(--hud-primary-color)',
              textShadow: '0 0 8px var(--hud-glow-color)',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            },
            h2: {
              color: 'var(--hud-secondary-color)',
              textShadow: '0 0 6px var(--hud-glow-color)',
              letterSpacing: '0.03em',
            },
            h3: {
              color: 'var(--hud-accent-color)',
              textShadow: '0 0 4px var(--hud-glow-color)',
            },
            a: {
              color: 'var(--hud-secondary-color)',
              textDecoration: 'none',
              '&:hover': {
                textShadow: '0 0 10px var(--hud-glow-color)',
              }
            },
            strong: {
              color: 'var(--hud-glow-color)',
              textShadow: '0 0 4px var(--hud-glow-color)',
            },
            code: {
              color: 'var(--hud-primary-color)',
              backgroundColor: 'var(--hud-dim-color)',
              border: '1px solid var(--hud-accent-color)',
              borderRadius: '0',
              padding: '2px 6px',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

