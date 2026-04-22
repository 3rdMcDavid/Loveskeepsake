import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If this user is a couple, send them to their wedding dashboard
  const { data: wedding } = await supabase
    .from('weddings')
    .select('slug')
    .eq('couple_user_id', user.id)
    .single()

  if (wedding) {
    redirect(`/${wedding.slug}/manage`)
  }

  // Otherwise assume admin
  redirect('/admin')
}
