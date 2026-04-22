'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SECTIONS, type CustomConfig } from './checklistData'

async function load(weddingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('checklist_states')
    .select('state, custom_config')
    .eq('wedding_id', weddingId)
    .single()
  return {
    state: (data?.state ?? {}) as Record<string, Record<string, boolean>>,
    customConfig: (data?.custom_config ?? {}) as CustomConfig,
  }
}

async function save(
  weddingId: string,
  state: Record<string, Record<string, boolean>>,
  customConfig: CustomConfig,
) {
  const supabase = await createClient()
  await supabase.from('checklist_states').upsert({
    wedding_id: weddingId,
    state,
    custom_config: customConfig,
    updated_at: new Date().toISOString(),
  })
}

export async function removeDefaultItem(
  weddingId: string,
  slug: string,
  si: number,
  itemKey: string,
) {
  const { state, customConfig } = await load(weddingId)
  const sk = `s${si}`
  const cfg = customConfig[sk] ?? { removed: [], added: [] }
  if (!cfg.removed.includes(itemKey)) cfg.removed = [...cfg.removed, itemKey]
  if (state[sk]) delete state[sk][itemKey]
  customConfig[sk] = cfg
  await save(weddingId, state, customConfig)
  revalidatePath(`/${slug}/manage`)
}

export async function addCustomItem(
  weddingId: string,
  slug: string,
  si: number,
  gi: number,
  label: string,
  id: string,
) {
  const { state, customConfig } = await load(weddingId)
  const sk = `s${si}`
  const cfg = customConfig[sk] ?? { removed: [], added: [] }
  cfg.added = [...(cfg.added ?? []), { id, gi, label }]
  customConfig[sk] = cfg
  await save(weddingId, state, customConfig)
  revalidatePath(`/${slug}/manage`)
}

export async function removeCustomItem(
  weddingId: string,
  slug: string,
  si: number,
  itemId: string,
) {
  const { state, customConfig } = await load(weddingId)
  const sk = `s${si}`
  const cfg = customConfig[sk] ?? { removed: [], added: [] }
  cfg.added = (cfg.added ?? []).filter(a => a.id !== itemId)
  if (state[sk]) delete state[sk][itemId]
  customConfig[sk] = cfg
  await save(weddingId, state, customConfig)
  revalidatePath(`/${slug}/manage`)
}

export async function clearSectionDefaults(
  weddingId: string,
  slug: string,
  si: number,
) {
  const { state, customConfig } = await load(weddingId)
  const sk = `s${si}`
  const allDefaultKeys = SECTIONS[si].groups.flatMap((g, gi) =>
    g.items.map((_, ii) => `g${gi}_i${ii}`),
  )
  const cfg = customConfig[sk] ?? { removed: [], added: [] }
  cfg.removed = allDefaultKeys
  customConfig[sk] = cfg
  if (state[sk]) allDefaultKeys.forEach(k => delete state[sk][k])
  await save(weddingId, state, customConfig)
  revalidatePath(`/${slug}/manage`)
}

export async function resetSection(
  weddingId: string,
  slug: string,
  si: number,
) {
  const { state, customConfig } = await load(weddingId)
  const sk = `s${si}`
  delete customConfig[sk]
  delete state[sk]
  await save(weddingId, state, customConfig)
  revalidatePath(`/${slug}/manage`)
}
