'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CF = "var(--font-cormorant), 'Georgia', serif"

export function SetPasswordForm({ slug, mode }: { slug: string; mode: 'welcome' | 'reset' }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(`/${slug}/manage`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f0eb' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">LoveKeepsake</p>
          <h1 className="text-3xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            {mode === 'welcome' ? 'Welcome' : 'Reset Password'}
          </h1>
          <p className="text-sm italic mt-2" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            {mode === 'welcome'
              ? 'Set a password to access your dashboard anytime'
              : 'Choose a new password for your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Re-enter your password"
              className="w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm tracking-widest uppercase text-white transition-colors disabled:opacity-50"
            style={{ background: loading ? '#a8937f' : '#3d2e28' }}
          >
            {loading ? 'Saving…' : mode === 'welcome' ? 'Set Password & Continue' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
