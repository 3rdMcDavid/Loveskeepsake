import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotebookClient, { type AdminNote } from '@/components/admin/NotebookClient'

export default async function NotebookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('admin_notes')
    .select('id, title, content, tags, created_at, updated_at')
    .eq('admin_user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-stone-800">Notebook</h1>
        <p className="text-sm text-stone-400 mt-1">Venues scouted, vendor notes, things to remember.</p>
      </div>
      <NotebookClient notes={(notes ?? []) as AdminNote[]} />
    </div>
  )
}
