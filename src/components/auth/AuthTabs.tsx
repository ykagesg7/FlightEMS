import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { theme } = useTheme();
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 text-center font-medium rounded-t-lg transition-colors ${
            activeTab === 'login'
              ? theme === 'dark'
                ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
                : 'bg-white text-gray-800 border-b-2 border-indigo-500'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:text-white'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
        >
          ログイン
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 text-center font-medium rounded-t-lg transition-colors ${
            activeTab === 'register'
              ? theme === 'dark'
                ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
                : 'bg-white text-gray-800 border-b-2 border-indigo-500'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:text-white'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
        >
          新規登録
        </button>
      </div>
      
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthTabs; 