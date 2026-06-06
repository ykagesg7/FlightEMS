import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPasswordRecoveryActive } from '../../auth/passwordRecovery';
import { useAuthStore } from '../../stores/authStore';

/** パスワードリセット中は /auth/recovery 以外へ行かせない（トップ自動遷移・PWマネージャー誤ログイン防止） */
export function PasswordRecoveryGuard(): null {
  const passwordRecoveryPending = useAuthStore((state) => state.passwordRecoveryPending);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPasswordRecoveryActive()) {
      return;
    }
    if (location.pathname === '/auth/recovery') {
      return;
    }
    const next = `/auth/recovery${location.search}${location.hash}`;
    navigate(next, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate, passwordRecoveryPending]);

  return null;
}
