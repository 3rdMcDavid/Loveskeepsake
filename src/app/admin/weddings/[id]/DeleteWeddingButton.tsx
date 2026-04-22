'use client'

import { useState, useTransition } from 'react'
import { deleteWedding } from './actions'

export default function DeleteWeddingButton({ weddingId, weddingName }: { weddingId: string; weddingName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteWedding(weddingId)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-500">Remove <span className="font-medium text-stone-700">{weddingName}</span>?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-4 py-2 border border-red-200 text-sm text-red-500 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
    >
      Delete wedding
    </button>
  )
}
