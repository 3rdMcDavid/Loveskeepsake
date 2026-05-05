'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshButton() {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 700)
  }

  return (
    <button
      onClick={handleRefresh}
      title="Refresh progress"
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors"
    >
      <span
        style={{
          display: 'inline-block',
          transition: 'transform 0.7s ease',
          transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
        }}
      >
        ↻
      </span>
      Refresh
    </button>
  )
}
