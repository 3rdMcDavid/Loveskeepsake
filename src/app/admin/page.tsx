import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Wedding } from '@/types'
import WeddingList, { type WeddingWithStats } from '@/components/admin/WeddingList'
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

  const items: WeddingWithStats[] = (weddings ?? []).map((wedding: Wedding) => {
    const cs = checklistByWedding[wedding.id]
    return {
      wedding,
      progress: computeProgress(
        (cs?.state ?? {}) as Record<string, Record<string, boolean>>,
        (cs?.custom_config ?? {}) as CustomConfig,
      ),
      guests: guestsByWedding[wedding.id] ?? { total: 0, confirmed: 0 },
    }
  })

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
        <WeddingList items={items} />
      )}
    </div>
  )
}
