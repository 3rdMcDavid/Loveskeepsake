'use client'

import { useState, useTransition } from 'react'
import { updateWedding } from './actions'
import type { Wedding } from '@/types'

export default function EditWeddingForm({ wedding }: { wedding: Wedding }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateWedding(wedding.id, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border border-stone-200 text-sm text-stone-600 rounded-lg hover:border-stone-300 hover:text-stone-800 transition-colors"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <h2 className="font-serif text-lg text-stone-800">Edit Wedding</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Partner 1</label>
                  <input
                    name="partner1_name"
                    defaultValue={wedding.partner1_name ?? ''}
                    required
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Partner 2</label>
                  <input
                    name="partner2_name"
                    defaultValue={wedding.partner2_name ?? ''}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Wedding date</label>
                <input
                  name="wedding_date"
                  type="date"
                  defaultValue={wedding.wedding_date ?? ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Venue name</label>
                <input
                  name="venue_name"
                  defaultValue={wedding.venue_name ?? ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Venue address</label>
                <input
                  name="venue_address"
                  defaultValue={wedding.venue_address ?? ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Dress code</label>
                <input
                  name="dress_code"
                  defaultValue={wedding.dress_code ?? ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Couple email
                  <span className="ml-1 text-stone-400 font-normal">(used for magic-link invite)</span>
                </label>
                <input
                  name="couple_email"
                  type="email"
                  defaultValue={wedding.couple_email ?? ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 text-stone-500 text-sm hover:text-stone-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saved && (
        <span className="text-sm text-emerald-600 ml-2">Saved!</span>
      )}
    </>
  )
}
