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
  // --- 初期テーマ取得 ---
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'auto';
    }
    return 'auto';
  });

  // 実際に適用されるテーマ
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('military');

  /**
   * AUTO の場合は時刻で判定 (06:00–17:59 -> DAY, 18:00–05:59 -> DARK)
   */
  const resolveEffectiveTheme = (mode: Theme): EffectiveTheme => {
    if (mode === 'auto') {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'military' : 'dark';
    }
    return mode;
  };

  useEffect(() => {
    const newEffectiveTheme = resolveEffectiveTheme(theme);
    setEffectiveTheme(newEffectiveTheme);

    // クラスおよび背景設定を更新
    document.documentElement.classList.remove('dark', 'military');

    if (newEffectiveTheme === 'military') {
      // === DAY THEME ===
      document.documentElement.classList.add('military');
      document.body.classList.add('military-theme');
      // 背景をネイビーブルーに変更（迷彩無し）
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundColor = '#0b1d3a';
    } else {
      // === DARK THEME ===
      document.documentElement.classList.add('dark');
      document.body.classList.remove('military-theme');
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundColor = '#000000';
    }

    // localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // AUTO の場合に時刻が変わってもテーマが切り替わるよう 30分ごとに再判定
  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        const newTheme = resolveEffectiveTheme('auto');
        setEffectiveTheme(newTheme);
      }, 30 * 60 * 1000);
      return () => clearInterval(interval);
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
