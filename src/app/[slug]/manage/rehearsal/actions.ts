'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveRehearsalData(
  weddingId: string,
  slug: string,
  data: unknown,
) {
  const supabase = await createClient()
  await supabase
    .from('weddings')
    .update({ rehearsal_data: data })
    .eq('id', weddingId)
  revalidatePath(`/${slug}/manage/rehearsal`)
}
