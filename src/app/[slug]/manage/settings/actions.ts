'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWeddingDetails(weddingId: string, slug: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const partner1_name  = (formData.get('partner1_name') as string).trim() || null
  const partner2_name  = (formData.get('partner2_name') as string).trim() || null
  const wedding_date   = (formData.get('wedding_date') as string) || null
  const venue_name     = (formData.get('venue_name') as string).trim() || null
  const venue_address  = (formData.get('venue_address') as string).trim() || null
  const dress_code     = (formData.get('dress_code') as string).trim() || null
  const notes          = (formData.get('notes') as string).trim() || null

  const { error } = await supabase
    .from('weddings')
    .update({ partner1_name, partner2_name, wedding_date, venue_name, venue_address, dress_code, notes })
    .eq('id', weddingId)

  if (error) throw new Error(error.message)

  revalidatePath(`/${slug}/manage/settings`)
  revalidatePath(`/${slug}/manage`)
}
