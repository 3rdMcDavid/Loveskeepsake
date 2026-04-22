'use client'

import { useState, useTransition } from 'react'
import { updateWeddingDetails } from './actions'

interface Props {
  weddingId: string
  slug: string
  initial: {
    partner1_name: string | null
    partner2_name: string | null
    wedding_date: string | null
    venue_name: string | null
    venue_address: string | null
    dress_code: string | null
    notes: string | null
  }
}

const inputCls = "w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
const labelCls = "block text-xs tracking-widest uppercase text-stone-400 mb-2"

export function SettingsForm({ weddingId, slug, initial }: Props) {
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateWeddingDetails(weddingId, slug, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Names */}
      <div>
        <h2 className="text-xs tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
          Your Names
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Partner 1 name</label>
            <input
              name="partner1_name"
              defaultValue={initial.partner1_name ?? ''}
              placeholder="e.g. David"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Partner 2 name</label>
            <input
              name="partner2_name"
              defaultValue={initial.partner2_name ?? ''}
              placeholder="e.g. Ashley"
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-2">
          These appear throughout your planning dashboard and on your guest portal.
        </p>
      </div>

      {/* Event details */}
      <div>
        <h2 className="text-xs tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
          Event Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Wedding date</label>
            <input
              name="wedding_date"
              type="date"
              defaultValue={initial.wedding_date ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Venue name</label>
            <input
              name="venue_name"
              defaultValue={initial.venue_name ?? ''}
              placeholder="The Grand Ballroom"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Venue address</label>
            <input
              name="venue_address"
              defaultValue={initial.venue_address ?? ''}
              placeholder="123 Main St, City, State"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Dress code / Attire</label>
            <input
              name="dress_code"
              defaultValue={initial.dress_code ?? ''}
              placeholder="Black tie, Cocktail attire…"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xs tracking-widest uppercase text-stone-400 border-b border-stone-100 pb-2 mb-5">
          A Note to Guests
        </h2>
        <textarea
          name="notes"
          defaultValue={initial.notes ?? ''}
          rows={4}
          placeholder="A personal message that appears on your guest portal…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 text-sm tracking-widest uppercase text-white transition-colors disabled:opacity-50"
          style={{ background: isPending ? '#a8937f' : '#3d2e28' }}
        >
          {isPending ? 'Saving…' : 'Save Details'}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600">Saved!</span>
        )}
      </div>
    </form>
  )
}
