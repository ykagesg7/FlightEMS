// app/reset-password/page.tsx
'use client'
import { useState } from 'react'
import { createClientComponentClient } from '../../../node_modules/@supabase/auth-helpers-nextjs'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。')
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`エラー: ${error.message}`)
      }
    }
  }

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">パスワードをリセット</button>
      {message && <p>{message}</p>}
    </form>
  )
}