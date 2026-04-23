'use client'

import { useRef, useState, useTransition } from 'react'
import { addGuest, updateGuest, deleteGuest } from './actions'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface Guest {
  id: string
  full_name: string
  mailing_address: string
  rsvp_confirmed: boolean
}

interface Props {
  weddingId: string
  slug: string
  initialGuests: Guest[]
}

export function GuestListEditor({ weddingId, slug, initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [, startTransition] = useTransition()
  const editTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp_confirmed).length

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    const tempId = crypto.randomUUID()
    const optimistic: Guest = {
      id: tempId,
      full_name: name,
      mailing_address: newAddress.trim(),
      rsvp_confirmed: false,
    }
    setGuests(prev => [...prev, optimistic])
    setNewName('')
    setNewAddress('')
    startTransition(async () => {
      const saved = await addGuest(weddingId, slug, name, newAddress.trim())
      if (saved) {
        setGuests(prev => prev.map(g => g.id === tempId ? { ...g, id: saved.id } : g))
      }
    })
  }

  function handleDelete(id: string) {
    setGuests(prev => prev.filter(g => g.id !== id))
    startTransition(() => deleteGuest(id, slug))
  }

  function handleRsvp(id: string, checked: boolean) {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp_confirmed: checked } : g))
    startTransition(() => updateGuest(id, slug, { rsvp_confirmed: checked }))
  }

  function handleEditName(id: string, val: string) {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, full_name: val } : g))
    const key = `name_${id}`
    if (editTimers.current[key]) clearTimeout(editTimers.current[key])
    editTimers.current[key] = setTimeout(() =>
      startTransition(() => updateGuest(id, slug, { full_name: val })), 800)
  }

  function handleEditAddress(id: string, val: string) {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, mailing_address: val } : g))
    const key = `addr_${id}`
    if (editTimers.current[key]) clearTimeout(editTimers.current[key])
    editTimers.current[key] = setTimeout(() =>
      startTransition(() => updateGuest(id, slug, { mailing_address: val })), 800)
  }

  const inputCls =
    'px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header + summary */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Guest List
          </h1>
          <p className="text-sm mt-1 italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Names, addresses, and RSVP status
          </p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <span
              className="px-3 py-1 rounded-full text-xs tracking-wide"
              style={{ background: '#f5f0eb', color: '#8a7568' }}
            >
              {total} guest{total !== 1 ? 's' : ''}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs tracking-wide"
              style={{ background: '#d4e6d5', color: '#4a7a50' }}
            >
              {confirmed} confirmed
            </span>
          </div>
        )}
      </div>

      {/* Add guest form */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Add guest</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className={`${inputCls} flex-shrink-0 sm:w-48`}
            placeholder="Full name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
          <input
            className={`${inputCls} flex-1`}
            placeholder="Mailing address (optional)"
            value={newAddress}
            onChange={e => setNewAddress(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-5 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-40 transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: '#c4956a' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Guest list */}
      {guests.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 px-6 py-12 text-center">
          <p className="text-stone-300 text-sm italic">No guests yet — add your first guest above</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-stone-100 bg-stone-50">
            <span className="text-xs tracking-widest uppercase text-stone-400 w-6 text-center">✓</span>
            <span className="text-xs tracking-widets uppercase text-stone-400">Name</span>
            <span className="text-xs tracking-widets uppercase text-stone-400 hidden sm:block">Address</span>
            <span className="w-8" />
          </div>

          {guests.map(guest => (
            <div
              key={guest.id}
              className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-3 items-center px-5 py-3 border-b border-stone-50 last:border-0"
            >
              {/* RSVP checkbox */}
              <button
                onClick={() => handleRsvp(guest.id, !guest.rsvp_confirmed)}
                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                  guest.rsvp_confirmed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-stone-300 hover:border-stone-500'
                }`}
              >
                {guest.rsvp_confirmed && (
                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                    <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Name */}
              <input
                className="text-sm text-stone-700 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-400 outline-none py-0.5 transition-colors w-full"
                value={guest.full_name}
                onChange={e => handleEditName(guest.id, e.target.value)}
                placeholder="Name"
              />

              {/* Address (hidden on mobile) */}
              <input
                className="text-sm text-stone-500 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-400 outline-none py-0.5 transition-colors w-full hidden sm:block"
                value={guest.mailing_address}
                onChange={e => handleEditAddress(guest.id, e.target.value)}
                placeholder="Mailing address"
              />

              {/* Delete */}
              <button
                onClick={() => handleDelete(guest.id)}
                className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
