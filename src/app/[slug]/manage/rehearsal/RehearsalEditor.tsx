'use client'

import { useRef, useState } from 'react'
import { saveRehearsalData } from './actions'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface RehearsalData {
  venueName: string
  date: string
  time: string
  foodMenu: string
  reservationTime: string
  transport: boolean
  transportNotes: string
}

const emptyData = (): RehearsalData => ({
  venueName: '', date: '', time: '', foodMenu: '',
  reservationTime: '', transport: false, transportNotes: '',
})

interface Props {
  weddingId: string
  slug: string
  initial: RehearsalData | null
}

export function RehearsalEditor({ weddingId, slug, initial }: Props) {
  const [data, setData] = useState<RehearsalData>(initial ?? emptyData())
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedule(next: RehearsalData) {
    setData(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await saveRehearsalData(weddingId, slug, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  function update<K extends keyof RehearsalData>(field: K, value: RehearsalData[K]) {
    schedule({ ...data, [field]: value })
  }

  const inputCls =
    'w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Rehearsal Dinner
          </h1>
          <p className="text-sm mt-1 italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Venue, menu, and logistics for your rehearsal evening
          </p>
        </div>
        {saved && <span className="text-xs text-emerald-600 tracking-wide">Saved ✓</span>}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
        {/* Venue name */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
            Venue name
          </label>
          <input
            className={inputCls}
            placeholder="Restaurant or venue name"
            value={data.venueName}
            onChange={e => update('venueName', e.target.value)}
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
              Date
            </label>
            <input
              type="date"
              className={inputCls}
              value={data.date}
              onChange={e => update('date', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
              Start time
            </label>
            <input
              type="time"
              className={inputCls}
              value={data.time}
              onChange={e => update('time', e.target.value)}
            />
          </div>
        </div>

        {/* Food / Menu */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
            Food & menu
          </label>
          <textarea
            className={`${inputCls} resize-none leading-relaxed`}
            rows={5}
            placeholder="Menu details, dietary notes, service style…"
            value={data.foodMenu}
            onChange={e => update('foodMenu', e.target.value)}
          />
        </div>

        {/* Reservation time */}
        <div>
          <label className="text-xs tracking-widest uppercase text-stone-400 block mb-1.5">
            Reservation time
          </label>
          <input
            type="time"
            className={`${inputCls} w-40`}
            value={data.reservationTime}
            onChange={e => update('reservationTime', e.target.value)}
          />
        </div>

        {/* Transportation toggle */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              role="switch"
              aria-checked={data.transport}
              onClick={() => update('transport', !data.transport)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                data.transport ? 'bg-stone-800' : 'bg-stone-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  data.transport ? 'left-6' : 'left-1'
                }`}
              />
            </button>
            <label className="text-sm text-stone-700 cursor-pointer" onClick={() => update('transport', !data.transport)}>
              Arranging transport for the wedding party
            </label>
          </div>

          {data.transport && (
            <textarea
              className={`${inputCls} resize-none leading-relaxed mt-2`}
              rows={3}
              placeholder="Pickup locations, times, driver details…"
              value={data.transportNotes}
              onChange={e => update('transportNotes', e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
