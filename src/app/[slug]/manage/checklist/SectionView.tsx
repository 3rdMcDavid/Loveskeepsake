'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  SECTIONS,
  getEffectiveGroups,
  sectionProgress,
  type SectionConfig,
  type CustomConfig,
} from './checklistData'
import { toggleChecklistItem } from './actions'
import {
  removeDefaultItem,
  addCustomItem,
  removeCustomItem,
  clearSectionDefaults,
  resetSection,
} from './customActions'

interface Props {
  weddingId: string
  slug: string
  si: number
  initialChecked: Record<string, boolean>
  initialConfig: SectionConfig
  initialMode?: 'preset' | 'scratch'
}

const CF = "var(--font-cormorant), 'Georgia', serif"

export function SectionView({ weddingId, slug, si, initialChecked, initialConfig, initialMode = 'preset' }: Props) {
  const sec = SECTIONS[si]

  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked)
  const [localConfig, setLocalConfig] = useState<SectionConfig>(initialConfig)
  const [editMode, setEditMode] = useState(false)
  const [newLabels, setNewLabels] = useState<Record<number, string>>({})
  const [, startTransition] = useTransition()

  const customConfigForSection: CustomConfig = useMemo(
    () => ({ [`s${si}`]: localConfig }),
    [si, localConfig],
  )

  const effectiveGroups = useMemo(
    () => getEffectiveGroups(sec, si, customConfigForSection, initialMode),
    [sec, si, customConfigForSection, initialMode],
  )

  const sp = useMemo(
    () => sectionProgress(si, { [`s${si}`]: checked }, customConfigForSection, [], initialMode),
    [si, checked, customConfigForSection, initialMode],
  )

  function toggleItem(key: string) {
    const newVal = !checked[key]
    setChecked(prev => ({ ...prev, [key]: newVal }))
    startTransition(() => {
      toggleChecklistItem(weddingId, slug, `s${si}`, key, newVal)
    })
  }

  function handleRemoveDefault(itemKey: string) {
    setLocalConfig(prev => ({
      ...prev,
      removed: prev.removed.includes(itemKey) ? prev.removed : [...prev.removed, itemKey],
    }))
    setChecked(prev => { const n = { ...prev }; delete n[itemKey]; return n })
    startTransition(() => removeDefaultItem(weddingId, slug, si, itemKey))
  }

  function handleAddItem(gi: number) {
    const label = (newLabels[gi] ?? '').trim()
    if (!label) return
    const id = crypto.randomUUID()
    setLocalConfig(prev => ({
      ...prev,
      added: [...(prev.added ?? []), { id, gi, label }],
    }))
    setNewLabels(prev => ({ ...prev, [gi]: '' }))
    startTransition(() => addCustomItem(weddingId, slug, si, gi, label, id))
  }

  function handleRemoveCustom(itemId: string) {
    setLocalConfig(prev => ({
      ...prev,
      added: (prev.added ?? []).filter(a => a.id !== itemId),
    }))
    setChecked(prev => { const n = { ...prev }; delete n[itemId]; return n })
    startTransition(() => removeCustomItem(weddingId, slug, si, itemId))
  }

  function handleClearPresets() {
    if (!confirm(`Remove all ${sec.title} preset items? Your custom items will stay. You can reset to defaults anytime.`)) return
    const allDefaultKeys = sec.groups.flatMap((g, gi) =>
      g.items.map((_, ii) => `g${gi}_i${ii}`),
    )
    setLocalConfig(prev => ({ ...prev, removed: allDefaultKeys }))
    setChecked(prev => {
      const n = { ...prev }
      allDefaultKeys.forEach(k => delete n[k])
      return n
    })
    startTransition(() => clearSectionDefaults(weddingId, slug, si))
  }

  function handleResetDefaults() {
    if (!confirm('Reset to default items? This will clear all custom items and check states for this section.')) return
    setLocalConfig({ removed: [], added: [] })
    setChecked({})
    startTransition(() => resetSection(weddingId, slug, si))
  }

  const barColor =
    sp.pct === 0 ? 'bg-stone-300' : sp.pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
  const statusBg =
    sp.pct === 0
      ? 'bg-stone-100 text-stone-400'
      : sp.pct === 100
      ? 'bg-emerald-50 text-emerald-600'
      : 'bg-amber-50 text-amber-700'

  const hasDefaultsLeft = initialMode !== 'scratch' &&
    localConfig.removed.length < sec.groups.reduce((a, g) => a + g.items.length, 0)

  return (
    <div>
      {/* ── Section header ── */}
      <div className="bg-white shadow-sm mb-0.5">
        <div className="flex items-center gap-4 px-6 py-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
              sp.pct === 0 ? 'bg-stone-100' : sp.pct === 100 ? 'bg-emerald-50' : 'bg-amber-50'
            }`}
          >
            {sec.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
              {sec.title}
            </div>
            <div className="text-xs italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
              {sec.script}
            </div>
            <div className="text-xs text-stone-400 mt-0.5 tracking-wide">
              {sp.done} of {sp.total} complete
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 w-36 flex-shrink-0">
            <div className="flex-1 h-0.5 bg-stone-100 rounded-full">
              <div
                className={`h-0.5 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${sp.pct}%` }}
              />
            </div>
            <span className="text-xs text-stone-400 w-8 text-right">{sp.pct}%</span>
          </div>
          <span className={`hidden sm:block text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${statusBg}`}>
            {sp.pct === 0 ? 'Not started' : sp.pct === 100 ? 'Complete ✓' : 'In progress'}
          </span>
          <button
            onClick={() => setEditMode(e => !e)}
            className={`text-xs px-3 py-1.5 border transition-all tracking-wide flex-shrink-0 ${
              editMode
                ? 'border-stone-800 text-stone-800 bg-stone-50'
                : 'border-stone-200 text-stone-400 hover:border-stone-500 hover:text-stone-600'
            }`}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Edit mode toolbar */}
        {editMode && (
          <div className="px-6 pb-4 flex flex-wrap gap-2 border-t border-stone-50 pt-3">
            <p className="text-xs text-stone-400 w-full mb-1">
              Remove or add items · changes save automatically
            </p>
            {hasDefaultsLeft && (
              <button
                onClick={handleClearPresets}
                className="text-xs px-3 py-1.5 border border-red-200 text-red-400 hover:border-red-400 hover:text-red-600 transition-all tracking-wide"
              >
                Clear all presets
              </button>
            )}
            <button
              onClick={handleResetDefaults}
              className="text-xs px-3 py-1.5 border border-stone-200 text-stone-400 hover:border-stone-500 hover:text-stone-600 transition-all tracking-wide"
            >
              Reset to defaults
            </button>
          </div>
        )}
      </div>

      {/* ── Items ── */}
      <div className="bg-white shadow-sm px-6 pb-6">
        {effectiveGroups.map((group, gi) => (
          <div key={gi} className="mt-6">
            <p className="text-xs tracking-widest uppercase text-stone-400 pb-2 border-b border-stone-100 mb-2">
              {group.label}
            </p>

            {group.items.length === 0 && !editMode && (
              <p className="text-xs text-stone-300 italic py-2">
                No items — switch to Edit to add some.
              </p>
            )}

            {group.items.map(item => (
              <div
                key={item.key}
                className={`flex items-start gap-3.5 py-2.5 border-b border-stone-50 last:border-0 ${
                  editMode ? '' : 'cursor-pointer group'
                }`}
                onClick={editMode ? undefined : () => toggleItem(item.key)}
              >
                {/* Checkbox */}
                {!editMode && (
                  <div
                    className={`flex-shrink-0 mt-0.5 border rounded-sm flex items-center justify-center transition-all group-hover:border-amber-500 ${
                      checked[item.key]
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-stone-300'
                    }`}
                    style={{ width: 18, height: 18 }}
                  >
                    {checked[item.key] && (
                      <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                        <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Label */}
                <div className="flex-1">
                  <p
                    className={`text-sm leading-snug transition-colors ${
                      !editMode && checked[item.key]
                        ? 'text-stone-400 line-through'
                        : 'text-stone-700'
                    } ${item.isCustom ? 'italic' : ''}`}
                  >
                    {item.label}
                    {item.isCustom && (
                      <span className="ml-1.5 text-xs not-italic text-amber-500">custom</span>
                    )}
                  </p>
                  {item.sub && (
                    <p className="text-xs text-stone-400 mt-0.5">{item.sub}</p>
                  )}
                </div>

                {/* Delete button (edit mode) */}
                {editMode && (
                  <button
                    onClick={() =>
                      item.isCustom
                        ? handleRemoveCustom(item.key)
                        : handleRemoveDefault(item.key)
                    }
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 rounded transition-all"
                    title="Remove item"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* Add item input (edit mode) */}
            {editMode && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder={`Add item to ${group.label}…`}
                  value={newLabels[gi] ?? ''}
                  onChange={e => setNewLabels(prev => ({ ...prev, [gi]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddItem(gi) }}
                  className="flex-1 text-sm px-3 py-2 border border-dashed border-stone-200 bg-stone-50 text-stone-600 placeholder-stone-300 outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleAddItem(gi)}
                  disabled={!(newLabels[gi] ?? '').trim()}
                  className="px-3 py-2 text-xs tracking-wide text-white disabled:opacity-30 transition-opacity"
                  style={{ background: '#c4956a' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
