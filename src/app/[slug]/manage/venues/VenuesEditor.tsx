'use client'

import { useRef, useState } from 'react'
import { saveVenueData } from './actions'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface VenueSlot {
  name: string
  location: string
  capacity: string
  priceRange: string
  pros: string
  cons: string
  notes: string
}

interface DecisionData {
  chosenIndex: number | null
  bookedDate: string
  decisionNotes: string
}

interface VenueData {
  slots: [VenueSlot, VenueSlot, VenueSlot]
  decision: DecisionData
}

const emptySlot = (): VenueSlot => ({
  name: '', location: '', capacity: '', priceRange: '', pros: '', cons: '', notes: '',
})

const emptyData = (): VenueData => ({
  slots: [emptySlot(), emptySlot(), emptySlot()],
  decision: { chosenIndex: null, bookedDate: '', decisionNotes: '' },
})

interface Props {
  weddingId: string
  slug: string
  initial: VenueData | null
}

export function VenuesEditor({ weddingId, slug, initial }: Props) {
  const [data, setData] = useState<VenueData>(initial ?? emptyData())
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedule(next: VenueData) {
    setData(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await saveVenueData(weddingId, slug, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  function updateSlot(i: number, field: keyof VenueSlot, value: string) {
    const slots = [...data.slots] as VenueData['slots']
    slots[i] = { ...slots[i], [field]: value }
    schedule({ ...data, slots })
  }

  function updateDecision(field: keyof DecisionData, value: string | number | null) {
    schedule({ ...data, decision: { ...data.decision, [field]: value } })
  }

  const inputCls = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Venue Comparison
          </h1>
          <p className="text-sm mt-1 italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Compare up to three venues side by side
          </p>
        </div>
        {saved && <span className="text-xs text-emerald-600 tracking-wide">Saved ✓</span>}
      </div>

      {/* Three venue cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.slots.map((slot, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
            {/* Card header */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                style={{ background: '#b8a99a' }}
              >
                {i + 1}
              </span>
              <input
                className="flex-1 text-base font-light bg-transparent border-b border-stone-100 focus:border-stone-400 outline-none pb-0.5 text-stone-800 placeholder-stone-300 transition-colors"
                style={{ fontFamily: CF }}
                placeholder={`Venue ${i + 1} name`}
                value={slot.name}
                onChange={e => updateSlot(i, 'name', e.target.value)}
              />
            </div>

            {/* Location */}
            <input
              className={inputCls}
              placeholder="Location / address"
              value={slot.location}
              onChange={e => updateSlot(i, 'location', e.target.value)}
            />

            {/* Capacity + Price */}
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputCls}
                placeholder="Capacity"
                value={slot.capacity}
                onChange={e => updateSlot(i, 'capacity', e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Price range"
                value={slot.priceRange}
                onChange={e => updateSlot(i, 'priceRange', e.target.value)}
              />
            </div>

            {/* Pros */}
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
                Pros
              </label>
              <textarea
                className={textareaCls}
                rows={3}
                placeholder="What's great about it…"
                value={slot.pros}
                onChange={e => updateSlot(i, 'pros', e.target.value)}
                style={{ background: 'rgba(220,252,231,0.3)' }}
              />
            </div>

            {/* Cons */}
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
                Cons
              </label>
              <textarea
                className={textareaCls}
                rows={3}
                placeholder="What gives you pause…"
                value={slot.cons}
                onChange={e => updateSlot(i, 'cons', e.target.value)}
                style={{ background: 'rgba(254,226,226,0.3)' }}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
                Notes
              </label>
              <textarea
                className={textareaCls}
                rows={2}
                placeholder="Anything else…"
                value={slot.notes}
                onChange={e => updateSlot(i, 'notes', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Final decision */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <h2 className="text-lg font-light text-stone-800 mb-1" style={{ fontFamily: CF }}>
          Final Decision
        </h2>

        {/* Venue choice */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-2">
            Chosen venue
          </label>
          <div className="flex flex-wrap gap-2">
            {data.slots.map((slot, i) => (
              <button
                key={i}
                onClick={() =>
                  updateDecision('chosenIndex', data.decision.chosenIndex === i ? null : i)
                }
                className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                  data.decision.chosenIndex === i
                    ? 'border-stone-800 bg-stone-800 text-white'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                }`}
              >
                {slot.name || `Venue ${i + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Booked date */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
            Booked date
          </label>
          <input
            type="date"
            className={`${inputCls} w-48`}
            value={data.decision.bookedDate}
            onChange={e => updateDecision('bookedDate', e.target.value)}
          />
        </div>

        {/* Decision notes */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
            Notes
          </label>
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="Deposit paid, contract signed…"
            value={data.decision.decisionNotes}
            onChange={e => updateDecision('decisionNotes', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
