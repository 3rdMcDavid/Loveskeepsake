'use client'

import { useState, useTransition } from 'react'
import { resendInvite } from './actions'

export default function ResendInviteButton({
  weddingId,
  coupleEmail,
  slug,
}: {
  weddingId: string
  coupleEmail: string
  slug: string
}) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function handleClick() {
    startTransition(async () => {
      await resendInvite(weddingId, coupleEmail, slug)
      setSent(true)
    })
  }

  if (sent) {
    return <span className="text-sm text-emerald-600">Invite sent!</span>
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 border border-stone-200 text-sm text-stone-600 rounded-lg hover:border-stone-300 hover:text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Sending…' : 'Resend invite'}
    </button>
  )
}
