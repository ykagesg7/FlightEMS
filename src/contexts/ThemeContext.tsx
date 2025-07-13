import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'day' | 'dark' | 'auto';
type EffectiveTheme = 'day' | 'dark';

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

  // autoモードの定期的な再評価をトリガーするためのstate
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        setTick(prev => prev + 1);
      }, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [theme]);

  // themeとtickからeffectiveThemeを計算する
  const effectiveTheme = useMemo((): EffectiveTheme => {
    if (theme === 'auto') {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'day' : 'dark';
    }
    return theme;
  }, [theme, tick]);

  // DOM操作の副作用
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('day', 'dark');
    root.classList.add(effectiveTheme);
    document.body.style.backgroundColor = effectiveTheme === 'day' ? '#0b1d3a' : '#000000';
  }, [effectiveTheme]);

  // localStorageへの保存の副作用
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = { theme, effectiveTheme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
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