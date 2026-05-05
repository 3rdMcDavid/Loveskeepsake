import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SECTIONS, sectionProgress, computeProgress, type CustomConfig } from '@/app/[slug]/manage/checklist/checklistData'
import { coupleDisplay } from '@/lib/coupleDisplay'

const INACTIVITY_DAYS = 14

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

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <p className="text-3xl font-light text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
        {value}
      </p>
      <p className="text-xs text-stone-400 mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-stone-300 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: weddings },
    { data: checklistRows },
    { data: guestRows },
    { data: cameraRows },
    { data: expenseRows },
  ] = await Promise.all([
    supabase.from('weddings').select('id, slug, partner1_name, partner2_name, family_name, couple_user_id, wedding_date, budget_ceiling, keepsake_sent_at, created_at').order('wedding_date', { ascending: true }),
    supabase.from('checklist_states').select('wedding_id, state, custom_config, updated_at'),
    supabase.from('guest_list').select('wedding_id'),
    supabase.from('guest_cameras').select('wedding_id, shots_used, device_id'),
    supabase.from('expense_items').select('wedding_id, amount'),
  ])

  const wList = weddings ?? []
  const totalWeddings = wList.length

  const today = new Date().toISOString().slice(0, 10)
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const in90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)

  // Checklist map
  const csByWedding = Object.fromEntries(
    (checklistRows ?? []).map(cs => [cs.wedding_id, cs])
  )

  function getProgress(wid: string) {
    const cs = csByWedding[wid]
    return computeProgress(
      (cs?.state ?? {}) as Record<string, Record<string, boolean>>,
      (cs?.custom_config ?? {}) as CustomConfig,
    )
  }

  // Upcoming
  const upcoming30 = wList.filter(w => w.wedding_date && w.wedding_date >= today && w.wedding_date <= in30).length
  const upcoming90 = wList.filter(w => w.wedding_date && w.wedding_date >= today && w.wedding_date <= in90).length
  const upcomingList = wList.filter(w => w.wedding_date && w.wedding_date >= today).slice(0, 6)

  // Completion
  const progressValues = wList.map(w => getProgress(w.id).pct)
  const avgCompletion = totalWeddings > 0
    ? Math.round(progressValues.reduce((a, b) => a + b, 0) / totalWeddings)
    : 0
  const completionDist = { none: 0, partial: 0, complete: 0 }
  for (const pct of progressValues) {
    if (pct === 0) completionDist.none++
    else if (pct === 100) completionDist.complete++
    else completionDist.partial++
  }

  // Guests
  const guestByWedding: Record<string, number> = {}
  for (const g of guestRows ?? []) {
    guestByWedding[g.wedding_id] = (guestByWedding[g.wedding_id] ?? 0) + 1
  }
  const totalGuests = Object.values(guestByWedding).reduce((a, b) => a + b, 0)

  // Photos + devices
  const totalPhotos = (cameraRows ?? []).reduce((s, c) => s + (c.shots_used ?? 0), 0)
  const totalDevices = new Set((cameraRows ?? []).map(c => c.device_id)).size

  // Budget
  const totalBudget = (expenseRows ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const budgetWeddingCount = new Set((expenseRows ?? []).map(e => e.wedding_id)).size

  // Inactive couples
  const inactiveList = wList.filter(w => {
    if (!w.couple_user_id) return false
    if (w.wedding_date && w.wedding_date < today) return false
    const cs = csByWedding[w.id]
    if (!cs?.updated_at) return true
    return (Date.now() - new Date(cs.updated_at).getTime()) / 86400000 > INACTIVITY_DAYS
  })

  // Keepsakes
  const keepsakeCount = wList.filter(w => w.keepsake_sent_at).length

  // Section health (original index matters for sectionProgress)
  const sectionHealth = SECTIONS
    .map((sec, si) => ({ sec, si }))
    .filter(({ sec }) => !sec.customRoute && !sec.hidden)
    .map(({ sec, si }) => {
      if (totalWeddings === 0) return { label: sec.tabLabel, icon: sec.icon, avg: 0 }
      const sum = wList.reduce((acc, w) => {
        const cs = csByWedding[w.id]
        const sp = sectionProgress(
          si,
          (cs?.state ?? {}) as Record<string, Record<string, boolean>>,
          (cs?.custom_config ?? {}) as CustomConfig,
        )
        return acc + sp.pct
      }, 0)
      return { label: sec.tabLabel, icon: sec.icon, avg: Math.round(sum / totalWeddings) }
    })
    .sort((a, b) => a.avg - b.avg)

  // Checklist insights
  const removedCounts: Record<string, { label: string; section: string; count: number }> = {}
  const addedCounts: Record<string, { label: string; count: number }> = {}
  const customizedCount = (checklistRows ?? []).filter(r => {
    const cfg = r.custom_config as CustomConfig | null
    if (!cfg) return false
    return Object.values(cfg).some(sc => sc.removed.length > 0 || sc.added.length > 0)
  }).length

  for (const row of checklistRows ?? []) {
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

  const topRemoved = Object.values(removedCounts).sort((a, b) => b.count - a.count).slice(0, 8)
  const topAdded = Object.values(addedCounts).sort((a, b) => b.count - a.count).slice(0, 8)

  return (
    <div className="px-4 py-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">Overview across all weddings</p>
        </div>
        <Link href="/admin/weddings" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          All weddings →
        </Link>
      </div>

      {totalWeddings === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No weddings yet.</p>
          <Link href="/admin/weddings/new" className="text-sm text-rose-500 hover:text-rose-700 mt-2 inline-block transition-colors">
            Create your first wedding →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard value={totalWeddings} label="Total weddings" />
            <StatCard value={upcoming90} label="Upcoming 90 days" sub={upcoming30 > 0 ? `${upcoming30} within 30 days` : undefined} />
            <StatCard value={`${avgCompletion}%`} label="Avg completion" />
            <StatCard value={totalGuests} label="Total guests" />
          </div>

          {/* Completion + Section health */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Completion distribution */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Completion Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Not started', count: completionDist.none, color: '#d9cfc4' },
                  { label: 'In progress', count: completionDist.partial, color: '#c4956a' },
                  { label: 'Complete', count: completionDist.complete, color: '#7a9e7e' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm text-stone-600 w-24 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: totalWeddings > 0 ? `${(count / totalWeddings) * 100}%` : '0%', background: color }}
                      />
                    </div>
                    <span className="text-sm text-stone-500 w-6 text-right tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section health */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">
                Section Health <span className="text-stone-300 normal-case font-normal">(avg across all weddings)</span>
              </h2>
              <div className="space-y-2">
                {sectionHealth.map(({ label, icon, avg }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-base w-5 shrink-0">{icon}</span>
                    <span className="text-sm text-stone-700 flex-1 min-w-0 truncate">{label}</span>
                    <div className="w-20 h-1.5 bg-stone-100 rounded-full shrink-0">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${avg}%`,
                          background: avg === 100 ? '#7a9e7e' : avg > 0 ? '#c4956a' : '#d9cfc4',
                        }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right tabular-nums">{avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming + Inactive */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Upcoming weddings */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Upcoming Weddings</h2>
              {upcomingList.length === 0 ? (
                <p className="text-sm text-stone-400">No upcoming weddings.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingList.map(w => {
                    const p = getProgress(w.id)
                    const daysUntil = w.wedding_date
                      ? Math.ceil((new Date(w.wedding_date).getTime() - Date.now()) / 86400000)
                      : null
                    return (
                      <Link
                        key={w.id}
                        href={`/admin/weddings/${w.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-800 truncate group-hover:text-rose-600 transition-colors">
                            {coupleDisplay(w.partner1_name, w.partner2_name, w.family_name)}
                          </p>
                          <p className="text-xs text-stone-400">
                            {w.wedding_date
                              ? new Date(w.wedding_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
                              : ''}
                            {daysUntil !== null && (
                              <span className={`ml-1.5 ${daysUntil <= 30 ? 'text-amber-500' : 'text-stone-300'}`}>
                                ({daysUntil}d)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-12 h-1 bg-stone-100 rounded-full">
                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: `${p.pct}%`,
                                background: p.pct === 100 ? '#7a9e7e' : p.pct > 0 ? '#c4956a' : '#d9cfc4',
                              }}
                            />
                          </div>
                          <span className="text-xs text-stone-400 tabular-nums w-7 text-right">{p.pct}%</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Inactive couples */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">
                Inactive {INACTIVITY_DAYS}d+
                {inactiveList.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-xs font-medium normal-case">
                    {inactiveList.length}
                  </span>
                )}
              </h2>
              {inactiveList.length === 0 ? (
                <p className="text-sm text-stone-400">All active couples are engaged.</p>
              ) : (
                <div className="space-y-3">
                  {inactiveList.map(w => {
                    const cs = csByWedding[w.id]
                    const daysSince = cs?.updated_at
                      ? Math.floor((Date.now() - new Date(cs.updated_at).getTime()) / 86400000)
                      : null
                    return (
                      <Link
                        key={w.id}
                        href={`/admin/weddings/${w.id}`}
                        className="flex items-center justify-between gap-3 group"
                      >
                        <p className="text-sm text-stone-800 truncate group-hover:text-rose-600 transition-colors">
                          {coupleDisplay(w.partner1_name, w.partner2_name, w.family_name)}
                        </p>
                        <span className="text-xs text-amber-500 shrink-0">
                          {daysSince !== null ? `${daysSince}d ago` : 'Never active'}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard value={totalPhotos} label="Photos taken" sub={totalDevices > 0 ? `${totalDevices} device${totalDevices !== 1 ? 's' : ''}` : undefined} />
            <StatCard
              value={totalBudget > 0 ? `$${Math.round(totalBudget).toLocaleString('en-US')}` : '—'}
              label="Budget tracked"
              sub={budgetWeddingCount > 0 ? `across ${budgetWeddingCount} wedding${budgetWeddingCount !== 1 ? 's' : ''}` : undefined}
            />
            <StatCard value={keepsakeCount} label="Keepsakes sent" />
            <StatCard value={customizedCount} label="Custom checklists" />
          </div>

          {/* Checklist insights */}
          {(topRemoved.length > 0 || topAdded.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Most Removed Items</h2>
                {topRemoved.length === 0 ? (
                  <p className="text-sm text-stone-400">None yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topRemoved.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-800 truncate">{item.label}</p>
                          <p className="text-xs text-stone-400">{item.section}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1 bg-stone-100 rounded-full">
                            <div className="h-1 rounded-full bg-rose-300" style={{ width: `${Math.min(100, (item.count / totalWeddings) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-stone-400 tabular-nums w-10 text-right">{item.count}/{totalWeddings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Most Added Items</h2>
                {topAdded.length === 0 ? (
                  <p className="text-sm text-stone-400">None yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topAdded.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <p className="flex-1 text-sm text-stone-800 truncate">{item.label}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1 bg-stone-100 rounded-full">
                            <div className="h-1 rounded-full bg-emerald-300" style={{ width: `${Math.min(100, (item.count / totalWeddings) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-stone-400 tabular-nums w-10 text-right">{item.count}/{totalWeddings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
