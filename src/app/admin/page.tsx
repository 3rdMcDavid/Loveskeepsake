import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Wedding } from '@/types'
import { coupleDisplay } from '@/lib/coupleDisplay'
import { computeProgress, type CustomConfig } from '@/app/[slug]/manage/checklist/checklistData'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('*')
    .order('created_at', { ascending: false })

  const weddingIds = (weddings ?? []).map(w => w.id)

  let checklistByWedding: Record<string, { state: unknown; custom_config: unknown }> = {}
  let guestsByWedding: Record<string, { total: number; confirmed: number }> = {}

  if (weddingIds.length > 0) {
    const [{ data: csData }, { data: gData }] = await Promise.all([
      supabase.from('checklist_states').select('wedding_id, state, custom_config').in('wedding_id', weddingIds),
      supabase.from('guest_list').select('wedding_id, rsvp_confirmed').in('wedding_id', weddingIds),
    ])
    checklistByWedding = Object.fromEntries((csData ?? []).map(cs => [cs.wedding_id, cs]))
    for (const g of gData ?? []) {
      if (!guestsByWedding[g.wedding_id]) guestsByWedding[g.wedding_id] = { total: 0, confirmed: 0 }
      guestsByWedding[g.wedding_id].total++
      if (g.rsvp_confirmed) guestsByWedding[g.wedding_id].confirmed++
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif text-stone-800">Weddings</h1>
        <Link
          href="/admin/weddings/new"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition-colors"
        >
          + New Wedding
        </Link>
      </div>

      {!weddings || weddings.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No weddings yet.</p>
          <p className="text-sm mt-1">Create your first wedding to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {weddings.map((wedding: Wedding) => {
            const cs = checklistByWedding[wedding.id]
            const progress = computeProgress(
              (cs?.state ?? {}) as Record<string, Record<string, boolean>>,
              (cs?.custom_config ?? {}) as CustomConfig,
            )
            const guests = guestsByWedding[wedding.id] ?? { total: 0, confirmed: 0 }

            return (
              <Link
                key={wedding.id}
                href={`/admin/weddings/${wedding.id}`}
                className="block p-5 bg-white border border-stone-200 rounded-xl hover:border-rose-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-stone-800 truncate">
                      {coupleDisplay(wedding.partner1_name, wedding.partner2_name, wedding.family_name)}
                    </h2>
                    <p className="text-sm text-stone-400 mt-0.5">
                      {wedding.wedding_date
                        ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })
                        : 'Date not yet set'}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    {/* Checklist progress */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-stone-100 rounded-full">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${progress.pct}%`,
                              background: progress.pct === 100 ? '#7a9e7e' : progress.pct > 0 ? '#c4956a' : '#d9cfc4',
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
                    <div className="text-right w-14">
                      <p className="text-sm font-medium text-stone-700 tabular-nums">
                        {guests.total > 0 ? guests.total : '—'}
                      </p>
                      <p className="text-xs text-stone-400">
                        {guests.total > 0 ? 'guests' : 'no guests'}
                      </p>
                    </div>

                    {/* Slug & keepsake */}
                    <div className="text-right w-36 hidden sm:block">
                      <p className="text-xs text-stone-400 font-mono">/{wedding.slug}</p>
                      {wedding.keepsake_sent_at && (
                        <span className="text-xs text-emerald-600 mt-1 block">Keepsake sent</span>
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
