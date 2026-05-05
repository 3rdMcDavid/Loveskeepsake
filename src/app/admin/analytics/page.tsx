import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SECTIONS, type CustomConfig } from '@/app/[slug]/manage/checklist/checklistData'

function getPresetLabel(sKey: string, itemKey: string): { label: string; section: string } | null {
  const si = parseInt(sKey.slice(1))
  const sec = SECTIONS[si]
  if (!sec || sec.customRoute || sec.hidden) return null
  const m = itemKey.match(/^g(\d+)_i(\d+)$/)
  if (!m) return null
  const label = sec.groups[parseInt(m[1])]?.items[parseInt(m[2])]?.label
  if (!label) return null
  return { label, section: sec.tabLabel }
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('checklist_states')
    .select('wedding_id, custom_config')

  const totalWeddings = rows?.length ?? 0
  const customizedCount = (rows ?? []).filter(r => {
    const cfg = r.custom_config as CustomConfig | null
    if (!cfg) return false
    return Object.values(cfg).some(sc => sc.removed.length > 0 || sc.added.length > 0)
  }).length

  // Tally removed presets
  const removedCounts: Record<string, { label: string; section: string; count: number }> = {}
  // Tally added custom items
  const addedCounts: Record<string, { label: string; count: number }> = {}

  for (const row of rows ?? []) {
    const cfg = row.custom_config as CustomConfig | null
    if (!cfg) continue

    for (const [sKey, sc] of Object.entries(cfg)) {
      for (const itemKey of sc.removed) {
        const info = getPresetLabel(sKey, itemKey)
        if (!info) continue
        const k = `${sKey}::${itemKey}`
        if (!removedCounts[k]) removedCounts[k] = { ...info, count: 0 }
        removedCounts[k].count++
      }

      for (const added of sc.added) {
        const k = added.label.toLowerCase().trim()
        if (!addedCounts[k]) addedCounts[k] = { label: added.label, count: 0 }
        addedCounts[k].count++
      }
    }
  }

  const topRemoved = Object.values(removedCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const topAdded = Object.values(addedCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
        ← All weddings
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif text-stone-800">Checklist Analytics</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            {totalWeddings}
          </p>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-wide">Weddings total</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            {customizedCount}
          </p>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-wide">Have customized checklists</p>
        </div>
      </div>

      {totalWeddings === 0 || customizedCount === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-stone-400">
          <p>No checklist customizations yet.</p>
          <p className="text-sm mt-1">As couples remove or add checklist items, patterns will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Most removed preset items */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">
              Most Removed Preset Items
            </h2>
            {topRemoved.length === 0 ? (
              <p className="text-sm text-stone-400">No preset items removed yet.</p>
            ) : (
              <div className="space-y-2">
                {topRemoved.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-stone-800">{item.label}</p>
                      <p className="text-xs text-stone-400">{item.section}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1 bg-stone-100 rounded-full">
                        <div
                          className="h-1 rounded-full bg-rose-300"
                          style={{ width: `${Math.min(100, (item.count / totalWeddings) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500 w-16 text-right tabular-nums">
                        {item.count} of {totalWeddings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most added custom items */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">
              Most Added Custom Items
            </h2>
            {topAdded.length === 0 ? (
              <p className="text-sm text-stone-400">No custom items added yet.</p>
            ) : (
              <div className="space-y-2">
                {topAdded.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <p className="flex-1 text-sm text-stone-800">{item.label}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1 bg-stone-100 rounded-full">
                        <div
                          className="h-1 rounded-full bg-emerald-300"
                          style={{ width: `${Math.min(100, (item.count / totalWeddings) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-500 w-16 text-right tabular-nums">
                        {item.count} of {totalWeddings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
