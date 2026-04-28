'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createWedding, sendCredentials } from './actions'
import type { CreateWeddingResult } from './actions'

export default function NewWeddingPage() {
  const [state, action, pending] = useActionState<CreateWeddingResult | null, FormData>(createWedding, null)
  const [copied, setCopied] = useState(false)
  const [emailSending, startEmailTransition] = useTransition()
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const router = useRouter()

  function copyCredentials(email: string, password: string) {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSendEmail(email: string, slug: string, password: string) {
    startEmailTransition(async () => {
      try {
        await sendCredentials(email, slug, password)
        setEmailSent(true)
        setEmailError(null)
      } catch (e) {
        setEmailError(e instanceof Error ? e.message : 'Failed to send email')
      }
    })
  }

  if (state?.status === 'success') {
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/${state.slug}/sign-in`

    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-serif text-stone-800 mb-2">Wedding Created</h1>
        <p className="text-sm text-stone-400 mb-8">
          Share these login credentials with the couple.
        </p>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 mb-6">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide">Login Credentials</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-400 mb-1">Login URL</p>
              <p className="font-mono text-sm text-stone-700 bg-stone-50 px-3 py-2 rounded-lg">
                {loginUrl}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Email</p>
              <p className="font-mono text-sm text-stone-700 bg-stone-50 px-3 py-2 rounded-lg">
                {state.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Password</p>
              <p className="font-mono text-sm text-stone-700 bg-stone-50 px-3 py-2 rounded-lg tracking-widest">
                {state.password}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => copyCredentials(state.email, state.password)}
              className="flex-1 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy credentials'}
            </button>
            <button
              onClick={() => handleSendEmail(state.email, state.slug, state.password)}
              disabled={emailSending || emailSent}
              className="flex-1 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 hover:border-stone-300 hover:text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {emailSending ? 'Sending…' : emailSent ? 'Email sent!' : 'Send to couple'}
            </button>
          </div>

          {emailError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {emailError}
            </p>
          )}
        </div>

        <button
          onClick={() => router.push(`/admin/weddings/${state.weddingId}`)}
          className="px-5 py-2.5 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Go to wedding →
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-serif text-stone-800 mb-2">New Wedding</h1>
      <p className="text-sm text-stone-400 mb-8">
        An account will be created for the couple. You&apos;ll receive login credentials to share with them.
      </p>

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Couple name <span className="text-rose-500">*</span>
            <span className="ml-1.5 text-stone-400 font-normal">e.g. The McCarters</span>
          </label>
          <input
            name="couple_name"
            required
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="The McCarters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Couple email <span className="text-rose-500">*</span>
          </label>
          <input
            name="couple_email"
            type="email"
            required
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="couple@example.com"
          />
        </div>

        {state?.status === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {state.message}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Creating…' : 'Create Wedding'}
          </button>
          <a
            href="/admin"
            className="px-5 py-2.5 text-stone-500 text-sm hover:text-stone-700 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
