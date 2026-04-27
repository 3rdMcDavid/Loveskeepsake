'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CF = "var(--font-cormorant), 'Georgia', serif"

export default function CoupleSignIn({ slug, hint }: { slug: string; hint?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(hint === 'new-link')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }
    router.push(`/${slug}/manage`)
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/${slug}/welcome?mode=reset`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setResetSent(true)
    setLoading(false)
  }

  if (resetSent) {
    return (
      <div className="bg-white p-8 shadow-sm text-center">
        <p className="text-stone-700 font-medium mb-2">Check your inbox</p>
        <p className="text-sm text-stone-400 leading-relaxed">
          We sent a password reset link to{' '}
          <span className="text-stone-600">{email}</span>.
          <br />Click it to set a new password.
        </p>
        <button
          onClick={() => { setForgotMode(false); setResetSent(false) }}
          className="mt-6 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-700 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  if (forgotMode) {
    return (
      <form onSubmit={handleForgotPassword} className="bg-white p-8 shadow-sm space-y-5">
        {hint === 'new-link' && (
          <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 text-center">
            Your invite link has already been used. Enter your email below to get a new one.
          </div>
        )}
        <div className="text-center mb-2">
          <p className="text-sm text-stone-500">
            Enter your email and we&apos;ll send a link to {hint === 'new-link' ? 'set up your account' : 'reset your password'}.
          </p>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm tracking-widest uppercase text-white transition-colors disabled:opacity-50"
          style={{ background: loading ? '#a8937f' : '#3d2e28' }}
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
        <button
          type="button"
          onClick={() => { setForgotMode(false); setError('') }}
          className="w-full text-xs tracking-widest uppercase text-stone-400 hover:text-stone-700 transition-colors pt-1"
        >
          Back to sign in
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSignIn} className="bg-white p-8 shadow-sm space-y-5">
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="Your password"
          className="w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm tracking-widest uppercase text-white transition-colors disabled:opacity-50"
        style={{ background: loading ? '#a8937f' : '#3d2e28' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => { setForgotMode(true); setError('') }}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
        >
          Forgot your password?
        </button>
      </div>
    </form>
  )
}
