'use client'

import { useRef, useState, useTransition } from 'react'
import {
  saveBudgetCeiling,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
} from './actions'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface Item {
  id: string
  description: string
  amount: number
}

interface Props {
  weddingId: string
  slug: string
  initialItems: Item[]
  initialCeiling: number | null
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export function ExpensesEditor({ weddingId, slug, initialItems, initialCeiling }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [ceiling, setCeiling] = useState<string>(
    initialCeiling != null ? String(initialCeiling) : '',
  )
  const [newDesc, setNewDesc] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [, startTransition] = useTransition()

  const ceilTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const total = items.reduce((s, i) => s + i.amount, 0)
  const ceilingNum = parseFloat(ceiling) || 0
  const pct = ceilingNum > 0 ? Math.min(100, Math.round((total / ceilingNum) * 100)) : 0
  const over = ceilingNum > 0 && total > ceilingNum

  function handleCeilingChange(val: string) {
    setCeiling(val)
    if (ceilTimer.current) clearTimeout(ceilTimer.current)
    ceilTimer.current = setTimeout(() => {
      const n = parseFloat(val)
      startTransition(() => saveBudgetCeiling(weddingId, slug, isNaN(n) ? null : n))
    }, 800)
  }

  function handleAddItem() {
    const desc = newDesc.trim()
    const amt = parseFloat(newAmt)
    if (!desc || isNaN(amt) || amt < 0) return
    const tempId = crypto.randomUUID()
    const optimistic: Item = { id: tempId, description: desc, amount: amt }
    setItems(prev => [...prev, optimistic])
    setNewDesc('')
    setNewAmt('')
    startTransition(async () => {
      const saved = await addExpenseItem(weddingId, slug, desc, amt)
      if (saved) {
        setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: saved.id } : i))
      }
    })
  }

  function handleDeleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    startTransition(() => deleteExpenseItem(id, slug))
  }

  function handleEditDesc(id: string, val: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, description: val } : i))
    if (editTimers.current[id]) clearTimeout(editTimers.current[id])
    editTimers.current[id] = setTimeout(() =>
      startTransition(() => updateExpenseItem(id, slug, { description: val })), 800)
  }

  function handleEditAmt(id: string, val: string) {
    const n = parseFloat(val)
    if (isNaN(n)) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, amount: n } : i))
    if (editTimers.current[`amt_${id}`]) clearTimeout(editTimers.current[`amt_${id}`])
    editTimers.current[`amt_${id}`] = setTimeout(() =>
      startTransition(() => updateExpenseItem(id, slug, { amount: n })), 800)
  }

  const inputCls = 'px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
          Expenses
        </h1>
        <p className="text-sm mt-1 italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
          Track line items against your budget ceiling
        </p>
      </div>

      {/* Budget ceiling */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <label className="text-xs tracking-widest uppercase text-stone-400 block mb-3">
          Budget ceiling
        </label>
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-sm">$</span>
          <input
            type="number"
            className={`${inputCls} w-40`}
            placeholder="25,000"
            value={ceiling}
            onChange={e => handleCeilingChange(e.target.value)}
            min={0}
            step={100}
          />
        </div>

        {/* Progress bar */}
        {ceilingNum > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-400 mb-1.5">
              <span>{fmt(total)} spent</span>
              <span className={over ? 'text-red-500 font-medium' : ''}>
                {over ? `${fmt(total - ceilingNum)} over` : `${fmt(ceilingNum - total)} remaining`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-stone-100">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: over ? '#ef4444' : pct > 80 ? '#f59e0b' : '#c4956a',
                }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1 text-right">{pct}% of budget</p>
          </div>
        )}
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-3 border-b border-stone-100 bg-stone-50">
          <span className="text-xs tracking-widets uppercase text-stone-400">Description</span>
          <span className="text-xs tracking-widets uppercase text-stone-400 w-28">Amount</span>
          <span className="w-8" />
        </div>

        {items.length === 0 && (
          <p className="text-sm text-stone-300 italic text-center py-8">
            No line items yet — add your first expense below
          </p>
        )}

        {items.map(item => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3 border-b border-stone-50 last:border-0"
          >
            <input
              className="text-sm text-stone-700 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-400 outline-none py-0.5 transition-colors w-full"
              value={item.description}
              onChange={e => handleEditDesc(item.id, e.target.value)}
              placeholder="Description"
            />
            <div className="flex items-center gap-1 w-28">
              <span className="text-stone-400 text-sm flex-shrink-0">$</span>
              <input
                type="number"
                className="text-sm text-stone-700 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-400 outline-none py-0.5 transition-colors w-full"
                value={item.amount}
                onChange={e => handleEditAmt(item.id, e.target.value)}
                min={0}
                step={10}
              />
            </div>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add row */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-4 bg-stone-50 border-t border-stone-100">
          <input
            className={`${inputCls} w-full`}
            placeholder="New line item…"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddItem() }}
          />
          <div className="flex items-center gap-1 w-28">
            <span className="text-stone-400 text-sm flex-shrink-0">$</span>
            <input
              type="number"
              className={`${inputCls} w-full`}
              placeholder="0"
              value={newAmt}
              onChange={e => setNewAmt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddItem() }}
              min={0}
              step={10}
            />
          </div>
          <button
            onClick={handleAddItem}
            disabled={!newDesc.trim() || !newAmt}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-sm font-medium disabled:opacity-30 transition-opacity flex-shrink-0"
            style={{ background: '#c4956a' }}
            title="Add item"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-baseline justify-between px-5 py-4 bg-white rounded-xl border border-stone-200">
        <span
          className="text-lg font-light text-stone-600"
          style={{ fontFamily: CF }}
        >
          Total
        </span>
        <span
          className="text-2xl font-light"
          style={{ fontFamily: CF, color: over ? '#ef4444' : '#3d2e28' }}
        >
          {fmt(total)}
        </span>
      </div>
    </div>
  )
}
