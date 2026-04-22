'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteWedding(weddingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('weddings')
    .delete()
    .eq('id', weddingId)

  if (error) throw new Error(error.message)

  redirect('/admin')
}

export async function updateWedding(weddingId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('weddings')
    .update({
      partner1_name: formData.get('partner1_name') as string,
      partner2_name: formData.get('partner2_name') as string,
      wedding_date:  formData.get('wedding_date') as string,
      venue_name:    (formData.get('venue_name') as string) || null,
      venue_address: (formData.get('venue_address') as string) || null,
      dress_code:    (formData.get('dress_code') as string) || null,
      couple_email:  (formData.get('couple_email') as string) || null,
    })
    .eq('id', weddingId)

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/weddings/${weddingId}`)
}

export async function resendInvite(weddingId: string, coupleEmail: string, slug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  await supabase.auth.signInWithOtp({
    email: coupleEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback?next=/${slug}/manage`,
    },
  })

  revalidatePath(`/admin/weddings/${weddingId}`)
}
