import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthButton } from '../../../src/components/auth/AuthButton';
import * as authStore from '../../../src/stores/authStore';

// Zustandストアのモック
vi.mock('../../../src/stores/authStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('ログイン状態で「ログアウト」ボタンが表示され、クリックでsignOutが呼ばれる', async () => {
    const mockSignOut = vi.fn();
    (authStore.useAuthStore as any).mockImplementation((selector: any) => selector({
      user: { id: '1', email: 'test@example.com' },
      profile: { id: '1', username: 'test', email: 'test@example.com' },
      session: { user: { id: '1' } },
      signOut: mockSignOut,
      loading: false,
      initialized: true,
    }));
    render(
      <BrowserRouter>
        <AuthButton />
      </BrowserRouter>
    );
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ログアウト'));
    // signOutが呼ばれる
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('未ログイン状態で「ログイン」ボタンが表示され、クリックでnavigateが呼ばれる', () => {
    (authStore.useAuthStore as any).mockImplementation((selector: any) => selector({
      user: null,
      profile: null,
      session: null,
      signOut: vi.fn(),
      loading: false,
      initialized: true,
    }));
    render(
      <BrowserRouter>
        <AuthButton />
      </BrowserRouter>
    );
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ログイン'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});
