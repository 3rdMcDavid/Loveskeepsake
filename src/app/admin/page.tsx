import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Wedding } from '@/types'
import { coupleDisplay } from '@/lib/coupleDisplay'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('*')
    .order('created_at', { ascending: false })

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
          {weddings.map((wedding: Wedding) => (
            <Link
              key={wedding.id}
              href={`/admin/weddings/${wedding.id}`}
              className="block p-5 bg-white border border-stone-200 rounded-xl hover:border-rose-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-stone-800">
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
                <div className="text-right">
                  <p className="text-xs text-stone-400">/{wedding.slug}</p>
                  {wedding.keepsake_sent_at && (
                    <span className="text-xs text-emerald-600 mt-1 block">Keepsake sent</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
