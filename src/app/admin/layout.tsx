import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Couples should not be able to access the admin area
  const { data: coupleWedding } = await supabase
    .from('weddings')
    .select('slug')
    .eq('couple_user_id', user!.id)
    .single()

  if (coupleWedding) redirect(`/${coupleWedding.slug}/manage`)

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}
