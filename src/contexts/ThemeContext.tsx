import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'military' | 'dark' | 'auto';
type EffectiveTheme = 'military' | 'dark';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'auto';
    }
    return 'auto';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('military');

  useEffect(() => {
    let newEffectiveTheme: EffectiveTheme;

    if (theme === 'auto') {
      // autoモードでは、システムのダークモード設定に基づいて決定
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newEffectiveTheme = prefersDark ? 'dark' : 'military';
    } else {
      newEffectiveTheme = theme;
    }

    setEffectiveTheme(newEffectiveTheme);

    // DOMクラスの管理
    document.documentElement.classList.remove('light', 'dark', 'military');

    if (newEffectiveTheme === 'military') {
      document.documentElement.classList.add('military');
      document.body.classList.add('military-theme');
      // デジタル迷彩背景を設定
      document.body.style.backgroundImage = `
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
      `;
      document.body.style.backgroundSize = '128px 128px, 96px 96px';
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('military-theme');
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
    }

    // localStorage に保存
    localStorage.setItem('theme', theme);
  }, [theme]);

  // システムのダークモード設定の変更を監視
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const prefersDark = mediaQuery.matches;
        const newEffectiveTheme = prefersDark ? 'dark' : 'military';
        setEffectiveTheme(newEffectiveTheme);

        // DOMクラスの更新
        document.documentElement.classList.remove('light', 'dark', 'military');

        if (newEffectiveTheme === 'military') {
          document.documentElement.classList.add('military');
          document.body.classList.add('military-theme');
          document.body.style.backgroundImage = `
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
          `;
          document.body.style.backgroundSize = '128px 128px, 96px 96px';
        } else {
          document.documentElement.classList.add('dark');
          document.body.classList.remove('military-theme');
          document.body.style.backgroundImage = '';
          document.body.style.backgroundSize = '';
        }
      };

      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
