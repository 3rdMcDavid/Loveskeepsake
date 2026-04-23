'use client'

import { useRef, useState } from 'react'
import { saveAttireData } from './actions'

const CF = "var(--font-cormorant), 'Georgia', serif"

interface Swatch {
  id: string
  hex: string
  label: string
}

interface AttireData {
  partner1: string
  partner2: string
  bridalParty: string
  swatches: Swatch[]
}

const emptyData = (): AttireData => ({
  partner1: '', partner2: '', bridalParty: '', swatches: [],
})

interface Props {
  weddingId: string
  slug: string
  initial: AttireData | null
  partner1Label: string
  partner2Label: string
}

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

function normaliseHex(raw: string): string {
  const h = raw.startsWith('#') ? raw : `#${raw}`
  return h.toUpperCase()
}

export function AttireEditor({ weddingId, slug, initial, partner1Label, partner2Label }: Props) {
  const [data, setData] = useState<AttireData>(initial ?? emptyData())
  const [saved, setSaved] = useState(false)
  const [hexInputs, setHexInputs] = useState<Record<string, string>>(
    () => Object.fromEntries((initial?.swatches ?? []).map(s => [s.id, s.hex])),
  )
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedule(next: AttireData) {
    setData(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await saveAttireData(weddingId, slug, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  function update(field: keyof AttireData, value: string) {
    schedule({ ...data, [field]: value })
  }

  function addSwatch() {
    if (data.swatches.length >= 8) return
    const id = crypto.randomUUID()
    const newSwatch: Swatch = { id, hex: '#C4956A', label: '' }
    setHexInputs(prev => ({ ...prev, [id]: '#C4956A' }))
    schedule({ ...data, swatches: [...data.swatches, newSwatch] })
  }

  function removeSwatch(id: string) {
    schedule({ ...data, swatches: data.swatches.filter(s => s.id !== id) })
  }

  function updateSwatchColor(id: string, hex: string) {
    const normalised = normaliseHex(hex)
    setHexInputs(prev => ({ ...prev, [id]: hex }))
    if (!isValidHex(normalised)) return
    schedule({
      ...data,
      swatches: data.swatches.map(s => s.id === id ? { ...s, hex: normalised } : s),
    })
  }

  function updateSwatchLabel(id: string, label: string) {
    schedule({
      ...data,
      swatches: data.swatches.map(s => s.id === id ? { ...s, label } : s),
    })
  }

  const textareaCls =
    'w-full px-3.5 py-3 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white resize-none leading-relaxed'

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800" style={{ fontFamily: CF }}>
            Attire
          </h1>
          <p className="text-sm mt-1 italic" style={{ color: '#c4956a', fontFamily: "'Georgia', serif" }}>
            Describe your looks and compare your colour palette
          </p>
        </div>
        {saved && <span className="text-xs text-emerald-600 tracking-wide">Saved ✓</span>}
      </div>

      {/* Partner 1 */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <label className="text-xs tracking-widest uppercase text-stone-400 block mb-3">
          {partner1Label || 'Partner 1'} — Attire
        </label>
        <textarea
          className={textareaCls}
          rows={5}
          placeholder="Describe the dress, accessories, jewellery, shoes…"
          value={data.partner1}
          onChange={e => update('partner1', e.target.value)}
        />
      </div>

      {/* Partner 2 */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <label className="text-xs tracking-widest uppercase text-stone-400 block mb-3">
          {partner2Label || 'Partner 2'} — Attire
        </label>
        <textarea
          className={textareaCls}
          rows={5}
          placeholder="Describe the suit, tux, accessories, shoes…"
          value={data.partner2}
          onChange={e => update('partner2', e.target.value)}
        />
      </div>

      {/* Bridal party */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <label className="text-xs tracking-widets uppercase text-stone-400 block mb-3">
          Bridal Party
        </label>
        <textarea
          className={textareaCls}
          rows={4}
          placeholder="Bridesmaids dresses, groomsmen suits, flower girl outfits…"
          value={data.bridalParty}
          onChange={e => update('bridalParty', e.target.value)}
        />
      </div>

      {/* Colour palette */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-light text-stone-800" style={{ fontFamily: CF }}>
              Colour Palette
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">Paste hex codes to compare colours side by side</p>
          </div>
          <button
            onClick={addSwatch}
            disabled={data.swatches.length >= 8}
            className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40"
          >
            + Add colour
          </button>
        </div>

        {data.swatches.length === 0 && (
          <p className="text-sm text-stone-300 italic text-center py-4">
            No colours yet — click "Add colour" to start building your palette
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {data.swatches.map(swatch => (
            <div key={swatch.id} className="flex flex-col items-center gap-2 group">
              {/* Swatch box */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-xl shadow-sm border border-stone-200 cursor-pointer overflow-hidden"
                  style={{ background: isValidHex(swatch.hex) ? swatch.hex : '#e5e7eb' }}
                >
                  <input
                    type="color"
                    value={isValidHex(swatch.hex) ? swatch.hex : '#c4956a'}
                    onChange={e => updateSwatchColor(swatch.id, e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    title="Pick colour"
                  />
                </div>
                <button
                  onClick={() => removeSwatch(swatch.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-400 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Hex input */}
              <input
                type="text"
                value={hexInputs[swatch.id] ?? swatch.hex}
                onChange={e => updateSwatchColor(swatch.id, e.target.value)}
                maxLength={7}
                className="w-20 text-center text-xs border border-stone-200 rounded px-1 py-1 font-mono text-stone-600 focus:outline-none focus:border-stone-400 bg-transparent"
                placeholder="#000000"
              />

              {/* Label input */}
              <input
                type="text"
                value={swatch.label}
                onChange={e => updateSwatchLabel(swatch.id, e.target.value)}
                placeholder="Label"
                className="w-20 text-center text-xs border border-stone-200 rounded px-1 py-1 text-stone-600 focus:outline-none focus:border-stone-400 bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
