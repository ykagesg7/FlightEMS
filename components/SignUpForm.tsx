// components/SignUpForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; // Supabaseクライアントをインポート

export default function SignUpForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // パスワードの一致チェック
    if (password !== confirmPassword) {
      setError('Passwords don\'t match');
    } else {
      setError(null);
    }
  }, [password, confirmPassword]); // 依存配列を修正

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        setError(error.message);
      } else {
        setEmail('');
        setPassword('');
        setError('登録確認メールを送信しました。メールをご確認ください。');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };


  return (
    <div>
      <main className='container mx-auto px-4 py-8'>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md text-gray-700 !important"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md text-gray-700 !important"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
          新規登録
        </button>
      </form>
      </main>
    </div>
  );
}
