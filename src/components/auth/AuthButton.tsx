import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../utils/supabase';

interface AuthButtonProps {
  iconOnly?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ iconOnly }) => {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    if (session) {
      // ユーザーがログインしている場合、ログアウト処理
      await signOut();
    } else {
      // ユーザーがログインしていない場合、ログインページへ遷移
      navigate('/auth');
    }
  };

  return (
    <button
      onClick={handleAuthClick}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
    >
      {iconOnly ? (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ) : (
        session ? 'ログアウト' : 'ログイン'
      )}
    </button>
  );
};
