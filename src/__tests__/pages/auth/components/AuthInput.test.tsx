import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthInput } from '@/pages/auth/components/AuthInput';

describe('AuthInput', () => {
  it('パスワード欄に表示切替ボタンを付け、type だけ切り替える', () => {
    render(
      <AuthInput
        label="パスワード"
        id="current-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value="secret"
        onChange={() => undefined}
      />,
    );

    const input = screen.getByLabelText('パスワード');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('id', 'current-password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');

    const toggle = screen.getByRole('button', { name: 'パスワードを表示' });
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'current-password');

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('id', 'current-password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: 'パスワードを隠す' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'パスワードを隠す' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('表示切替ボタンを押してもフォームは送信しない', () => {
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <AuthInput
          label="パスワード"
          id="pw"
          name="password"
          type="password"
          autoComplete="current-password"
          value=""
          onChange={() => undefined}
        />
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'パスワードを表示' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('エラー時に aria-invalid と sr-only の aria-describedby を付与する', () => {
    render(
      <AuthInput
        label="メールアドレス"
        id="email"
        name="email"
        type="email"
        value=""
        onChange={() => undefined}
        errorMessage="メールアドレスを入力してください"
      />,
    );
    const input = screen.getByLabelText('メールアドレス');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const errorNode = document.getElementById(describedBy!);
    expect(errorNode).toHaveClass('sr-only');
    expect(errorNode).toHaveTextContent('メールアドレスを入力してください');
  });

  it('エラーがないとき aria-invalid は false', () => {
    render(
      <AuthInput
        label="メールアドレス"
        id="email"
        name="email"
        type="email"
        value=""
        onChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('aria-invalid', 'false');
  });

  it('text 入力には表示切替ボタンを付けない', () => {
    render(
      <AuthInput
        label="メールアドレス"
        id="email"
        name="email"
        type="email"
        value=""
        onChange={() => undefined}
      />,
    );
    expect(screen.queryByRole('button', { name: 'パスワードを表示' })).not.toBeInTheDocument();
  });
});