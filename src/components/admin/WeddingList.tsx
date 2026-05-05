'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Wedding } from '@/types'
import { coupleDisplay } from '@/lib/coupleDisplay'

export type WeddingWithStats = {
  wedding: Wedding
  progress: { pct: number; done: number; total: number }
  guests: { total: number; confirmed: number }
  lastActivity: string | null
}

type SortKey =
  | 'created_desc'
  | 'created_asc'
  | 'pct_desc'
  | 'pct_asc'
  | 'date_asc'
  | 'date_desc'
  | 'guests_desc'

type CompletionFilter = 'all' | 'none' | 'partial' | 'complete'
type TimingFilter = 'all' | 'upcoming' | 'past'
type ActivityFilter = 'all' | 'inactive'

const INACTIVITY_DAYS = 14

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const todayStr = new Date().toISOString().slice(0, 10)

export default function WeddingList({ items }: { items: WeddingWithStats[] }) {
  const router = useRouter()

  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState<SortKey>('created_desc')
  const [completion, setCompletion] = useState<CompletionFilter>('all')
  const [timing, setTiming]         = useState<TimingFilter>('all')
  const [months, setMonths]         = useState<Set<number>>(new Set())
  const [keepsakeOnly, setKeepsake] = useState(false)
  const [activityFilter, setActivity] = useState<ActivityFilter>('all')
  const [spinning, setSpinning]     = useState(false)

  // Only show month pills for months that actually have weddings
  const availableMonths = useMemo(() => {
    const ms = new Set<number>()
    for (const { wedding } of items) {
      if (wedding.wedding_date) ms.add(new Date(wedding.wedding_date).getUTCMonth())
    }
    return Array.from(ms).sort((a, b) => a - b)
  }, [items])

  function toggleMonth(m: number) {
    setMonths(prev => {
      const next = new Set(prev)
      next.has(m) ? next.delete(m) : next.add(m)
      return next
    })
  }

  function handleRefresh() {
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 700)
  }

  function isInactive(item: WeddingWithStats): boolean {
    const { wedding, lastActivity } = item
    if (!wedding.couple_user_id) return false
    if (wedding.wedding_date && wedding.wedding_date < todayStr) return false
    if (!lastActivity) return true
    const daysSince = (Date.now() - new Date(lastActivity).getTime()) / 86_400_000
    return daysSince > INACTIVITY_DAYS
  }

  function clearFilters() {
    setSearch('')
    setCompletion('all')
    setTiming('all')
    setMonths(new Set())
    setKeepsake(false)
    setActivity('all')
  }

  const hasActiveFilters = !!(search || completion !== 'all' || timing !== 'all' || months.size > 0 || keepsakeOnly || activityFilter !== 'all')

  const filtered = useMemo(() => {
    let result = [...items]
    const q = search.trim().toLowerCase()

    if (q) {
      result = result.filter(({ wedding }) => {
        const name = coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name).toLowerCase()
        return name.includes(q) || wedding.slug.toLowerCase().includes(q)
      })
    }

    if (completion !== 'all') {
      result = result.filter(({ progress }) => {
        if (completion === 'none')     return progress.pct === 0
        if (completion === 'partial')  return progress.pct > 0 && progress.pct < 100
        if (completion === 'complete') return progress.pct === 100
        return true
      })
    }

    if (timing !== 'all') {
      result = result.filter(({ wedding }) => {
        if (!wedding.wedding_date) return timing === 'upcoming'
        return timing === 'upcoming'
          ? wedding.wedding_date >= todayStr
          : wedding.wedding_date < todayStr
      })
    }

    if (months.size > 0) {
      result = result.filter(({ wedding }) => {
        if (!wedding.wedding_date) return false
        return months.has(new Date(wedding.wedding_date).getUTCMonth())
      })
    }

    if (keepsakeOnly) {
      result = result.filter(({ wedding }) => !!wedding.keepsake_sent_at)
    }

    if (activityFilter === 'inactive') {
      result = result.filter(item => isInactive(item))
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'pct_desc':   return b.progress.pct - a.progress.pct
        case 'pct_asc':    return a.progress.pct - b.progress.pct
        case 'date_asc': {
          if (!a.wedding.wedding_date) return 1
          if (!b.wedding.wedding_date) return -1
          return a.wedding.wedding_date.localeCompare(b.wedding.wedding_date)
        }
        case 'date_desc': {
          if (!a.wedding.wedding_date) return 1
          if (!b.wedding.wedding_date) return -1
          return b.wedding.wedding_date.localeCompare(a.wedding.wedding_date)
        }
        case 'guests_desc':   return b.guests.total - a.guests.total
        case 'created_asc':   return a.wedding.created_at.localeCompare(b.wedding.created_at)
        case 'created_desc':
        default:              return b.wedding.created_at.localeCompare(a.wedding.created_at)
      }
    })

    return result
  }, [items, search, sort, completion, timing, months, keepsakeOnly, activityFilter])

  return (
    <div>
      {/* Search + refresh */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by name or slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-rose-300 placeholder:text-stone-300"
        />
        <button
          onClick={handleRefresh}
          title="Refresh"
          className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors"
        >
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.7s ease',
              transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
            }}
          >
            ↻
          </span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-600 focus:outline-none focus:border-rose-300 cursor-pointer"
        >
          <option value="created_desc">Newest added</option>
          <option value="created_asc">Oldest added</option>
          <option value="pct_desc">Progress: high → low</option>
          <option value="pct_asc">Progress: low → high</option>
          <option value="date_asc">Date: soonest first</option>
          <option value="date_desc">Date: furthest first</option>
          <option value="guests_desc">Most guests</option>
        </select>

        {/* Completion pills */}
        <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
          {(['all', 'none', 'partial', 'complete'] as CompletionFilter[]).map(v => (
            <button
              key={v}
              onClick={() => setCompletion(v)}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap ${
                completion === v
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
            >
              <span className="sm:hidden">{v === 'all' ? 'All' : v === 'none' ? 'None' : v === 'partial' ? 'Part' : 'Done'}</span>
              <span className="hidden sm:inline">{v === 'all' ? 'All' : v === 'none' ? 'Not started' : v === 'partial' ? 'In progress' : 'Complete'}</span>
            </button>
          ))}
        </div>

        {/* Timing pills */}
        <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
          {(['all', 'upcoming', 'past'] as TimingFilter[]).map(v => (
            <button
              key={v}
              onClick={() => setTiming(v)}
              className={`px-2.5 py-1.5 transition-colors ${
                timing === v
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'
              }`}
            >
              {v === 'all' ? 'All' : v === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {/* Month pills — only when multiple months exist */}
        {availableMonths.length > 1 && availableMonths.map(m => (
          <button
            key={m}
            onClick={() => toggleMonth(m)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              months.has(m)
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {MONTH_NAMES[m]}
          </button>
        ))}

        {/* Keepsake sent */}
        <button
          onClick={() => setKeepsake(v => !v)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            keepsakeOnly
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Keepsake sent ✓
        </button>

        {/* Inactive */}
        <button
          onClick={() => setActivity(v => v === 'inactive' ? 'all' : 'inactive')}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            activityFilter === 'inactive'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Inactive {INACTIVITY_DAYS}d+
        </button>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-600 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Result count */}
      {hasActiveFilters && (
        <p className="text-xs text-stone-400 mb-3">
          {filtered.length} of {items.length} wedding{items.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p>No weddings match your filters.</p>
          <button onClick={clearFilters} className="text-sm text-rose-400 hover:text-rose-600 mt-2 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const { wedding, progress, guests } = item
            const inactive = isInactive(item)
            return (
            <Link
              key={wedding.id}
              href={`/admin/weddings/${wedding.id}`}
              className={`block p-5 bg-white border rounded-xl hover:shadow-sm transition-all ${
                inactive
                  ? 'border-amber-300 hover:border-amber-400'
                  : 'border-stone-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium text-stone-800 truncate">
                    {coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
                  </h2>
                  <p className="text-sm text-stone-400 mt-0.5 truncate">
                    {wedding.wedding_date
                      ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
                        })
                      : 'Date not yet set'}
                  </p>
                  {/* Mobile badges */}
                  <div className="flex items-center gap-2 mt-1 sm:hidden">
                    {wedding.keepsake_sent_at && (
                      <span className="text-xs text-emerald-600">Keepsake sent</span>
                    )}
                    {inactive && (
                      <span className="text-xs text-amber-600">Inactive {INACTIVITY_DAYS}d+</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  {/* Progress */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="w-14 sm:w-20 h-1.5 bg-stone-100 rounded-full">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${progress.pct}%`,
                            background:
                              progress.pct === 100 ? '#7a9e7e'
                              : progress.pct > 0   ? '#c4956a'
                              : '#d9cfc4',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-stone-700 w-8 text-right tabular-nums">
                        {progress.pct}%
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 text-right">checklist</p>
                  </div>

                  {/* Guest count */}
                  <div className="text-right w-12 hidden sm:block">
                    <p className="text-sm font-medium text-stone-700 tabular-nums">
                      {guests.total > 0 ? guests.total : '—'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {guests.total > 0 ? 'guests' : 'no guests'}
                    </p>
                  </div>

                  {/* Slug + keepsake + inactive — desktop only */}
                  <div className="text-right w-36 hidden sm:block">
                    <p className="text-xs text-stone-400 font-mono">/{wedding.slug}</p>
                    {wedding.keepsake_sent_at && (
                      <span className="text-xs text-emerald-600 mt-1 block">Keepsake sent</span>
                    )}
                    {inactive && (
                      <span className="text-xs text-amber-600 mt-1 block">Inactive {INACTIVITY_DAYS}d+</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
