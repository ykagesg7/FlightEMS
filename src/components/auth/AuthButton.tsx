import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';

interface AuthButtonProps {
  iconOnly?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ iconOnly }) => {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const { effectiveTheme } = useTheme();
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

  const getButtonStyle = () => {
    const baseStyle = "px-4 py-2 rounded-lg transition-colors duration-200";

    if (effectiveTheme === 'day') {
      return `${baseStyle} bg-[#14213d] text-[#39FF14] hover:bg-[#1a2a4a] border border-[#39FF14]`;
    } else if (effectiveTheme === 'dark') {
      return `${baseStyle} bg-black text-[#FF3B3B] hover:bg-gray-900 border border-[#FF3B3B]`;
    } else {
      return `${baseStyle} bg-[#14213d] text-[#39FF14] hover:bg-[#1a2a4a] border border-[#39FF14]`;
    }
  };

  return (
    <button
      onClick={handleAuthClick}
      className={getButtonStyle()}
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
