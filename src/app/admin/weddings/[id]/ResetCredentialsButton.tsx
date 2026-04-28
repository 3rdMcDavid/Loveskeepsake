'use client'

import { useState, useTransition } from 'react'
import { resetCredentials, sendCredentials } from './actions'

export default function ResetCredentialsButton({
  weddingId,
  coupleUserId,
  coupleEmail,
  slug,
}: {
  weddingId: string
  coupleUserId: string
  coupleEmail: string
  slug: string
}) {
  const [resetting, startReset] = useTransition()
  const [sending, startSend] = useTransition()
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function handleReset() {
    startReset(async () => {
      const result = await resetCredentials(weddingId, coupleUserId)
      if (result.status === 'error') {
        setError(result.message)
      } else {
        setNewPassword(result.password)
        setEmailSent(false)
        setError(null)
      }
    })
  }

  function copyCredentials() {
    if (!newPassword) return
    navigator.clipboard.writeText(`Email: ${coupleEmail}\nPassword: ${newPassword}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSendEmail() {
    if (!newPassword) return
    startSend(async () => {
      try {
        await sendCredentials(coupleEmail, slug, newPassword)
        setEmailSent(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send email')
      }
    })
  }

  if (newPassword) {
    return (
      <div className="space-y-2 text-right min-w-[200px]">
        <p className="text-xs text-stone-400">New password</p>
        <p className="font-mono text-sm text-stone-800 bg-stone-50 px-3 py-1.5 rounded border border-stone-200 tracking-widest">
          {newPassword}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={copyCredentials}
            className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending || emailSent}
            className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Sending…' : emailSent ? 'Sent!' : 'Send to couple'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="text-right">
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <button
        onClick={handleReset}
        disabled={resetting}
        className="px-4 py-2 border border-stone-200 text-sm text-stone-600 rounded-lg hover:border-stone-300 hover:text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {resetting ? 'Resetting…' : 'Reset password'}
      </button>
    </div>
  )
}
