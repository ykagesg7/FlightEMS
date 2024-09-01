// app/login/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient';
import Header from '../../components/layout/header2';
import Footer from '../../components/layout/footer';
import Layout from '../../components/layout/layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error
      }
      
      if (data) {
        router.push('/lms')
      }
      
    } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    return (
      <div>
        <Header/>
        <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              ログイン
            </h3>
            <form onSubmit={handleLogin}>
              <div className="text-gray-800 mb-4">
                <div>
                  <label className="block" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
      
                <div className="mt-4">
                  <label className="block" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
      
                <div className="flex items-baseline justify-between">
                  <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900" type="submit">
                    Login
                  </button>

                  <Link href="/" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <div className="text-center">
                  <p className="mt-4 text-sm">
                    アカウントをお持ちでない方は、
                  </p>
                  <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                    新規登録
                  </Link>
                </div>
              </div>
            </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
        </Layout>
        <Footer/>
      </div>
    );
  }

// forgot password?部分をupdatepass.tsxとresetpass.tsxで実装する。