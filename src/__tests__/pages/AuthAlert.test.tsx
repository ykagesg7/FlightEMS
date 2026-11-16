import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthAlert } from '@/pages/auth/components/AuthAlert';

describe('AuthAlert', () => {
  it('scrolls the alert into view when validation copy appears', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <AuthAlert variant="error">すべての必須項目を入力してください</AuthAlert>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('すべての必須項目を入力してください');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    vi.unstubAllGlobals();
  });

  it('uses instant scroll when reduced motion is preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(<AuthAlert variant="error">エラー</AuthAlert>);

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' });
    vi.unstubAllGlobals();
  });

  it('does not throw when scrollIntoView is missing (jsdom)', () => {
    const proto = HTMLElement.prototype;
    const original = proto.scrollIntoView;
    Object.defineProperty(proto, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    try {
      expect(() => {
        render(<AuthAlert variant="timeout">認証がタイムアウトしました。再度ログインしてください。</AuthAlert>);
      }).not.toThrow();
      expect(screen.getByRole('status')).toHaveTextContent('認証がタイムアウトしました。再度ログインしてください。');
    } finally {
      Object.defineProperty(proto, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: original,
      });
    }
  });
});
