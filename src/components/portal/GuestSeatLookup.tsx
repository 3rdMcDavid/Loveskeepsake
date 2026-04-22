'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Guest } from '@/types'

export default function GuestSeatLookup({ weddingId }: { weddingId: string }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<Guest | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(undefined)

    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .ilike('full_name', `%${query.trim()}%`)
      .limit(1)
      .single()

    setResult(data ?? null)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter your name…"
          className="flex-1 px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '…' : 'Look up'}
        </button>
      </form>

      {result === null && (
        <p className="mt-4 text-sm text-stone-500">
          No guest found matching &ldquo;{query}&rdquo;. Please try your full name.
        </p>
      )}

      {result && (
        <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-100">
          <p className="font-medium text-stone-800">{result.full_name}</p>
          <div className="flex gap-6 mt-2">
            {result.table_number != null && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Table</p>
                <p className="text-2xl font-serif text-rose-600">{result.table_number}</p>
              </div>
            )}
            {result.seat_number != null && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Seat</p>
                <p className="text-2xl font-serif text-rose-600">{result.seat_number}</p>
              </div>
            )}
          </div>
          {result.meal_choice && (
            <p className="text-sm text-stone-500 mt-2">
              <span className="font-medium">Meal:</span> {result.meal_choice}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
