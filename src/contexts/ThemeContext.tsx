import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 初期テーマの取得
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'auto';
    try {
      const saved = localStorage.getItem('theme') as Theme;
      return saved && ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';
    } catch {
      return 'auto';
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // 実効テーマの更新
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateEffectiveTheme = () => {
      if (theme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    // メディアクエリリスナーの設定
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateEffectiveTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // テーマの保存とDOMの更新
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.className = effectiveTheme;
    } catch (error) {
      console.warn('テーマの保存に失敗しました:', error);
    }
  }, [theme, effectiveTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    effectiveTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 