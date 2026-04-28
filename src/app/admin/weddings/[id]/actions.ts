'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCredentialsEmail } from '@/lib/sendCredentialsEmail'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export async function deleteWedding(weddingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Grab the couple's auth user ID before deleting the row
  const { data: wedding } = await supabase
    .from('weddings')
    .select('couple_user_id')
    .eq('id', weddingId)
    .single()

  const { error } = await supabase
    .from('weddings')
    .delete()
    .eq('id', weddingId)

  if (error) throw new Error(error.message)

  // Delete the couple's auth account if one exists
  if (wedding?.couple_user_id) {
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(wedding.couple_user_id)
  }

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

export type ResetCredentialsResult =
  | { status: 'success'; password: string }
  | { status: 'error'; message: string }

export async function resetCredentials(
  weddingId: string,
  coupleUserId: string
): Promise<ResetCredentialsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Unauthorized' }

  const password = generatePassword()
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.updateUserById(coupleUserId, { password })
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/weddings/${weddingId}`)
  return { status: 'success', password }
}

export async function sendCredentials(email: string, slug: string, password: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  await sendCredentialsEmail({
    to: email,
    loginUrl: `${siteUrl}/${slug}/sign-in`,
    password,
  })
}
