'use client'

import { useState, useTransition } from 'react'
import { SECTIONS } from '../checklist/checklistData'
import { savePlanConfig } from '../planActions'
import type { PlanConfig } from '../checklist/checklistData'

interface Props {
  weddingId: string
  slug: string
  initial: PlanConfig
}

const toggleable = SECTIONS
  .map((sec, i) => ({ sec, i }))
  .filter(({ sec }) => !sec.hidden)

export function PlanEditor({ weddingId, slug, initial }: Props) {
  const [mode, setMode]       = useState<'preset' | 'scratch'>(initial.mode ?? 'preset')
  const [hidden, setHidden]   = useState<Set<number>>(new Set(initial.hiddenSections ?? []))
  const [saved, setSaved]     = useState(false)
  const [isPending, start]    = useTransition()

  function toggleSection(i: number) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function handleSave() {
    start(async () => {
      await savePlanConfig(weddingId, slug, {
        mode,
        hiddenSections: Array.from(hidden),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const inputCls = "w-full border border-stone-200 px-3.5 py-2.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
  const labelCls = "block text-xs tracking-widest uppercase text-stone-400 mb-2"

  return (
    <div className="space-y-8">

      {/* Checklist style */}
      <div>
        <h2 className={labelCls.replace('mb-2', 'border-b border-stone-100 pb-2 mb-5')}>
          Checklist Style
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              mode === 'preset'
                ? 'border-stone-800 bg-stone-50'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <p className="text-sm font-medium text-stone-800 mb-1">Use presets</p>
            <p className="text-xs text-stone-400 leading-snug">
              Checklists come pre-filled with wedding planning milestones.
            </p>
            {mode === 'preset' && <p className="text-xs font-medium text-stone-700 mt-2">Active ✓</p>}
          </button>
          <button
            type="button"
            onClick={() => setMode('scratch')}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              mode === 'scratch'
                ? 'border-stone-800 bg-stone-50'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <p className="text-sm font-medium text-stone-800 mb-1">From scratch</p>
            <p className="text-xs text-stone-400 leading-snug">
              Blank checklists — add only tasks that matter to you.
            </p>
            {mode === 'scratch' && <p className="text-xs font-medium text-stone-700 mt-2">Active ✓</p>}
          </button>
        </div>
        <p className="text-xs text-stone-400">
          Switching to presets will show the suggested tasks. Switching to scratch hides them — your custom items and check states are always kept.
        </p>
      </div>

      {/* Visible tabs */}
      <div>
        <h2 className={labelCls.replace('mb-2', 'border-b border-stone-100 pb-2 mb-3')}>
          Visible Tabs
        </h2>
        <p className="text-xs text-stone-400 mb-4">
          Hide tabs you won't use. They can be re-enabled here any time.
        </p>
        <div className="space-y-0.5">
          {toggleable.map(({ sec, i }) => {
            const isVisible = !hidden.has(i)
            return (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-stone-50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base w-6 text-center">{sec.icon}</span>
                  <span className={`text-sm ${isVisible ? 'text-stone-700' : 'text-stone-400'}`}>
                    {sec.tabLabel}
                  </span>
                  {!isVisible && (
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      hidden
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => toggleSection(i)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                    isVisible ? 'bg-stone-800' : 'bg-stone-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      isVisible ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 text-sm tracking-widest uppercase text-white transition-colors disabled:opacity-50"
          style={{ background: isPending ? '#a8937f' : '#3d2e28' }}
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved!</span>}
      </div>
    </div>
  )
}
