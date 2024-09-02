// app/update-password/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '../../../node_modules/@supabase/auth-helpers-nextjs'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router, supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setMessage('パスワードが正常に更新されました。')
      setTimeout(() => router.push('/'), 2000) // 2秒後にホームページにリダイレクト
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`エラー: ${error.message}`)
      }
    }
  }

  return (
    <form onSubmit={handleUpdatePassword}>
      <input
        type="password"
        placeholder="新しいパスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">パスワードを更新</button>
      {message && <p>{message}</p>}
    </form>
  )
}