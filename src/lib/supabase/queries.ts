import { cache } from 'react'
import { createClient } from './server'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getWeddingBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('weddings')
    .select(
      'id, slug, family_name, partner1_name, partner2_name, couple_email, couple_user_id, wedding_date, venue_name, venue_address, dress_code, notes, venue_data, attire_data, rehearsal_data, budget_ceiling, onboarding_completed_at, plan_config'
    )
    .eq('slug', slug)
    .single()
  return data
})
