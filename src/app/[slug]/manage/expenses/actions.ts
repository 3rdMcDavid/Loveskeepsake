'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveBudgetCeiling(weddingId: string, slug: string, ceiling: number | null) {
  const supabase = await createClient()
  await supabase
    .from('weddings')
    .update({ budget_ceiling: ceiling })
    .eq('id', weddingId)
  revalidatePath(`/${slug}/manage/expenses`)
}

export async function addExpenseItem(weddingId: string, slug: string, description: string, amount: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('expense_items')
    .insert({ wedding_id: weddingId, description, amount })
    .select('id, description, amount, sort_order, created_at')
    .single()
  revalidatePath(`/${slug}/manage/expenses`)
  return data
}

export async function updateExpenseItem(
  id: string,
  slug: string,
  fields: { description?: string; amount?: number },
) {
  const supabase = await createClient()
  await supabase.from('expense_items').update(fields).eq('id', id)
  revalidatePath(`/${slug}/manage/expenses`)
}

export async function deleteExpenseItem(id: string, slug: string) {
  const supabase = await createClient()
  await supabase.from('expense_items').delete().eq('id', id)
  revalidatePath(`/${slug}/manage/expenses`)
}
