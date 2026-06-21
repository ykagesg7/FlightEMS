import { describe, expect, it, vi, beforeEach } from 'vitest';

const deleteUserMock = vi.fn();
const getUserMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
      signInWithPassword: signInWithPasswordMock,
    },
  })),
}));

vi.mock('../../../api/_lib/supabaseService', () => ({
  getServiceSupabase: () => ({
    auth: { admin: { deleteUser: deleteUserMock } },
  }),
}));

describe('api/account/delete', () => {
  beforeEach(() => {
    vi.resetModules();
    deleteUserMock.mockReset();
    getUserMock.mockReset();
    signInWithPasswordMock.mockReset();
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  });

  it('rejects invalid confirm phrase', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: { confirmPhrase: 'wrong' },
      } as never,
      res as never,
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deletes user when authorized', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'p@example.com', identities: [{ provider: 'google' }] } },
      error: null,
    });
    deleteUserMock.mockResolvedValue({ error: null });

    const handler = (await import('../../../api/account/delete')).default;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: { confirmPhrase: 'アカウントを削除' },
      } as never,
      res as never,
    );
    expect(deleteUserMock).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
