'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleChecklistItem(
  weddingId: string,
  slug: string,
  sectionKey: string,
  itemKey: string,
  done: boolean,
) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('checklist_states')
    .select('state')
    .eq('wedding_id', weddingId)
    .single()

  const current = (data?.state ?? {}) as Record<string, Record<string, boolean>>
  current[sectionKey] = { ...current[sectionKey], [itemKey]: done }

  await supabase.from('checklist_states').upsert({
    wedding_id: weddingId,
    state: current,
    updated_at: new Date().toISOString(),
  })

  revalidatePath(`/${slug}/manage/checklist`)
}
