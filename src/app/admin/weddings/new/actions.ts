'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createWedding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const couple_name  = formData.get('couple_name') as string
  const couple_email = formData.get('couple_email') as string || null

  // Generate unique slug from couple name
  let slug = toSlug(couple_name)
  const { count } = await supabase
    .from('weddings')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
  if (count && count > 0) slug = `${slug}-${Date.now()}`

  const { data: wedding, error } = await supabase
    .from('weddings')
    .insert({
      slug,
      partner1_name: couple_name,
      partner2_name: null,
      wedding_date: null,
      couple_email,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Send invite to the couple
  if (couple_email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    await supabase.auth.signInWithOtp({
      email: couple_email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${siteUrl}/auth/callback?next=/${slug}/welcome`,
      },
    })
  }

  redirect(`/admin/weddings/${wedding.id}`)
}
