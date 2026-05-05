'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PlanConfig } from './checklist/checklistData'

export async function completeOnboarding(
  weddingId: string,
  slug: string,
  mode: 'preset' | 'scratch',
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('weddings')
    .update({
      onboarding_completed_at: new Date().toISOString(),
      plan_config: { mode, hiddenSections: [] } satisfies PlanConfig,
    })
    .eq('id', weddingId)

  revalidatePath(`/${slug}/manage`)
}

export async function savePlanConfig(
  weddingId: string,
  slug: string,
  config: PlanConfig,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('weddings')
    .update({ plan_config: config })
    .eq('id', weddingId)

  revalidatePath(`/${slug}/manage`)
  revalidatePath(`/${slug}/manage/settings`)
}
