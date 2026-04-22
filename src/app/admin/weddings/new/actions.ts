'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function toSlug(p1: string, p2: string, date: string): string {
  const year = date.slice(0, 4)
  const clean = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${clean(p1)}-${clean(p2)}-${year}`
}

export async function createWedding(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const partner1_name  = formData.get('partner1_name') as string
  const partner2_name  = formData.get('partner2_name') as string
  const wedding_date   = formData.get('wedding_date') as string
  const venue_name     = formData.get('venue_name') as string || null
  const venue_address  = formData.get('venue_address') as string || null
  const dress_code     = formData.get('dress_code') as string || null
  const couple_email   = formData.get('couple_email') as string || null

  // Generate unique slug
  let slug = toSlug(partner1_name, partner2_name, wedding_date)
  const { count } = await supabase
    .from('weddings')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
  if (count && count > 0) slug = `${slug}-${Date.now()}`

  const { data: wedding, error } = await supabase
    .from('weddings')
    .insert({ slug, partner1_name, partner2_name, wedding_date, venue_name, venue_address, dress_code, couple_email })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Send magic-link invite to the couple
  if (couple_email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    await supabase.auth.signInWithOtp({
      email: couple_email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${siteUrl}/auth/callback?next=/${slug}/manage`,
      },
    })
  }

  redirect(`/admin/weddings/${wedding.id}`)
}
