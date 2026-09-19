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
});
