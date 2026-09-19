import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthAlert } from '@/pages/auth/components/AuthAlert';

describe('AuthAlert', () => {
  it('scrolls the alert into view when validation copy appears', () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <AuthAlert variant="error">すべての必須項目を入力してください</AuthAlert>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('すべての必須項目を入力してください');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
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
