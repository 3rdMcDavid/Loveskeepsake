'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGuest(weddingId: string, slug: string, fullName: string, mailingAddress: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('guest_list')
    .insert({ wedding_id: weddingId, full_name: fullName, mailing_address: mailingAddress })
    .select('id, full_name, mailing_address, rsvp_confirmed')
    .single()
  revalidatePath(`/${slug}/manage/guest-list`)
  return data
}

export async function updateGuest(
  id: string,
  slug: string,
  fields: { full_name?: string; mailing_address?: string; rsvp_confirmed?: boolean },
) {
  const supabase = await createClient()
  await supabase.from('guest_list').update(fields).eq('id', id)
  revalidatePath(`/${slug}/manage/guest-list`)
}

export async function deleteGuest(id: string, slug: string) {
  const supabase = await createClient()
  await supabase.from('guest_list').delete().eq('id', id)
  revalidatePath(`/${slug}/manage/guest-list`)
}
