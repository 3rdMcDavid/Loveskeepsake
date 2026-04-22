'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { SeatingTableData, Seat } from './types'
import { saveTable, deleteTable, updateTablePosition } from './actions'
import type { SeatingCanvasProps } from './SeatingCanvas'

const SeatingCanvas = dynamic<SeatingCanvasProps>(
  () => import('./SeatingCanvas').then(m => ({ default: m.SeatingCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-stone-400">Loading canvas…</span>
      </div>
    ),
  }
)

interface Props {
  slug: string
  initialTables: SeatingTableData[]
  guestNames: string[]
  coupleNames: string
}

const CF = "var(--font-cormorant), 'Georgia', serif"

function makeSeat(idx: number): Seat {
  return { id: `seat-${idx}`, name: '' }
}

interface SeatPopup {
  tableId: string
  seatIdx: number
  name: string
  /** position relative to canvas container */
  left: number
  top: number
}

export function SeatingPlanner({ slug, initialTables, guestNames, coupleNames }: Props) {
  const [tables, setTables] = useState<SeatingTableData[]>(initialTables)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'pan'>('select')
  const [stagePos, setStagePos] = useState({ x: 40, y: 40 })
  const [stageScale, setStageScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [seatPopup, setSeatPopup] = useState<SeatPopup | null>(null)
  const [tableNameEdit, setTableNameEdit] = useState('')
  const [tableSeatEdit, setTableSeatEdit] = useState('')
  const [isPending, startTransition] = useTransition()

  const canvasRef = useRef<HTMLDivElement>(null)
  const popupInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setCanvasSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (seatPopup) setTimeout(() => popupInputRef.current?.focus(), 50)
  }, [seatPopup ? seatPopup.tableId + seatPopup.seatIdx : null])

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null

  useEffect(() => {
    if (selectedTable) {
      setTableNameEdit(selectedTable.name)
      setTableSeatEdit(String(selectedTable.seatCount))
    }
  }, [selectedTableId])

  function addTable(type: 'round' | 'square') {
    const count = type === 'round' ? 8 : 6
    const tableNum = tables.length + 1
    const col = tables.length % 4
    const row = Math.floor(tables.length / 4)
    const newTable: SeatingTableData = {
      id: crypto.randomUUID(),
      type,
      name: `Table ${tableNum}`,
      x: 160 + col * 210,
      y: 150 + row * 230,
      seatCount: count,
      seats: Array.from({ length: count }, (_, i) => makeSeat(i)),
    }
    setTables(prev => [...prev, newTable])
    setSelectedTableId(newTable.id)
    setSeatPopup(null)
    startTransition(async () => { await saveTable(slug, newTable) })
  }

  function handleDeleteTable() {
    if (!selectedTableId) return
    if (!window.confirm('Delete this table and all seat assignments?')) return
    const id = selectedTableId
    setTables(prev => prev.filter(t => t.id !== id))
    setSelectedTableId(null)
    setSeatPopup(null)
    startTransition(async () => { await deleteTable(slug, id) })
  }

  function handleTableNameSave() {
    if (!selectedTable) return
    const name = tableNameEdit.trim() || selectedTable.name
    const updated = { ...selectedTable, name }
    setTables(prev => prev.map(t => t.id === selectedTable.id ? updated : t))
    startTransition(async () => { await saveTable(slug, updated) })
  }

  function handleSeatCountSave() {
    if (!selectedTable) return
    const count = Math.min(24, Math.max(1, parseInt(tableSeatEdit) || selectedTable.seatCount))
    const seats: Seat[] = Array.from({ length: count }, (_, i) =>
      selectedTable.seats[i] ?? makeSeat(i)
    )
    const updated = { ...selectedTable, seatCount: count, seats }
    setTables(prev => prev.map(t => t.id === selectedTable.id ? updated : t))
    setTableSeatEdit(String(count))
    startTransition(async () => { await saveTable(slug, updated) })
  }

  function handleSeatClick(tableId: string, seatIdx: number, clientX: number, clientY: number) {
    if (tool !== 'select') return
    const table = tables.find(t => t.id === tableId)
    if (!table) return
    const rect = canvasRef.current?.getBoundingClientRect()
    const left = rect ? clientX - rect.left : clientX
    const top = rect ? clientY - rect.top : clientY
    setSeatPopup({ tableId, seatIdx, name: table.seats[seatIdx]?.name ?? '', left, top })
  }

  function handleSeatAssign() {
    if (!seatPopup) return
    const { tableId, seatIdx, name } = seatPopup
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t
      const seats = t.seats.map((s, i) => i === seatIdx ? { ...s, name: name.trim() } : s)
      startTransition(async () => { await saveTable(slug, { ...t, seats }) })
      return { ...t, seats }
    }))
    setSeatPopup(null)
  }

  function handleSeatClear() {
    if (!seatPopup) return
    const { tableId, seatIdx } = seatPopup
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t
      const seats = t.seats.map((s, i) => i === seatIdx ? { ...s, name: '' } : s)
      startTransition(async () => { await saveTable(slug, { ...t, seats }) })
      return { ...t, seats }
    }))
    setSeatPopup(null)
  }

  function handleTableDragEnd(tableId: string, x: number, y: number) {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, x, y } : t))
    startTransition(async () => { await updateTablePosition(slug, tableId, x, y) })
  }

  const totalSeats = tables.reduce((s, t) => s + t.seatCount, 0)
  const assignedSeats = tables.reduce((s, t) => s + t.seats.filter(seat => seat.name).length, 0)

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#f0ebe5' }}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
        <Link
          href={`/${slug}/manage`}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1"
          title="Back to Planning"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="text-base font-light tracking-widest text-stone-800" style={{ fontFamily: CF }}>
          Seating Planner
        </span>
        <span className="text-stone-300 text-sm">·</span>
        <span className="text-sm italic text-stone-400" style={{ fontFamily: "'Georgia', serif" }}>
          {coupleNames}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs text-stone-400 hidden sm:flex items-center gap-3">
            <span>{tables.length} {tables.length === 1 ? 'table' : 'tables'}</span>
            <span className="w-px h-3.5 bg-stone-200" />
            <span>{assignedSeats} / {totalSeats} seats</span>
            {isPending && (
              <span className="text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Saving
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="flex-shrink-0 w-60 bg-white border-r border-stone-200 flex flex-col overflow-hidden">
          {/* Add table */}
          <div className="p-4 border-b border-stone-100">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Add Table</p>
            <button
              onClick={() => addTable('round')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-2 border border-stone-200 text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-all text-left"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Round Table
            </button>
            <button
              onClick={() => addTable('square')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-stone-200 text-sm text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-all text-left"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Square Table
            </button>
          </div>

          {/* Tool toggle */}
          <div className="p-4 border-b border-stone-100">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Tool</p>
            <div className="flex gap-1">
              {(['select', 'pan'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTool(t)}
                  className={`flex-1 py-1.5 text-xs border capitalize transition-all ${
                    tool === t
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              {tool === 'select' ? 'Click tables to select & drag. Click seats to assign.' : 'Drag canvas to pan. Scroll to zoom.'}
            </p>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">
              Tables ({tables.length})
            </p>
            {tables.length === 0 && (
              <p className="text-xs text-stone-400 italic leading-relaxed">
                No tables yet. Use the buttons above to add one.
              </p>
            )}
            <div className="space-y-1">
              {tables.map(t => {
                const assigned = t.seats.filter(s => s.name).length
                const isSelected = t.id === selectedTableId
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTableId(t.id); setSeatPopup(null) }}
                    className={`w-full text-left px-3 py-2.5 border transition-all ${
                      isSelected
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{t.name}</span>
                      <span className={`text-xs ml-2 flex-shrink-0 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        {assigned}/{t.seatCount}
                      </span>
                    </div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                      {t.type}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected table editor */}
          {selectedTable && (
            <div className="border-t border-stone-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest uppercase text-stone-400">Edit Table</p>
                <button
                  onClick={handleDeleteTable}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={tableNameEdit}
                    onChange={e => setTableNameEdit(e.target.value)}
                    onBlur={handleTableNameSave}
                    onKeyDown={e => e.key === 'Enter' && handleTableNameSave()}
                    className="w-full border border-stone-200 px-2.5 py-1.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Seats (1–24)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={tableSeatEdit}
                      onChange={e => setTableSeatEdit(e.target.value)}
                      onBlur={handleSeatCountSave}
                      onKeyDown={e => e.key === 'Enter' && handleSeatCountSave()}
                      className="flex-1 border border-stone-200 px-2.5 py-1.5 text-sm text-stone-700 outline-none focus:border-stone-500 transition-colors min-w-0"
                    />
                    <button
                      onClick={handleSeatCountSave}
                      className="px-3 py-1.5 bg-stone-800 text-white text-xs hover:bg-stone-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-30">🪑</div>
                <p className="text-sm italic text-stone-400" style={{ fontFamily: "'Georgia', serif" }}>
                  Add a table to begin arranging your seating
                </p>
              </div>
            </div>
          )}

          <SeatingCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            tables={tables}
            selectedTableId={selectedTableId}
            tool={tool}
            stagePos={stagePos}
            stageScale={stageScale}
            onStageClick={() => { setSelectedTableId(null); setSeatPopup(null) }}
            onWheelZoom={(scale, x, y) => { setStageScale(scale); setStagePos({ x, y }) }}
            onStageDragEnd={(x, y) => setStagePos({ x, y })}
            onSelectTable={id => { setSelectedTableId(id); setSeatPopup(null) }}
            onTableDragEnd={handleTableDragEnd}
            onSeatClick={handleSeatClick}
          />

          {/* Seat assignment popup */}
          {seatPopup && (
            <div
              className="absolute z-50 bg-white shadow-2xl border border-stone-200 p-4 w-60"
              style={{
                left: Math.min(seatPopup.left + 12, canvasSize.width - 256),
                top: Math.min(Math.max(seatPopup.top - 80, 8), canvasSize.height - 180),
              }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Assign Seat</p>
              <input
                ref={popupInputRef}
                type="text"
                list="seating-guest-names"
                value={seatPopup.name}
                onChange={e => setSeatPopup(p => p ? { ...p, name: e.target.value } : null)}
                onKeyDown={e => { if (e.key === 'Enter') handleSeatAssign(); if (e.key === 'Escape') setSeatPopup(null) }}
                placeholder="Type a name…"
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-stone-600 transition-colors mb-3"
              />
              <datalist id="seating-guest-names">
                {guestNames.map(n => <option key={n} value={n} />)}
              </datalist>
              <div className="flex gap-1.5">
                <button
                  onClick={handleSeatAssign}
                  className="flex-1 bg-stone-800 text-white text-xs py-2 hover:bg-stone-700 transition-colors"
                >
                  Assign
                </button>
                {seatPopup.name && (
                  <button
                    onClick={handleSeatClear}
                    className="px-3 py-2 border border-stone-200 text-xs text-stone-400 hover:text-red-500 hover:border-red-300 transition-colors"
                    title="Clear assignment"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setSeatPopup(null)}
                  className="px-2.5 py-2 border border-stone-200 text-xs text-stone-400 hover:text-stone-700 transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
